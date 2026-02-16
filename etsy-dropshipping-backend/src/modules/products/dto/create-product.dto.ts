import { IsString, IsOptional, IsNumber, IsUrl, IsEnum, IsArray } from 'class-validator';

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

    @IsArray()
    @IsOptional()
    variations?: any[];
}
