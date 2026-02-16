import { Module } from '@nestjs/common';
import { AiContentService } from './ai-content.service';
import { AiContentController } from './ai-content.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [AiContentController],
    providers: [AiContentService],
    exports: [AiContentService],
})
export class AiContentModule { }
