import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AirtableModule } from '../airtable/airtable.module';
import { AiContentModule } from '../ai-content/ai-content.module';

@Module({
    imports: [AirtableModule, AiContentModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule { }
