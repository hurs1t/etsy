import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AirtableModule } from './modules/airtable/airtable.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { AiContentModule } from './modules/ai-content/ai-content.module';
import { ImagesModule } from './modules/images/images.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { EtsyModule } from './modules/etsy/etsy.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    AppConfigModule,
    AirtableModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    ScraperModule,
    AiContentModule,
    ImagesModule,
    SupabaseModule,
    EtsyModule,
    PaymentsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
