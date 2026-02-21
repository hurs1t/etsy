import { IsString, IsArray, IsOptional } from 'class-validator';

export class ExtensionImportDto {
    @IsString()
    sourceUrl: string;

    @IsString()
    originalTitle: string;

    @IsString()
    originalDescription: string;

    @IsArray()
    originalImages: string[];

    @IsString()
    @IsOptional()
    price?: string;

    @IsArray()
    @IsOptional()
    variations?: any[];
}
