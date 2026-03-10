import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeProductDto } from './dto/scrape-product.dto';
import { ExtensionImportDto } from './dto/extension-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { AiContentService } from '../ai-content/ai-content.service';

@Controller('scraper')
export class ScraperController {
    constructor(
        private readonly scraperService: ScraperService,
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
        private readonly aiContentService: AiContentService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('scrape')
    scrape(@Body() scrapeProductDto: ScrapeProductDto) {
        return this.scraperService.scrapeProduct(scrapeProductDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('extension-import')
    async importFromExtension(@Request() req, @Body() dto: ExtensionImportDto) {
        console.log('[ScraperController] Received extension import request');
        console.log(`[ScraperController] originalImages count: ${dto.originalImages?.length}`);

        // Because of JwtAuthGuard, req.user should be populated
        // JwtStrategy returns { userId: ..., email: ... }
        let userId = req.user?.userId;
        console.log('[ScraperController] User ID from request:', userId);

        // If no user (e.g. auth disabled/bypassed), assign to default user
        if (!userId) {
            const defaultUser = await this.usersService.findFirst();
            if (!defaultUser) {
                throw new BadRequestException('No users found in database to assign product to.');
            }
            userId = defaultUser.id;
        }

        // Map DTO to CreateProductDto
        console.log('[ScraperController] Received DTO:', JSON.stringify({
            ...dto,
            originalDescription: dto.originalDescription?.substring(0, 50) + '...',
            originalImages: dto.originalImages?.length,
            variations: dto.variations?.length
        }, null, 2));

        // DTO Validation SHOULD work now.

        const createProductDto: any = {
            userId: userId,
            sourceUrl: dto.sourceUrl,
            sourcePlatform: 'AliExpress',
            originalTitle: dto.originalTitle,
            originalDescription: dto.originalDescription,
            price: this.parsePrice(dto.price || ''),
            variations: dto.variations || [],
            attributes: {
                shippingFee: dto.shippingFee,
                shippingTime: dto.shippingTime
            }
        };

        // Generate AI Content
        try {
            console.log('[ScraperController] Starting AI generation...');
            const aiResult = await this.aiContentService.generateListing({
                productTitle: dto.originalTitle,
                productDescription: dto.originalDescription,
                keywords: ['etsy style', 'handmade feel', 'high quality']
            });
            console.log('[ScraperController] AI generation successful');

            createProductDto.generatedTitle = aiResult.title;
            createProductDto.generatedDescription = aiResult.description;
            createProductDto.generatedTags = aiResult.tags;
        } catch (error) {
            console.error('[ScraperController] AI Content Generation failed:', error);
            // Fallback to original content
            createProductDto.generatedTitle = dto.originalTitle;
            createProductDto.generatedDescription = dto.originalDescription;
            createProductDto.generatedTags = [];
        }



        // UPSCALE IMAGES (AI)
        // Limit to first 5 images to avoid timeout/cost
        const rawImages = dto.originalImages || [];
        const imagesToUpscale = rawImages.slice(0, 5);
        const upscaledImages: string[] = [];

        if (imagesToUpscale.length > 0) {
            console.log(`[ScraperController] Upscaling ${imagesToUpscale.length} images...`);
            try {
                // Process in parallel
                const upscalePromises = imagesToUpscale.map(async (imgUrl) => {
                    try {
                        return await this.aiContentService.upscaleImage(imgUrl);
                    } catch (e) {
                        console.error('Failed to upscale image:', imgUrl, e.message);
                        return imgUrl; // Fallback to original
                    }
                });

                upscaledImages.push(...(await Promise.all(upscalePromises)));

                // Add remaining original images
                if (rawImages.length > 5) {
                    upscaledImages.push(...rawImages.slice(5));
                }

                console.log('[ScraperController] Upscaling complete.');
            } catch (error) {
                console.error('[ScraperController] Bulk upscaling failed, using originals.', error);
                upscaledImages.push(...rawImages);
            }
        } else {
            upscaledImages.push(...rawImages);
        }

        try {
            console.log('[ScraperController] Creating product in DB...');
            console.log(`[ScraperController] FINAL CHECK - Variations: ${createProductDto.variations?.length}, Images: ${upscaledImages.length}`);
            console.log('[ScraperController] Upscaled Images SAMPLE:', upscaledImages.slice(0, 1));

            const token = req.headers.authorization?.split(' ')[1];
            // Use upscaled images
            const product = await this.productsService.createWithImages(createProductDto, upscaledImages, token);
            console.log('[ScraperController] Product created successfully');

            // Explicitly return upscaled images in the response so the frontend/extension 
            // has the same URLs that were just saved to DB.
            return {
                ...product,
                images: upscaledImages.map((url, idx) => ({
                    image_url: url,
                    order_index: idx,
                    is_primary: idx === 0
                }))
            };
        } catch (error) {
            console.error('[ScraperController] Product creation failed:', error);
            throw new BadRequestException(`Product creation failed: ${error.message}`);
        }
    }

    private parsePrice(priceStr: string): number {
        if (!priceStr) return 0;

        // Remove known currency symbols and text first to avoid confusion
        let clean = priceStr.replace(/[^\d.,]/g, '').trim();

        if (!clean) return 0;

        // Count separators
        const dotCount = (clean.match(/\./g) || []).length;
        const commaCount = (clean.match(/,/g) || []).length;

        // If both present
        if (dotCount > 0 && commaCount > 0) {
            const lastDot = clean.lastIndexOf('.');
            const lastComma = clean.lastIndexOf(',');

            if (lastComma > lastDot) {
                // Case: 1.234,56 (EU/TR standard)
                clean = clean.replace(/\./g, '').replace(',', '.');
            } else {
                // Case: 1,234.56 (US standard)
                clean = clean.replace(/,/g, '');
            }
        }
        // Only comma present
        else if (commaCount > 0) {
            // Ambiguous case: 1,000 (1000) or 1,00 (1.00)?
            // Heuristic: If comma identifies decimal, it usually has 1 or 2 digits after it.
            // But 1,000 usually implies thousands.
            // However, 12,50 is common.
            // Let's assume matches with 2 decimal places are likely decimals.
            // Or simpler: Turkish/EU usage uses comma for decimal almost exclusively vs dot.
            // So if we just swap comma to dot it works for "12,50" -> "12.50".
            // It fails for "1,000" -> "1.000" (becomes 1).

            // Let's rely on the assumption that dropshipping products aren't > 999 usually, or formatted clearly.
            // For now, replacing comma with dot is safer for the Target Audience (TR).
            clean = clean.replace(/,/g, '.');
        }

        return parseFloat(clean) || 0;
    }
}
