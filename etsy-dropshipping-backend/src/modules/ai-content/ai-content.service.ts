import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateContentDto } from './dto/generate-content.dto';

@Injectable()
export class AiContentService {
    private openai: OpenAI;
    private readonly logger = new Logger(AiContentService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        } else {
            this.logger.warn('OPENAI_API_KEY is not defined');
        }
    }

    async generateListing(dto: GenerateContentDto) {
        if (!this.openai) {
            throw new InternalServerErrorException('OpenAI API Key not configured');
        }

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert Etsy SEO copywriter. Rewrite the product title and description to be highly converting and SEO-optimized. Rules: 1) Title must be between 130-150 characters, using high-volume keywords. 2) Description must be natural, descriptive, and avoid robotic or salesy language like 'guaranteed', 'best ever'. 3) Generate exactly 13 relevant, high-traffic Etsy tags. IMPORTANT: Each tag MUST be 15 characters or less. 4) Return strictly a JSON object with keys: 'title' (string), 'description' (string), 'tags' (array of strings). Do not include any markdown formatting."
                    },
                    {
                        role: "user",
                        content: `Product Title: ${dto.productTitle}\n\nDescription: ${dto.productDescription || ''}\n\nKeywords: ${dto.keywords?.join(', ') || ''}`
                    }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                throw new Error('No content generated');
            }

            return JSON.parse(content);
        } catch (error) {
            this.logger.error(`AI Generation failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to generate content');
        }
    }

    async upscaleImage(imageUrl: string): Promise<string> {
        const falKey = this.configService.get<string>('FAL_KEY');
        if (!falKey) {
            throw new InternalServerErrorException('FAL_KEY is not configured');
        }

        try {
            this.logger.log(`Upscaling image: ${imageUrl}. Checking Fal Key: ${falKey ? 'Present' : 'Missing'}`);

            // Dynamic import because @fal-ai/serverless-client is ESM
            const fal = await import('@fal-ai/serverless-client');

            fal.config({
                credentials: falKey
            });

            const { result } = await fal.subscribe('fal-ai/esrgan', {
                input: {
                    image_url: imageUrl,
                    scale: 2
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === 'IN_PROGRESS') {
                        update.logs.map((log) => log.message).forEach(console.log);
                    }
                },
            }) as any;

            if (result && result.image && result.image.url) {
                return result.image.url;
            }

            throw new Error('No image URL in result');
        } catch (error) {
            this.logger.error(`Fal.ai Upscaling failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to upscale image');
        }
    }
}
