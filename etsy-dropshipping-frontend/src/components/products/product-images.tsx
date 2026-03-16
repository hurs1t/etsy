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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-4">
                {images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((image, index) => (
                    <div key={image.id} className={`flex flex-col border rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition-all relative group ${selectedIds && selectedIds.includes(image.id) ? 'ring-2 ring-primary border-transparent shadow-md' : 'border-slate-200 dark:border-zinc-800'}`}>
                        {/* Image Container */}
                        <div className="relative aspect-square bg-slate-100 dark:bg-zinc-800 cursor-pointer" onClick={() => onToggleSelection && onToggleSelection(image.id)}>
                            <img
                                src={image.image_url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Main Badge */}
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm pointer-events-none">
                                    Main
                                </div>
                            )}

                            {/* Checkbox Overlay */}
                            {onToggleSelection && (
                                <div
                                    className={`absolute top-2 left-2 z-10 flex items-center justify-center p-1.5 rounded-md shadow-sm transition-all ${selectedIds?.includes(image.id) ? 'bg-white opacity-100' : 'bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100'}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                        checked={selectedIds?.includes(image.id)}
                                        readOnly
                                    />
                                </div>
                            )}

                            {/* Delete Button (Hover) */}
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }}
                                disabled={loading !== null}
                                title="Delete Image"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Minimal AI Action Footer */}
                        <div className="p-1 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center bg-slate-50/50 dark:bg-zinc-900/50 h-8 relative overflow-hidden">
                            {loading === image.id ? (
                                <div className="flex w-full h-full items-center justify-center gap-1.5 text-primary">
                                    <Wand2 className="h-3 w-3 animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest animate-pulse">Upscaling...</span>

                                    {/* Indeterminate Loading Bar Line */}
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary/10">
                                        <div className="h-full bg-primary relative w-[50%] animate-[bounce_1s_infinite_ease-in-out_alternate]" style={{ left: '0%' }}></div>
                                        <style>{`
                                            @keyframes bounce {
                                                0% { left: 0%; transform: translateX(0%); }
                                                100% { left: 100%; transform: translateX(-100%); }
                                            }
                                        `}</style>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-full w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md transition-all text-[9.5px] font-bold uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                    onClick={(e) => { e.stopPropagation(); handleUpscale(image.id); }}
                                    disabled={loading !== null}
                                >
                                    <Wand2 className="h-3 w-3" />
                                    AI Upscale
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                {images.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 font-medium">
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
