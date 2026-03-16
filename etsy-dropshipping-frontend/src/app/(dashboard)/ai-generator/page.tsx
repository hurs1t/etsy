
"use client";

import { useState, useEffect } from "react";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getProducts, generateAiContent, updateProduct } from "@/services/product.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIGeneratorPage() {
    const { t } = useLangStore();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [tone, setTone] = useState("Persuasive & Professional");
    const [sensitivity, setSensitivity] = useState("Aggressive Ranking");
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data || []);
            } catch (error) {
                toast.error("Failed to load products");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProductId) {
            const p = products.find(prod => String(prod.id) === selectedProductId);
            setSelectedProduct(p);
            setResult(null); // Reset result when changing product
        }
    }, [selectedProductId, products]);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const handleGenerate = async () => {
        if (!selectedProduct) {
            toast.error("Please select a product first");
            return;
        }
        setIsGenerating(true);
        try {
            const res = await generateAiContent({
                productTitle: selectedProduct.originalTitle || selectedProduct.generatedTitle || "",
                productDescription: selectedProduct.originalDescription || selectedProduct.generatedDescription || "",
                tone,
                sensitivity
            });
            setResult(res);
            toast.success("AI Generation Complete!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate AI content");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = async () => {
        if (!selectedProduct || !result) return;
        try {
            await updateProduct(selectedProduct.id, {
                generatedTitle: result.title,
                generatedDescription: result.description,
                generatedTags: result.tags
            });
            toast.success("Changes applied to product details!");
            // Update local state to reflect changes if needed
            const updated = { ...selectedProduct, generatedTitle: result.title, generatedDescription: result.description, generatedTags: result.tags };
            setSelectedProduct(updated);
            // Also update in products list
            setProducts(products.map(p => p.id === selectedProduct.id ? updated : p));
        } catch (error) {
            toast.error("Failed to apply changes");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-black italic tracking-tight uppercase">{t('aiGenerator')}</h1>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest">Pro</span>
                    </div>
                    <p className="text-slate-500 font-medium">Create high-converting Etsy listings with one click using Magic AI.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
                        <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-4">
                            <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">magic_button</span>
                                Magic Generator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Imported Product</label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                            <SelectTrigger className="h-14 bg-slate-50 dark:bg-zinc-800 border-2 border-transparent focus:border-primary transition-all font-bold rounded-2xl">
                                                <SelectValue placeholder={loadingProducts ? "Loading products..." : "Pick a product to optimize"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl max-h-[300px]">
                                                {products.length === 0 && !loadingProducts ? (
                                                    <SelectItem value="none" disabled>No products imported yet</SelectItem>
                                                ) : (
                                                    products.map(p => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                                                                    {p.images?.[0]?.image_url || p.originalImages?.[0] ? (
                                                                        <img src={p.images?.[0]?.image_url || p.originalImages?.[0]} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="material-symbols-outlined text-[10px] m-auto flex text-slate-300">image</span>
                                                                    )}
                                                                </div>
                                                                <span className="truncate max-w-[300px]">{p.originalTitle || p.generatedTitle}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !selectedProductId}
                                        className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 shrink-0 rounded-2xl active:scale-95 transition-transform"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <span className="material-symbols-outlined mr-2">psychology</span>}
                                        {isGenerating ? "Optimizing..." : "Generate Listing"}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50 dark:border-zinc-800">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Optimized Tone</label>
                                    <Select value={tone} onValueChange={setTone}>
                                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-zinc-800 rounded-xl border-none font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Persuasive & Professional">Persuasive & Professional</SelectItem>
                                            <SelectItem value="Luxury & High-end">Luxury & High-end</SelectItem>
                                            <SelectItem value="Fun & Energetic">Fun & Energetic</SelectItem>
                                            <SelectItem value="Handmade & Cozy">Handmade & Cozy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SEO Sensitivity</label>
                                    <Select value={sensitivity} onValueChange={setSensitivity}>
                                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-zinc-800 rounded-xl border-none font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Aggressive Ranking">Aggressive Ranking</SelectItem>
                                            <SelectItem value="Balanced / Safe">Balanced / Safe</SelectItem>
                                            <SelectItem value="Image Focus">Image Focus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedProduct && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            {/* Source Data */}
                            <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-sm opacity-60">
                                <CardHeader className="py-4 border-b border-slate-50 dark:border-zinc-800">
                                    <CardTitle className="text-[10px] font-black uppercase text-slate-400">Original Data</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Title</label>
                                        <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 line-clamp-3">{selectedProduct.originalTitle}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Description</label>
                                        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 line-clamp-[10] leading-relaxed">
                                            {selectedProduct.originalDescription || "No description provided."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Result */}
                            <Card className={cn("border-2 shadow-2xl transition-all duration-700", result ? "border-primary/20 bg-primary/5" : "border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50")}>
                                <CardHeader className="py-4 border-b border-primary/10">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-[10px] font-black uppercase text-primary italic">AI Result Analysis</CardTitle>
                                        {result && <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded uppercase">Score: 98%</span>}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 min-h-[400px] flex flex-col justify-center">
                                    {result ? (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-primary uppercase">Optimized Etsy Title</label>
                                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight italic">{result.title}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-primary uppercase">Viral Tags (13)</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.isArray(result.tags) ? result.tags.map((tag: string, i: number) => (
                                                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">#{tag}</span>
                                                    )) : <p className="text-[10px] font-bold text-primary">{result.tags}</p>}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-primary uppercase">Optimized Description</label>
                                                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed font-bold line-clamp-[12]">
                                                    {result.description}
                                                </p>
                                            </div>
                                            <div className="pt-4 mt-auto">
                                                <Button
                                                    size="sm"
                                                    className="w-full h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg"
                                                    onClick={handleApply}
                                                >
                                                    Apply to Product Details
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 animate-pulse">auto_awesome</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {isGenerating ? "Crafting your SEO Masterpiece..." : "Click generate to see magic"}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Image Perspective Card */}
                    <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden group bg-white dark:bg-zinc-900">
                        <div className="aspect-square bg-slate-100 dark:bg-zinc-800 relative overflow-hidden">
                            <img
                                src={selectedProduct?.images?.[0]?.image_url || selectedProduct?.originalImages?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop"}
                                className={cn("w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110", !selectedProduct && "opacity-20 grayscale")}
                                alt="Preview"
                            />
                            {!selectedProduct && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">image</span>
                                    <span className="text-xs font-bold uppercase tracking-widest italic opacity-50">Awaiting Product</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                                Live Preview
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                                <h3 className="font-black text-[11px] uppercase tracking-widest">Image Analysis</h3>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Our AI analyzes textures, lighting, and materials to suggest high-impact keywords like "Reflective Crystal", "Natural Oak", or "Dimmable LED".
                            </p>
                        </CardContent>
                    </Card>

                    <div className="bg-primary/10 dark:bg-primary/5 p-6 rounded-3xl border-2 border-primary/10 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-8xl text-primary">lightbulb</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary text-lg">tips_and_updates</span>
                            <span className="font-black text-[11px] uppercase tracking-widest text-primary">Pro SEO Strategy</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold leading-relaxed">
                            Use "Luxury" tone for high-ticket items like crystal lamps. It focuses on craftsmanship and premium quality keywords that Etsy's algorithm prioritizes for upscale buyers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
