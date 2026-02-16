import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { AliexpressScraper } from './providers/aliexpress.scraper';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { AiContentModule } from '../ai-content/ai-content.module';

@Module({
    imports: [ProductsModule, UsersModule, AiContentModule],
    controllers: [ScraperController],
    providers: [ScraperService, AliexpressScraper],
})
export class ScraperModule { }
