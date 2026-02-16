"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteProductImage, reorderProductImage, upscaleProductImage } from "@/services/product.service";
import { X, GripVertical, Wand2, Loader2 } from "lucide-react";

interface ProductImagesProps {
    images: any[];
    onUpdate: () => void;
    selectedIds?: string[];
    onToggleSelection?: (id: string) => void;
}

export function ProductImages({ images, onUpdate, selectedIds, onToggleSelection }: ProductImagesProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleDelete = async (imageId: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        setLoading(imageId);
        try {
            await deleteProductImage(imageId);
            toast.success("Image deleted");
            onUpdate();
        } catch (error) {
            toast.error("Failed to delete image");
        } finally {
            setLoading(null);
        }
    };

    const handleUpscale = async (imageId: string) => {
        setLoading(imageId);
        try {
            toast.info("Upscaling image... This may take a few seconds.");
            await upscaleProductImage(imageId);
            toast.success("Image upscaled successfully!");
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to upscale image");
        } finally {
            setLoading(null);
        }
    };

    // Simple Grid View for MVP
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((image, index) => (
                <div key={image.id} className={`relative group border rounded-lg overflow-hidden aspect-square ${selectedIds && selectedIds.includes(image.id) ? 'ring-2 ring-orange-500' : ''}`}>
                    <img
                        src={image.image_url}
                        alt="Product"
                        className="w-full h-full object-cover"
                    />

                    {onToggleSelection && (
                        <div className="absolute top-2 left-2 z-10 bg-white/80 hover:bg-white rounded p-1 shadow-sm transition-all" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer"
                                checked={selectedIds?.includes(image.id)}
                                onChange={() => onToggleSelection(image.id)}
                            />
                        </div>
                    )}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/80 hover:bg-white text-purple-600"
                            onClick={() => handleUpscale(image.id)}
                            disabled={loading === image.id}
                            title="Upscale Image (AI)"
                        >
                            {loading === image.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(image.id)}
                            disabled={loading === image.id}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Main
                        </div>
                    )}
                </div>
            ))}
            {images.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                    No images found.
                </div>
            )}
        </div>
    );
}



