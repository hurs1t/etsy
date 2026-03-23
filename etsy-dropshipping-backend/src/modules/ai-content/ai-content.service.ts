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
                        ${!dto.fields || dto.fields.includes('description') ? `2. **Description**: ${dto.tone ? `Use a **${dto.tone}** tone.` : 'Playful, engaging tone with EMOJIS! 🎨✨.'} Natural language. **DO NOT INCLUDE PRICE**. English only. ${dto.sensitivity === 'Aggressive Ranking' ? 'Focus on high-volume, competitive keywords.' : ''}` : ''}
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
        this.logger.log(`Upscaling image locally using Sharp: ${imageUrl}`);

        try {
            // 1. Fetch the image buffer
            const axios = await import('axios');
            const response = await axios.default.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);

            // 2. Process with Sharp (2x upscale with Lanczos3 + Sharpen)
            const sharp = await import('sharp');
            const metadata = await sharp.default(buffer).metadata();
            const processedBuffer = await sharp.default(buffer)
                .resize({
                    width: metadata.width ? metadata.width * 2 : undefined,
                    height: metadata.height ? metadata.height * 2 : undefined,
                    kernel: 'lanczos3'
                })
                .sharpen({
                    sigma: 1.0,
                    m1: 1.0,
                    m2: 1.0
                })
                .toBuffer();

            // 3. Return as Base64 Data URI (Free, Local, No API Keys needed)
            const base64 = processedBuffer.toString('base64');
            return `data:image/png;base64,${base64}`;

        } catch (error) {
            this.logger.error(`Local Upscaling failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to upscale image locally');
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

    async translateListing(product: { title: string, description: string, tags: string[] }, targetLanguage: string) {
        if (!this.openai) {
            throw new InternalServerErrorException('OpenAI API Key not configured');
        }

        const languageNames: Record<string, string> = {
            'nl': 'Dutch',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'es': 'Spanish'
        };

        const langName = languageNames[targetLanguage] || targetLanguage;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert translator specializing in Etsy SEO listings. 
                        Translate the following product title, description, and tags into ${langName}.
                        
                        RULES:
                        1. **Title**: SEO optimized, natural, < 140 chars.
                        2. **Description**: Maintain the tone and emojis. NO PRICE.
                        3. **Tags**: Translate each tag. Each tag MUST be 20 characters or less. Maximum 13 tags.
                        
                        Return strictly a JSON object with keys: 'title', 'description', 'tags'.`
                    },
                    {
                        role: "user",
                        content: `Title: ${product.title}\n\nDescription: ${product.description}\n\nTags: ${product.tags.join(', ')}`
                    }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error('No content generated');

            const result = JSON.parse(content);
            if (result.tags) {
                result.tags = this.validateAndFixTags(result.tags);
            }
            if (result.title && result.title.length > 140) {
                result.title = result.title.substring(0, 137) + '...';
            }
            return result;
        } catch (error) {
            this.logger.error(`Translation to ${langName} failed: ${error.message}`);
            throw new InternalServerErrorException(`Failed to translate content to ${langName}`);
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
