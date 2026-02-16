import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsString()
    @IsOptional()
    generatedTitle?: string;

    @IsString()
    @IsOptional()
    generatedDescription?: string;

    @IsArray()
    @IsOptional()
    generatedTags?: string[];

    @IsEnum(['draft', 'ready', 'published', 'failed'])
    @IsOptional()
    status?: 'draft' | 'ready' | 'published' | 'failed';

    @IsString()
    @IsOptional()
    etsyListingId?: string;

    @IsArray()
    @IsOptional()
    images?: string[];
}
