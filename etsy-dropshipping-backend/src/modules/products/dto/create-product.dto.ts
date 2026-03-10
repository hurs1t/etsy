import { IsString, IsOptional, IsNumber, IsUrl, IsEnum, IsArray, IsObject } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsOptional()
    userId: string; // Will be injected from auth token

    @IsUrl()
    sourceUrl: string;

    @IsString()
    sourcePlatform: string;

    @IsString()
    originalTitle: string;

    @IsString()
    originalDescription: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsNumber()
    @IsOptional()
    purchasePrice?: number;

    @IsString()
    @IsOptional()
    generatedTitle?: string;

    @IsString()
    @IsOptional()
    generatedDescription?: string;

    @IsArray()
    @IsOptional()
    generatedTags?: string[];

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
    variations?: any[];

    @IsArray()
    @IsOptional()
    images?: string[];
}
