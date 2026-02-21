"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteProductImage, reorderProductImage, upscaleProductImage } from "@/services/product.service";
import { X, GripVertical, Wand2, Loader2, CheckSquare, Square, Trash2 } from "lucide-react";

interface ProductImagesProps {
    images: any[];
    onUpdate: () => void;
    selectedIds?: string[];
    onToggleSelection?: (id: string) => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onDeleteSelected?: () => void;
}

export function ProductImages({ images, onUpdate, selectedIds, onToggleSelection, onSelectAll, onDeselectAll, onDeleteSelected }: ProductImagesProps) {
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
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((image, index) => (
                    <div key={image.id} className={`relative group border rounded-lg overflow-hidden aspect-square ${selectedIds && selectedIds.includes(image.id) ? 'ring-2 ring-orange-500' : ''}`}>
                        <img
                            src={image.image_url}
                            alt="Product"
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.setAttribute('data-dims', `${target.naturalWidth}x${target.naturalHeight}`);
                                // Force update to show dimensions? No, just use a ref or data attribute and read it? 
                                // Actually, React state is better.
                                // Let's try a simpler approach: adding a small overlay that just renders based on state? 
                                // Or we can just use state map. 
                            }}
                        />
                        {/* Improved Dimension Display without per-image state complexity */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                            {/* We can't easily get natural dimensions without state. Let's use a state map. */}
                            <ImageDimensions src={image.image_url} />
                        </div>

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

            {selectedIds && (
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t items-center">
                    <div className="text-sm text-muted-foreground mr-auto">
                        {selectedIds.length} image{selectedIds.length !== 1 ? 's' : ''} selected
                    </div>
                    {onSelectAll && (
                        <Button variant="outline" size="sm" onClick={onSelectAll}>
                            <CheckSquare className="mr-2 h-4 w-4" /> Select All
                        </Button>
                    )}
                    {selectedIds.length > 0 && onDeselectAll && (
                        <Button variant="outline" size="sm" onClick={onDeselectAll}>
                            <Square className="mr-2 h-4 w-4" /> Deselect All
                        </Button>
                    )}
                    {selectedIds.length > 0 && onDeleteSelected && (
                        <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.length})
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

function ImageDimensions({ src }: { src: string }) {
    const [dims, setDims] = useState<string | null>(null);

    return (
        <>
            <img
                src={src}
                className="hidden"
                onLoad={(e) => {
                    const t = e.target as HTMLImageElement;
                    setDims(`${t.naturalWidth}x${t.naturalHeight}`);
                }}
            />
            {dims || "..."}
        </>
    );
}
