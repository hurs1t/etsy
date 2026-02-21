import { Controller, Get, Post, Param, UseGuards, Res, Query, Req, Body, Logger, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { EtsyService } from './etsy.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('etsy')
export class EtsyController {
    private readonly logger = new Logger(EtsyController.name);

    constructor(
        private readonly etsyService: EtsyService,
        private readonly usersService: UsersService,
        private readonly productsService: ProductsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('auth')
    async getAuthUrl(@Req() req, @Res() res: Response) {
        this.logger.log(`Generating Etsy Auth URL for user: ${req.user.email}`);
        const { verifier, challenge, state } = this.etsyService.generateAuthParams();
        const url = this.etsyService.getAuthUrl(challenge, state);

        this.logger.log(`Setting cookies: verifier and user_email (${req.user.email})`);

        res.cookie('etsy_verifier', verifier, {
            httpOnly: true,
            secure: false, // Localhost
            maxAge: 300000,
            path: '/',
            sameSite: 'lax'
        });

        res.cookie('etsy_user_email', req.user.email, {
            httpOnly: true,
            secure: false, // Localhost
            maxAge: 300000,
            path: '/',
            sameSite: 'lax'
        });

        this.logger.log(`Redirecting to Etsy Auth URL: ${url}`);
        return res.json({ url });
    }

    // Etsy calls this with ?code=...&state=...
    @Get('callback')
    async callback(@Query('code') code: string, @Query('state') state: string, @Req() req, @Res() res: Response) {
        try {
            this.logger.log(`Callback received. Code: ${code ? 'Yes' : 'No'}, State: ${state}`);
            this.logger.log(`Cookies received keys: ${Object.keys(req.cookies).join(', ')}`);

            const verifier = req.cookies['etsy_verifier'];
            if (!verifier) {
                this.logger.error('No verifier found in cookies');
                return res.redirect('http://localhost:3000/settings?error=no_verifier');
            }

            const tokenData = await this.etsyService.getAccessToken(code, verifier);

            this.logger.log(`Token Data Received: ${JSON.stringify(tokenData)}`);

            // user_id is null in the token response, so we must fetch it.
            // Delegate back to service.
            const shopId = await this.etsyService.getShop(tokenData.access_token);

            // Fetch User
            const userEmail = req.cookies['etsy_user_email'];
            let user: any = null;

            if (userEmail) {
                this.logger.log(`Found etsy_user_email cookie: ${userEmail}. Updating this user.`);
                user = await this.usersService.findOne(userEmail);
            } else {
                this.logger.warn('No etsy_user_email cookie found. Falling back to findFirst() (Risk: Wrong User)');
                user = await this.usersService.findFirst();
            }

            if (user) {
                this.logger.log(`Updating Etsy tokens for user: ${user.email} (ID: ${user.id})`);
                await this.usersService.updateEtsyTokens(user.id, {
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in,
                    shop_id: shopId
                });
            } else {
                this.logger.error('No user found to update tokens for!');
            }

            return res.redirect('http://localhost:3000/settings?success=etsy_connected');

        } catch (error) {
            this.logger.error('Callback error', error);
            return res.redirect('http://localhost:3000/settings?error=callback_failed');
        }
    }

    private async executeWithRefresh<T>(req: any, operation: (accessToken: string) => Promise<T>): Promise<T> {
        const user = await this.usersService.findOne(req.user.email);
        if (!user) throw new Error('User not found');
        if (!user.etsy_access_token) throw new InternalServerErrorException('Etsy not connected');

        try {
            return await operation(user.etsy_access_token);
        } catch (error: any) {
            // Check for 401 or invalid_token
            if (error.response?.status === 401 || error.response?.data?.error === 'invalid_token' || error.message.includes('expired')) {
                this.logger.warn(`Access Token expired for user ${user.email}. Refreshing...`);

                if (!user.etsy_refresh_token) {
                    this.logger.error('No refresh token available');
                    throw new UnauthorizedException('Etsy session expired. Please reconnect.');
                }

                try {
                    const newTokens = await this.etsyService.refreshAccessToken(user.etsy_refresh_token);

                    // Update DB
                    await this.usersService.updateEtsyTokens(user.id, {
                        access_token: newTokens.access_token,
                        refresh_token: newTokens.refresh_token,
                        expires_in: newTokens.expires_in
                    });
                    this.logger.log('Token refreshed and saved. Retrying operation...');

                    // Retry
                    return await operation(newTokens.access_token);

                } catch (refreshError) {
                    this.logger.error('Failed to refresh token', refreshError);
                    throw new UnauthorizedException('Etsy connection lost. Please reconnect in settings.');
                }
            }
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('shipping-profiles')
    async getShippingProfiles(@Req() req) {
        return this.executeWithRefresh(req, async (accessToken) => {
            const user = await this.usersService.findOne(req.user.email);
            if (!user.shop_id) return [];
            return this.etsyService.getShippingProfiles(accessToken, user.shop_id);
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('publish/:id')
    async publishProduct(@Param('id') id: string, @Body('imageIds') imageIds: string[], @Req() req) {
        return this.executeWithRefresh(req, async (accessToken) => {
            // 1. Get User & Shop ID (accessToken is already provided by executeWithRefresh)
            const user = await this.usersService.findOne(req.user.email);
            if (!user.shop_id) throw new InternalServerErrorException('Etsy Shop ID missing');

            // 2. Get Product Data
            const product = await this.productsService.findOne(id);
            if (!product) throw new NotFoundException('Product not found');

            this.logger.log(`[EtsyController] Publishing Product ${id}. Shipping Profile ID: ${product.shippingProfileId}`);

            // 3. Create Draft Listing
            const draft = await this.etsyService.createDraftListing(user.shop_id, product, accessToken);
            const listingId = draft.listing_id;

            // 4. Upload Images (Limit to 10 - Etsy max)
            if (product.images && product.images.length > 0) {
                let imagesToUpload = product.images;

                // Filter by selected IDs if provided
                if (imageIds && imageIds.length > 0) {
                    this.logger.log(`Filtering images. Selected IDs: ${imageIds.length}`);
                    imagesToUpload = product.images.filter(img => imageIds.includes(img.id));
                }

                // Slice to ensure we don't exceed Etsy limit (10)
                imagesToUpload = imagesToUpload.slice(0, 10);

                this.logger.log(`Uploading ${imagesToUpload.length} images.`);

                for (const img of imagesToUpload) {
                    // Handle both string and object formats (product_images table uses image_url)
                    const url = typeof img === 'string' ? img : img.image_url;

                    this.logger.log(`Uploading Image. Raw: ${typeof img === 'object' ? JSON.stringify(img) : img}, Extracted URL: ${url}`);

                    if (url) {
                        const result = await this.etsyService.uploadListingImage(user.shop_id, listingId.toString(), url, accessToken);
                        this.logger.log(`Upload Result: ${result ? 'Success' : 'Failed'}`);
                    } else {
                        this.logger.warn('Skipping image with no URL');
                    }
                }
            }

            // 5. Update Inventory (Variations)
            if (product.variations && product.variations.length > 0) {
                await this.etsyService.updateInventory(user.shop_id, listingId.toString(), product.variations, parseFloat(product.price), accessToken);
            }

            // 6. Save State
            await this.productsService.update(id, {
                etsyListingId: listingId.toString(),
                status: 'published' // or 'draft' on Etsy side, but 'published' here means synced
            });

            return { success: true, listingId, url: draft.url };
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('disconnect')
    async disconnect(@Req() req) {
        const user = await this.usersService.findOne(req.user.email);
        if (user) {
            await this.usersService.updateEtsyTokens(user.id, {
                access_token: null,
                refresh_token: null,
                expires_in: null,
                shop_id: null
            });
        }
        return { success: true };
    }

    @UseGuards(JwtAuthGuard)
    @Get('taxonomy')
    async getTaxonomyNodes(@Req() req) {
        return this.executeWithRefresh(req, async (accessToken) => {
            return this.etsyService.getTaxonomyNodes(accessToken);
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('taxonomy/:id/properties')
    async getTaxonomyProperties(@Param('id') id: string, @Req() req) {
        return this.executeWithRefresh(req, async (accessToken) => {
            return this.etsyService.getTaxonomyProperties(parseInt(id), accessToken);
        });
    }
}
