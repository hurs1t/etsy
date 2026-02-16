import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AiContentService } from './ai-content.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-content')
@UseGuards(JwtAuthGuard)
export class AiContentController {
    constructor(private readonly aiContentService: AiContentService) { }

    @Post('generate')
    generate(@Body() generateContentDto: GenerateContentDto) {
        return this.aiContentService.generateListing(generateContentDto);
    }

    @Post('upscale')
    async upscale(@Body() body: { imageUrl: string }) {
        if (!body.imageUrl) {
            throw new BadRequestException('Image URL is required');
        }
        const newUrl = await this.aiContentService.upscaleImage(body.imageUrl);
        return { url: newUrl };
    }
}
