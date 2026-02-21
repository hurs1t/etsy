import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsObject, IsUrl } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    originalTitle?: string;

    @IsString()
    @IsOptional()
    originalDescription?: string;

    @IsString()
    @IsOptional()
    generatedTitle?: string;

    @IsString()
    @IsOptional()
    generatedDescription?: string;

    @IsArray()
    @IsOptional()
    generatedTags?: string[];

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsEnum(['draft', 'ready', 'published', 'failed'])
    @IsOptional()
    status?: 'draft' | 'ready' | 'published' | 'failed';

    @IsString()
    @IsOptional()
    etsyListingId?: string;

    @IsString()
    @IsOptional()
    shippingProfileId?: string;

    @IsNumber()
    @IsOptional()
    taxonomyId?: number;

    @IsObject()
    @IsOptional()
    attributes?: Record<string, any>;

    @IsArray()
    @IsOptional()
    images?: string[];
}
