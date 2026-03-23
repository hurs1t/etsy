import { IsString, IsArray, IsEnum } from 'class-validator';

export enum TargetLanguage {
    DUTCH = 'nl',
    FRENCH = 'fr',
    GERMAN = 'de',
    ITALIAN = 'it',
    SPANISH = 'es'
}

export class ProductTranslationDto {
    @IsEnum(TargetLanguage)
    language: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsArray()
    tags: string[];
}
