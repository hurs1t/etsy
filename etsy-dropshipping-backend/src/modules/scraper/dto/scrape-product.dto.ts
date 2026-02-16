import { IsUrl, IsNotEmpty } from 'class-validator';

export class ScrapeProductDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;
}
