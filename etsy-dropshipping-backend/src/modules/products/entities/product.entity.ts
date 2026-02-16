export class Product {
    id: string;
    userId: string;
    sourceUrl: string;
    sourcePlatform: string;
    originalTitle: string;
    generatedTitle?: string;
    originalDescription: string;
    generatedDescription?: string;
    generatedTags?: string[];
    price?: number;
    status: 'draft' | 'ready' | 'published' | 'failed';
    taxonomyId?: number;
    etsyListingId?: string;
    createdAt: string;
    updatedAt: string;
}
