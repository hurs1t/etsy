import { Injectable, BadRequestException } from '@nestjs/common';
import { AliexpressScraper } from './providers/aliexpress.scraper';
import { ScrapeProductDto } from './dto/scrape-product.dto';

@Injectable()
export class ScraperService {
    constructor(private readonly aliexpressScraper: AliexpressScraper) { }

    async scrapeProduct(scrapeProductDto: ScrapeProductDto) {
        const { url } = scrapeProductDto;

        if (url.includes('aliexpress.com')) {
            try {
                return await this.aliexpressScraper.scrape(url);
            } catch (error) {
                if (error.message.includes('blocked') || error.message.includes('security check')) {
                    throw new BadRequestException('AliExpress blocked the request. Please use the Chrome Extension to import this product.');
                }
                throw error;
            }
        }

        throw new BadRequestException('Unsupported platform. Only AliExpress is supported for now.');
    }
}
