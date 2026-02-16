import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    async create(createProductDto: CreateProductDto, token?: string) {
        // Use Admin Client to bypass RLS since we validated the user in the Controller
        const supabase = this.supabaseService.getAdminClient();

        const productData = {
            user_id: createProductDto.userId,
            source_url: createProductDto.sourceUrl,
            source_platform: createProductDto.sourcePlatform,
            original_title: createProductDto.originalTitle,
            original_description: createProductDto.originalDescription,
            generated_title: createProductDto.generatedTitle,
            generated_description: createProductDto.generatedDescription,
            generated_tags: createProductDto.generatedTags,
            price: createProductDto.price,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        console.log('[ProductsService] Inserting product data:', JSON.stringify(productData, null, 2));

        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) {
            console.error('[ProductsService] Insert Error:', error);
            throw new InternalServerErrorException(error.message);
        }

        return this.mapEntity(data);
    }

    async createWithImages(createProductDto: CreateProductDto, images: string[], token?: string) {
        const product = await this.create(createProductDto, token);

        if (images && images.length > 0) {
            const imageRecords = images.map((url, index) => ({
                product_id: product.id,
                image_url: url,
                order_index: index,
                is_primary: index === 0,
                created_at: new Date().toISOString()
            }));



            // Use admin client for images too
            const supabase = this.supabaseService.getAdminClient();
            const { error } = await supabase
                .from('product_images')
                .insert(imageRecords);

            if (error) {
                console.error('Failed to save images:', error);
            }
        }

        if (createProductDto.variations && createProductDto.variations.length > 0) {
            const variationRecords = createProductDto.variations.map(v => ({
                product_id: product.id,
                property_id: v.property_id,
                property_name: v.property_name,
                value_id: v.value_id,
                value_name: v.value_name,
                image_url: v.image_url,
                price: v.price,
                quantity: v.quantity,
                created_at: new Date().toISOString()
            }));

            const supabase = this.supabaseService.getAdminClient();
            const { error } = await supabase
                .from('product_variations')
                .insert(variationRecords);

            if (error) {
                console.error('Failed to save variations:', error);
            }
        }

        return product;
    }

    async findAll(userId: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('products')
            .select('*, product_images(*), product_variations(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return data.map(this.mapEntity);
    }

    async findOne(id: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('products')
            .select('*, product_images(*), product_variations(*)')
            .eq('id', id)
            .single();

        console.log(`[ProductsService] findOne(${id}) result:`, { data: !!data, error });

        if (error || !data) {
            throw new NotFoundException('Product not found');
        }

        return this.mapEntity(data);
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const supabase = this.supabaseService.getClient();

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (updateProductDto.originalTitle !== undefined) updateData.original_title = updateProductDto.originalTitle;
        if (updateProductDto.generatedTitle !== undefined) updateData.generated_title = updateProductDto.generatedTitle;
        if (updateProductDto.originalDescription !== undefined) updateData.original_description = updateProductDto.originalDescription;
        if (updateProductDto.generatedDescription !== undefined) updateData.generated_description = updateProductDto.generatedDescription;
        if (updateProductDto.generatedTags !== undefined) updateData.generated_tags = updateProductDto.generatedTags;
        if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
        if (updateProductDto.status !== undefined) updateData.status = updateProductDto.status;
        if (updateProductDto.shippingProfileId !== undefined) updateData.shipping_profile_id = updateProductDto.shippingProfileId;
        if (updateProductDto.images !== undefined) {
            // Handle image updates separately if needed, but for now products table doesn't store images json usually if there is a separate table.
            // But if specific columns exist, map them.
        }


        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select('*, product_images(*), product_variations(*)')
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return this.mapEntity(data);
    }

    // ... (remove method omitted for brevity if not changing) ...

    async remove(id: string) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return { message: 'Product deleted successfully' };
    }

    async getStats(userId: string) {
        // ... (getStats omitted, same as before) ...
        const supabase = this.supabaseService.getClient();
        const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: drafts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'draft');
        const { count: published } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'connected');
        const { data: recent } = await supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);

        return {
            total: total || 0,
            drafts: drafts || 0,
            published: published || 0,
            recent: recent ? recent.map(r => this.mapEntity(r)) : []
        };
    }

    private mapEntity(record: any) {
        return {
            id: record.id,
            userId: record.user_id,
            sourceUrl: record.source_url,
            sourcePlatform: record.source_platform,
            originalTitle: record.original_title,
            generatedTitle: record.generated_title,
            originalDescription: record.original_description,
            generatedDescription: record.generated_description,
            generatedTags: record.generated_tags, // Explicit mapping
            price: record.price,
            status: record.status,
            shippingProfileId: record.shipping_profile_id,
            createdAt: record.created_at,
            images: record.product_images || [],
            variations: record.product_variations || [],
            ...record
        };
    }
}
