export class ExtensionImportDto {
    sourceUrl: string;
    originalTitle: string;
    originalDescription: string;
    originalImages: string[];
    price?: string; // Extension might send string like "$10.00"
}
