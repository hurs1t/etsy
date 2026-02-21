import { IsString, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class SeoAnalysisDto {
    @IsString()
    @IsNotEmpty()
    productTitle: string;

    @IsString()
    @IsOptional()
    productDescription?: string;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    category?: string;
}
