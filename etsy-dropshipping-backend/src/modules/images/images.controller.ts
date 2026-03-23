import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Body, Delete, Param, Patch, Logger, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiContentService } from '../ai-content/ai-content.service';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImagesController {
    constructor(
        private readonly imagesService: ImagesService,
        private readonly aiContentService: AiContentService
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any) {
        return this.imagesService.uploadImage(file);
    }

    @Post('upload-url')
    async uploadUrl(@Body('url') url: string) {
        return this.imagesService.uploadFromUrl(url);
    }
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.imagesService.deleteImage(id);
    }

    @Patch(':id/reorder')
    async reorder(@Param('id') id: string, @Body('orderIndex') orderIndex: number) {
        return this.imagesService.reorderImages(id, orderIndex);
    }

    @Post(':id/upscale')
    async upscaleImage(@Param('id') id: string) {
        // 1. Get current image URL
        const image = await this.imagesService.getImage(id);
        if (!image || !image.image_url) {
            throw new BadRequestException('Image not found or has no URL');
        }

        // 2. Call AI Service
        try {
            const newUrl = await this.aiContentService.upscaleImage(image.image_url);

            // 3. Update DB
            await this.imagesService.updateImageUrl(id, newUrl);

            return { url: newUrl };
        } catch (error) {
            Logger.error(`Failed to upscale image ${id}: ${error.message}`);
            throw new BadRequestException(`Upscaling failed: ${error.message}`);
        }
    }

    @Post('bulk-upscale')
    async bulkUpscaleImages(@Body('ids') ids: string[]) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new BadRequestException('No image IDs provided');
        }

        const results: any[] = [];
        for (const id of ids) {
            try {
                const image = await this.imagesService.getImage(id);
                if (image && image.image_url) {
                    const newUrl = await this.aiContentService.upscaleImage(image.image_url);
                    await this.imagesService.updateImageUrl(id, newUrl);
                    results.push({ id, url: newUrl, success: true });
                }
            } catch (error) {
                Logger.error(`Failed to upscale image ${id} in bulk: ${error.message}`);
                results.push({ id, success: false, error: error.message });
            }
        }

        return results;
    }
}
