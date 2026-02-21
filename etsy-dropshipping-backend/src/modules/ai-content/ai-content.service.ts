import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateContentDto } from './dto/generate-content.dto';
import { SeoAnalysisDto } from './dto/seo-analysis.dto';

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
        this.logger.log(`generateListing called with: ${JSON.stringify(dto)}`);

        if (!this.openai) {
            this.logger.error('OpenAI instance is not initialized');
            throw new InternalServerErrorException('OpenAI API Key not configured');
        }

        try {
            this.logger.log('Sending request to OpenAI...');
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert Etsy SEO copywriter. Rewrite the product title and description to be highly converting and SEO-optimized. 
                        
                        STRICT RULES:
                        ${!dto.fields || dto.fields.includes('title') ? '1. **Title**: MUST be long and keyword-rich (Etsy SEO optimized). Contains main keywords. English only.' : ''}
                        ${!dto.fields || dto.fields.includes('description') ? '2. **Description**: Playful, engaging tone with EMOJIS! 🎨✨. Natural language. **DO NOT INCLUDE PRICE**. English only.' : ''}
                        ${!dto.fields || dto.fields.includes('tags') ? '3. **Tags**: Generate EXACTLY 13 tags. Each tag MUST be 20 characters or less. No hashtags. Return as a JSON Array of strings.' : ''}
                        
                        Return strictly a JSON object with ONLY the keys requested: ${dto.fields ? dto.fields.join(', ') : "'title', 'description', 'tags'"}. Do not include any markdown formatting.`
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
            this.logger.log(`OpenAI Response: ${content}`);

            if (!content) {
                throw new Error('No content generated');
            }

            let result;
            try {
                result = JSON.parse(content);
            } catch (e) {
                this.logger.error(`Failed to parse JSON: ${content}`);
                throw new InternalServerErrorException('Invalid JSON from OpenAI');
            }

            if (result.tags) {
                // Handle string tags (comma separated) fallback
                if (typeof result.tags === 'string') {
                    result.tags = result.tags.split(',').map(t => t.trim());
                }
                result.tags = this.validateAndFixTags(result.tags);
            }

            if (result.title && result.title.length > 140) {
                result.title = result.title.substring(0, 137) + '...';
            }

            this.logger.log('Generation successful');
            return result;
        } catch (error) {
            this.logger.error(`AI Generation failed: ${error.message}`, error.stack);
            if (error.response) {
                this.logger.error(`OpenAI Error Response: ${JSON.stringify(error.response.data)}`);
            }
            throw new InternalServerErrorException(`Failed to generate content: ${error.message}`);
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

    async analyzeSeo(dto: SeoAnalysisDto) {
        if (!this.openai) {
            throw new InternalServerErrorException('OpenAI API Key not configured');
        }

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert Etsy SEO analyst. 
                        Evaluate the product listing based on Etsy's latest algorithm (2024/2025).
                        
                        SCORING CRITERIA:
                        1. Title: Keyword-rich? Long (but <140 chars)? English?
                        2. Description: Playful & Emojis? No Price mentioned?
                        3. Tags: Are there 10 tags? <15 chars each? No hashtags?
                        
                        OUTPUT JSON FORMAT:
                        {
                            "score": number (0-100),
                            "issues": [{ "type": "error"|"warning"|"info", "message": "string" }],
                            "recommendations": ["string"],
                            "optimizedTitle": "string (optional suggestion)",
                            "optimizedDescription": "string (optional suggestion)",
                            "optimizedTags": ["string"]
                        }
                        
                        STRICT OPTIMIZATION RULES (for optimized* fields):
                        - optimizedTitle: Long, keyword-rich, English, < 140 chars.
                        - optimizedTags: MUST strictly be 10 tags. Each tag MUST be < 15 characters. No hashtags.
                        - optimizedDescription: Playful, emojis, English, NO PRICE.
                        
                        Be strict but helpful. If tags are missing, score should be low.`
                    },
                    {
                        role: "user",
                        content: JSON.stringify(dto)
                    }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error('No content generated');

            const result = JSON.parse(content);
            if (result.optimizedTags) {
                result.optimizedTags = this.validateAndFixTags(result.optimizedTags);
            }
            if (result.optimizedTitle && result.optimizedTitle.length > 140) {
                result.optimizedTitle = result.optimizedTitle.substring(0, 137) + '...';
            }
            return result;
        } catch (error) {
            this.logger.error(`SEO Analysis failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to analyze SEO');
        }
    }

    private validateAndFixTags(tags: string[]): string[] {
        if (!Array.isArray(tags)) return [];
        // Filter tags > 20 chars (Etsy rule)
        let validTags = tags.map(t => t.trim()).filter(t => t.length <= 20 && t.length > 0);

        // Remove duplicates
        validTags = [...new Set(validTags)];

        // Enforce max 13 (Etsy rule)
        if (validTags.length > 13) {
            validTags = validTags.slice(0, 13);
        }
        return validTags;
    }
}
