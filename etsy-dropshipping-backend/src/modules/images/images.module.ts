import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';
import { AiContentModule } from '../ai-content/ai-content.module';

@Module({
    imports: [ConfigModule, AiContentModule],
    controllers: [ImagesController],
    providers: [CloudinaryProvider, ImagesService],
    exports: [ImagesService],
})
export class ImagesModule { }
