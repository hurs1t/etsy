import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class GenerateContentDto {
    @IsString()
    @IsNotEmpty()
    productTitle: string;

    @IsString()
    @IsOptional()
    productDescription?: string;

    @IsArray()
    @IsOptional()
    keywords?: string[];
}
