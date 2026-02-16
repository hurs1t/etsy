import { Module } from '@nestjs/common';
import { EtsyService } from './etsy.service';
import { EtsyController } from './etsy.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [HttpModule, ConfigModule, ProductsModule, UsersModule],
    controllers: [EtsyController],
    providers: [EtsyService],
    exports: [EtsyService],
})
export class EtsyModule { }
