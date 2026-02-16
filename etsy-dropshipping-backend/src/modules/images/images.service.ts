import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ImagesService {
    private readonly logger = new Logger(ImagesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async uploadImage(file: Express.Multer.File): Promise<any> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'etsy-dropshipping' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            // Convert buffer to stream
            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);
            stream.pipe(upload);
        });
    }

    async uploadFromUrl(url: string): Promise<any> {
        try {
            return await cloudinary.uploader.upload(url, {
                folder: 'etsy-dropshipping',
            });
        } catch (error) {
            this.logger.error(`Failed to upload from URL: ${error.message}`);
            throw error;
        }
    }

    async deleteImage(id: string) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('product_images')
            .delete()
            .eq('id', id);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return { message: 'Image deleted successfully' };
    }

    async reorderImages(imageId: string, newIndex: number) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('product_images')
            .update({ order_index: newIndex })
            .eq('id', imageId);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return { message: 'Image order updated' };
    }
    async getImage(id: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('product_images')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            throw new InternalServerErrorException('Image not found');
        }
        return data;
    }

    async updateImageUrl(id: string, newUrl: string) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('product_images')
            .update({ image_url: newUrl })
            .eq('id', id);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }
        return { message: 'Image updated successfully', url: newUrl };
    }
}
