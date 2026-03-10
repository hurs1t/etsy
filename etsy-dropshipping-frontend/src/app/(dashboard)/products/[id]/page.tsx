
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, updateProduct, getShippingProfiles, publishProduct, deleteProductImage, deleteProduct, generateAiContent, getTaxonomyProperties, analyzeSeo } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductImages } from "@/components/products/product-images";
import { ImageEditor } from "@/components/products/image-editor";
import { CategorySelector } from "@/components/etsy/category-selector";
import { SeoScorecard } from "@/components/products/seo-scorecard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLangStore } from "@/stores/lang-store";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductEditPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLangStore();
    const [product, setProduct] = useState<any>(null);
    const [shippingProfiles, setShippingProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
    const [analyzingSeo, setAnalyzingSeo] = useState(false);
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productData, profilesData] = await Promise.all([
                    getProduct(params.id as string),
                    getShippingProfiles().catch(() => [])
                ]);
                setProduct(productData);
                if (productData.images) {
                    setSelectedImageIds(productData.images.map((img: any) => img.id));
                }
                setShippingProfiles(profilesData || []);
            } catch (error) {
                toast.error("Failed to load product");
                router.push("/products");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id, router]);

    useEffect(() => {
        if (product?.taxonomyId) {
            getTaxonomyProperties(product.taxonomyId).then(data => {
                setProperties(data || []);
            });
        } else {
            setProperties([]);
        }
    }, [product?.taxonomyId]);

    const handleAnalyzeSeo = async () => {
        setAnalyzingSeo(true);
        try {
            const result = await analyzeSeo({
                productTitle: product.generatedTitle || product.originalTitle,
                productDescription: product.generatedDescription || product.originalDescription,
                tags: Array.isArray(product.generatedTags) ? product.generatedTags : [],
                category: String(product.taxonomyId)
            });
            setSeoAnalysis(result);
            toast.success("SEO Analysis complete");
        } catch (error) {
            toast.error("Failed to analyze SEO");
        } finally {
            setAnalyzingSeo(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const price = parseFloat(String(product.price));
        const taxonomyId = product.taxonomyId ? parseInt(String(product.taxonomyId)) : undefined;

        try {
            await updateProduct(product.id, {
                originalTitle: product.originalTitle,
                generatedTitle: product.generatedTitle,
                originalDescription: product.originalDescription,
                generatedDescription: product.generatedDescription,
                generatedTags: Array.isArray(product.generatedTags) ? product.generatedTags : [],
                price: isNaN(price) ? 0 : price,
                purchasePrice: product.purchasePrice ? parseFloat(String(product.purchasePrice)) : 0,
                shippingProfileId: product.shippingProfileId,
                taxonomyId: (taxonomyId && !isNaN(taxonomyId)) ? taxonomyId : undefined,
                attributes: product.attributes
            });
            toast.success("Product updated");
        } catch (error: any) {
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!product.shippingProfileId) {
            toast.error("Please select a Shipping Profile before publishing.");
            return;
        }

        setPublishing(true);
        try {
            await handleSave();
            await publishProduct(params.id as string, selectedImageIds);
            toast.success("Product sent to Etsy Drafts!");
            const updated = await getProduct(params.id as string);
            setProduct(updated);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to publish to Etsy");
        } finally {
            setPublishing(false);
        }
    };

    const handleRegenerateField = async (field: 'title' | 'description' | 'tags') => {
        setGenerating(field);
        try {
            const result = await generateAiContent({
                productTitle: product.originalTitle || product.generatedTitle || "Untitled Product",
                productDescription: product.originalDescription || product.generatedDescription || "",
                keywords: ['etsy', 'handmade', 'niche'],
                fields: [field]
            });

            const updatedProduct = { ...product };
            if (field === 'title' && result.title) updatedProduct.generatedTitle = result.title;
            if (field === 'description' && result.description) updatedProduct.generatedDescription = result.description;
            if (field === 'tags' && result.tags) updatedProduct.generatedTags = result.tags;

            setProduct(updatedProduct);
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} regenerated!`);
        } catch (error) {
            toast.error(`Failed to regenerate ${field}`);
        } finally {
            setGenerating(null);
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
    if (!product) return <div className="p-8 text-center">Product not found</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Split Workspace */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Source Data */}
                <aside className="w-[35%] border-r border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">shopping_cart</span>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Source: AliExpress</h3>
                        </div>

                        {/* Main Image View */}
                        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700">
                            <img
                                className="h-full w-full object-cover"
                                alt="Main Product"
                                src={(product.images && product.images.length > 0) ? product.images[0].image_url : (product.originalImages?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop")}
                            />
                        </div>

                        {/* Source Details */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Original Title</label>
                                <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-xs leading-relaxed shadow-sm italic">
                                    {product.originalTitle}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Source URL</label>
                                <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary font-bold hover:underline">
                                    <span className="material-symbols-outlined text-sm">link</span>
                                    AliExpress Item Page
                                </a>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Variations</p>
                                <p className="text-lg font-black">{product.variations?.length || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Images</p>
                                <p className="text-lg font-black">{product.images?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Side: Optimization Workspace */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-zinc-950">
                    <div className="max-w-3xl mx-auto space-y-10 pb-32">
                        {/* Workspace Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight mb-1 uppercase italic">Etsy Optimization</h1>
                                <p className="text-slate-500 text-sm font-medium">Refine and polish your listing with AI-powered suggestions.</p>
                            </div>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-transform active:scale-95"
                                onClick={() => handleAnalyzeSeo()}
                                disabled={analyzingSeo}
                            >
                                {analyzingSeo ? <Loader2 className="animate-spin" /> : <span className="material-symbols-outlined">magic_button</span>}
                                {t('magicCopy')}
                            </Button>
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl mb-8">
                                <TabsTrigger value="details" className="rounded-lg px-6 py-2 font-bold uppercase text-[10px] tracking-widest">{t('details')}</TabsTrigger>
                                <TabsTrigger value="images" className="rounded-lg px-6 py-2 font-bold uppercase text-[10px] tracking-widest">Images</TabsTrigger>
                                <TabsTrigger value="optimization" className="rounded-lg px-6 py-2 font-bold uppercase text-[10px] tracking-widest">SEO Score</TabsTrigger>
                                <TabsTrigger value="studio" className="rounded-lg px-6 py-2 font-bold uppercase text-[10px] tracking-widest">Studio</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-8 animate-in fade-in duration-300">
                                {/* Title Field */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Optimized Etsy Title</Label>
                                        <span className="text-[10px] font-bold text-slate-400">{product.generatedTitle?.length || 0} / 140 chars</span>
                                    </div>
                                    <div className="relative group">
                                        <Textarea
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-slate-50/30 dark:bg-zinc-900/50 font-bold text-base min-h-[80px]"
                                            value={product.generatedTitle || ""}
                                            onChange={(e) => setProduct({ ...product, generatedTitle: e.target.value })}
                                        />
                                        <button
                                            className="absolute right-3 bottom-3 p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                            onClick={() => handleRegenerateField('title')}
                                            disabled={generating === 'title'}
                                        >
                                            <span className={cn("material-symbols-outlined text-lg", generating === 'title' && "animate-spin")}>autorenew</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Price & Shipping */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Purchase Price (Alış)</Label>
                                        <Input
                                            type="number"
                                            className="h-14 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/50 font-black text-lg focus:border-primary text-red-500"
                                            value={product.purchasePrice || ""}
                                            onChange={(e) => setProduct({ ...product, purchasePrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Selling Price (Satış)</Label>
                                        <Input
                                            type="number"
                                            className="h-14 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/50 font-black text-lg focus:border-primary text-green-600"
                                            value={product.price || ""}
                                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Shipping Profile</Label>
                                        <Select
                                            value={product.shippingProfileId ? String(product.shippingProfileId) : undefined}
                                            onValueChange={(val) => setProduct({ ...product, shippingProfileId: val })}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/50 font-bold focus:border-primary">
                                                <SelectValue placeholder="Select Profile" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {shippingProfiles.map((p) => (
                                                    <SelectItem key={p.shipping_profile_id} value={String(p.shipping_profile_id)}>{p.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Category Section */}
                                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                                    <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category & Attributes</Label>
                                    <CategorySelector
                                        value={product.taxonomyId}
                                        onChange={(val) => setProduct({ ...product, taxonomyId: parseInt(val) })}
                                    />
                                    {properties.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {properties.slice(0, 4).map((prop) => (
                                                <div key={prop.property_id} className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-500 uppercase">{prop.name}</Label>
                                                    {prop.possible_values ? (
                                                        <Select
                                                            value={product.attributes?.[prop.property_id] ? String(product.attributes[prop.property_id]) : undefined}
                                                            onValueChange={(val) => setProduct({ ...product, attributes: { ...product.attributes, [prop.property_id]: val } })}
                                                        >
                                                            <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/30">
                                                                <SelectValue placeholder={`Select ${prop.name}`} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {prop.possible_values.map((v: any) => (
                                                                    <SelectItem key={v.value_id} value={String(v.value_id)}>{v.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Input
                                                            className="rounded-xl border-slate-100 bg-slate-50/30"
                                                            value={product.attributes?.[prop.property_id] || ""}
                                                            onChange={(e) => setProduct({ ...product, attributes: { ...product.attributes, [prop.property_id]: e.target.value } })}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Description Field */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Product Description</Label>
                                        <div className="flex gap-2 p-1 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                                            <button className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded shadow-sm transition-all"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                                            <button className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded shadow-sm transition-all"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                                            <button className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded shadow-sm transition-all"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Textarea
                                            className="w-full px-5 py-5 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-slate-50/30 dark:bg-zinc-900/50 font-medium text-sm leading-relaxed min-h-[300px]"
                                            value={product.generatedDescription || ""}
                                            onChange={(e) => setProduct({ ...product, generatedDescription: e.target.value })}
                                        />
                                        <button
                                            className="absolute right-4 bottom-4 p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                            onClick={() => handleRegenerateField('description')}
                                            disabled={generating === 'description'}
                                        >
                                            <span className={cn("material-symbols-outlined text-xl", generating === 'description' && "animate-spin")}>autorenew</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Tags Field */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Search Tags (SEO)</Label>
                                        <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest" onClick={() => handleRegenerateField('tags')}>{t('magicCopy')}</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-5 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/50 min-h-[100px]">
                                        {Array.isArray(product.generatedTags) && product.generatedTags.map((tag: string, i: number) => (
                                            <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[11px] font-bold rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">
                                                #{tag}
                                                <button
                                                    className="material-symbols-outlined text-[14px] hover:text-red-500"
                                                    onClick={() => {
                                                        const newTags = [...product.generatedTags];
                                                        newTags.splice(i, 1);
                                                        setProduct({ ...product, generatedTags: newTags });
                                                    }}
                                                >
                                                    close
                                                </button>
                                            </span>
                                        ))}
                                        <button className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-primary/30 text-primary/60 text-[11px] font-bold rounded-full hover:border-primary hover:text-primary transition-all">
                                            <span className="material-symbols-outlined text-[18px]">add</span> Add Tag
                                        </button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="images" className="animate-in fade-in duration-300">
                                <ProductImages
                                    images={product.images || []}
                                    selectedIds={selectedImageIds}
                                    onToggleSelection={(id) => {
                                        if (selectedImageIds.includes(id)) setSelectedImageIds(selectedImageIds.filter(i => i !== id));
                                        else setSelectedImageIds([...selectedImageIds, id]);
                                    }}
                                    onSelectAll={() => setSelectedImageIds(product.images.map((img: any) => img.id))}
                                    onDeselectAll={() => setSelectedImageIds([])}
                                    onDeleteSelected={async () => {
                                        if (!confirm("Delete selected images?")) return;
                                        await Promise.all(selectedImageIds.map(id => deleteProductImage(id)));
                                        const p = await getProduct(product.id);
                                        setProduct(p);
                                        setSelectedImageIds([]);
                                    }}
                                    onUpdate={() => getProduct(product.id).then(setProduct)}
                                />
                            </TabsContent>

                            <TabsContent value="optimization" className="animate-in fade-in duration-300">
                                <SeoScorecard analysis={seoAnalysis} loading={analyzingSeo} onAnalyze={handleAnalyzeSeo} />
                            </TabsContent>

                            <TabsContent value="studio" className="animate-in fade-in duration-300">
                                <ImageEditor
                                    images={product.images?.length > 0 ? product.images.map((img: any) => img.image_url) : (product.originalImages || [])}
                                    productTitle={product.generatedTitle || ""}
                                    productPrice={product.price || ""}
                                    productDescription={product.generatedDescription || ""}
                                    productTags={product.generatedTags || []}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Sticky Action Footer */}
            <footer className="h-20 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-10 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {product.images?.slice(0, 3).map((img: any, i: number) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-200 overflow-hidden shadow-sm">
                                <img src={img.image_url} className="h-full w-full object-cover" alt="Preview" />
                            </div>
                        ))}
                        {product.images?.length > 3 && (
                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-primary flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                                +{product.images.length - 3}
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{selectedImageIds.length} Images Selected</p>
                        <p className="text-[10px] text-slate-500 font-medium">Ready for Etsy publication</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] text-slate-500 hover:text-red-500 transition-all"
                        onClick={() => router.push("/products")}
                    >
                        Discard
                    </Button>
                    <Button
                        variant="outline"
                        className="h-12 px-8 rounded-xl border-2 border-primary/20 font-black uppercase text-[10px] tracking-[0.2em] text-primary hover:bg-primary/5 transition-all"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <span className="material-symbols-outlined text-lg mr-2">save</span>}
                        Save Progress
                    </Button>
                    <Button
                        className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                        onClick={handlePublish}
                        disabled={publishing || saving}
                    >
                        {publishing ? <Loader2 className="animate-spin" /> : <span className="material-symbols-outlined text-lg">rocket_launch</span>}
                        Push to Etsy Drafts
                    </Button>
                </div>
            </footer>
        </div>
    );
}
