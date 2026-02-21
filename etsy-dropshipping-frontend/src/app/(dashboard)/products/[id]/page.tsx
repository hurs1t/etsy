"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, updateProduct, getShippingProfiles, publishProduct, deleteProductImage, deleteProduct, generateAiContent } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductImages } from "@/components/products/product-images";
import { ImageEditor } from "@/components/products/image-editor";
import { CategorySelector } from "@/components/etsy/category-selector";
import { getTaxonomyProperties, analyzeSeo } from "@/services/product.service";
import { SeoScorecard } from "@/components/products/seo-scorecard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductEditPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [shippingProfiles, setShippingProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productData, profilesData] = await Promise.all([
                    getProduct(params.id as string),
                    getShippingProfiles().catch(() => []) // Handle error if Etsy not connected
                ]);
                setProduct(productData);
                if (productData.images) {
                    setSelectedImageIds([]);
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

    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        if (product?.taxonomyId) {
            getTaxonomyProperties(product.taxonomyId).then(data => {
                setProperties(data || []);
            });
        } else {
            setProperties([]);
        }
    }, [product?.taxonomyId]);

    const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
    const [analyzingSeo, setAnalyzingSeo] = useState(false);

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
                shippingProfileId: product.shippingProfileId,
                taxonomyId: (taxonomyId && !isNaN(taxonomyId)) ? taxonomyId : undefined,
                attributes: product.attributes
            });
            toast.success("Product updated");
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Unknown error";
            console.error("Save detailed error:", error.response || error);
            toast.error(`Failed to update product: ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
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
            // Save current state first
            await handleSave();

            await publishProduct(params.id as string, selectedImageIds);
            toast.success("Product sent to Etsy Drafts!");

            // Reload to get updated status/listingId
            const updated = await getProduct(params.id as string);
            setProduct(updated);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to publish to Etsy");
        } finally {
            setPublishing(false);
        }
    };

    const handleToggleImageSelection = (id: string) => {
        if (selectedImageIds.includes(id)) {
            setSelectedImageIds(selectedImageIds.filter(i => i !== id));
        } else {
            setSelectedImageIds([...selectedImageIds, id]);
        }
    };

    const [generating, setGenerating] = useState<string | null>(null);

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

    const handleRegenerateFull = async () => {
        if (!confirm("This will overwrite Title, Description and Tags. Continue?")) return;
        setGenerating('full');
        // ... (keep full logic if needed, or remove)
        // For now, I'll redirect to field calls or just keep it separate
        try {
            const result = await generateAiContent({
                productTitle: product.originalTitle || product.generatedTitle || "Untitled Product",
                productDescription: product.originalDescription || product.generatedDescription || "",
                keywords: ['etsy', 'handmade', 'niche']
            });

            setProduct({
                ...product,
                generatedTitle: result.title,
                generatedDescription: result.description,
                generatedTags: result.tags
            });
            toast.success("All content regenerated successfully!");
        } catch (error) {
            toast.error("Failed to regenerate content");
        } finally {
            setGenerating(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!product) return <div className="p-8 text-center">Product not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/products")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                {product.status === 'published' && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">Published</span>
                )}
                <div className="ml-auto flex gap-2">
                    <Button variant="destructive" size="icon" onClick={async () => {
                        if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
                            try {
                                await deleteProduct(product.id);
                                toast.success("Product deleted");
                                router.push("/products");
                            } catch (e) {
                                toast.error("Failed to delete product");
                            }
                        }
                    }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                    <Button onClick={handlePublish} disabled={publishing || saving} className="bg-orange-600 hover:bg-orange-700 text-white">
                        {publishing ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish to Etsy"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="variations">Variations</TabsTrigger>
                    <TabsTrigger value="optimization">Optimization (AI)</TabsTrigger>
                    <TabsTrigger value="studio">Studio (Editor)</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    {/* ... existing details content ... */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <CardTitle>Product Information</CardTitle>
                                <CardDescription>Update the product title, description and price.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleRegenerateFull} disabled={!!generating}>
                                {generating === 'full' ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
                                Regenerate All AI
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* ... (keep existing content) ... */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="title" className="flex items-center gap-2">
                                        Title
                                        {analyzingSeo ? <RefreshCw className="h-3 w-3 animate-spin" /> :
                                            seoAnalysis?.issues?.some((i: any) => i.message.toLowerCase().includes('title')) &&
                                            <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Improve SEO</span>
                                        }
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleRegenerateField('title')}
                                        disabled={generating === 'title'}
                                    >
                                        {generating === 'title' ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                        Regenerate
                                    </Button>
                                </div>
                                <Textarea
                                    id="title"
                                    rows={2}
                                    value={product.generatedTitle || product.originalTitle || ''}
                                    onChange={(e) => setProduct({ ...product, generatedTitle: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground flex justify-between">
                                    <span>{product.generatedTitle?.length || product.originalTitle?.length || 0} / 140 chars</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={product.price || ''}
                                        onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Shipping Profile (Etsy)</Label>
                                    <Select
                                        value={product.shippingProfileId ? String(product.shippingProfileId) : undefined}
                                        onValueChange={(val) => setProduct({ ...product, shippingProfileId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a shipping profile" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shippingProfiles.map((profile) => (
                                                <SelectItem key={profile.shipping_profile_id} value={String(profile.shipping_profile_id)}>
                                                    {profile.title} ({profile.origin_country_iso})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {shippingProfiles.length === 0 && (
                                        <p className="text-[10px] text-muted-foreground">
                                            No profiles found. Connect Etsy in Settings.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description" className="flex items-center gap-2">
                                        Description
                                        {analyzingSeo ? <RefreshCw className="h-3 w-3 animate-spin" /> :
                                            seoAnalysis?.issues?.some((i: any) => i.message.toLowerCase().includes('description')) &&
                                            <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Improve SEO</span>
                                        }
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleRegenerateField('description')}
                                        disabled={generating === 'description'}
                                    >
                                        {generating === 'description' ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                        Regenerate
                                    </Button>
                                </div>
                                <Textarea
                                    id="description"
                                    rows={10}
                                    value={product.generatedDescription || product.originalDescription || ''}
                                    onChange={(e) => setProduct({ ...product, generatedDescription: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="tags" className="flex items-center gap-2">
                                        Tags
                                        {analyzingSeo ? <RefreshCw className="h-3 w-3 animate-spin" /> :
                                            seoAnalysis?.issues?.some((i: any) => i.message.toLowerCase().includes('tag')) &&
                                            <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Improve SEO</span>
                                        }
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleRegenerateField('tags')}
                                        disabled={generating === 'tags'}
                                    >
                                        {generating === 'tags' ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                        Regenerate
                                    </Button>
                                </div>
                                <Textarea
                                    id="tags"
                                    rows={3}
                                    placeholder="gift, handmade, custom..."
                                    value={Array.isArray(product.generatedTags) ? product.generatedTags.join(", ") : (product.generatedTags || '')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setProduct({ ...product, generatedTags: val.split(",").map((t: string) => t.trim()) })
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Current count: {product.generatedTags?.length || 0} tags.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-medium">Category & Attributes</h3>
                                <CategorySelector
                                    value={product.taxonomyId}
                                    onChange={(val) => setProduct({ ...product, taxonomyId: parseInt(val) })}
                                />

                                {properties.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {properties.map((prop: any) => (
                                            <div key={prop.property_id} className="space-y-2">
                                                <Label>{prop.name} {prop.is_required && <span className="text-red-500">*</span>}</Label>
                                                {prop.possible_values && prop.possible_values.length > 0 ? (
                                                    <Select
                                                        value={product.attributes?.[prop.property_id] ? String(product.attributes[prop.property_id]) : undefined}
                                                        onValueChange={(val) => {
                                                            const newAttrs = { ...(product.attributes || {}), [prop.property_id]: val };
                                                            setProduct({ ...product, attributes: newAttrs });
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={`Select ${prop.name}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {prop.possible_values.map((pv: any) => (
                                                                <SelectItem key={pv.value_id} value={String(pv.value_id || pv.name)}>
                                                                    {pv.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        value={product.attributes?.[prop.property_id] || ''}
                                                        onChange={(e) => {
                                                            const newAttrs = { ...(product.attributes || {}), [prop.property_id]: e.target.value };
                                                            setProduct({ ...product, attributes: newAttrs });
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="variations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Variations</CardTitle>
                            <CardDescription>Manage extracted variations (Colors, Sizes, etc.)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!product.variations || product.variations.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No variations found for this product.
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-10 px-4 text-left font-medium">Property</th>
                                                <th className="h-10 px-4 text-left font-medium">Value</th>
                                                <th className="h-10 px-4 text-left font-medium">Price Override</th>
                                                <th className="h-10 px-4 text-left font-medium">Quantity</th>
                                                <th className="h-10 px-4 text-left font-medium">Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product.variations.map((v: any, i: number) => (
                                                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="p-4">{v.property_name}</td>
                                                    <td className="p-4">{v.value_name}</td>
                                                    <td className="p-4">{v.price || product.price}</td>
                                                    <td className="p-4">{v.quantity}</td>
                                                    <td className="p-4">
                                                        {v.image_url ? (
                                                            <img src={v.image_url} alt={v.value_name} className="h-8 w-8 object-cover rounded" />
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>



                <TabsContent value="images">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <CardDescription>
                                Manage product images (Delete, Reorder). Select images to publish to Etsy. ({selectedImageIds.length} selected)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductImages
                                images={product.images || []}
                                selectedIds={selectedImageIds}
                                onToggleSelection={handleToggleImageSelection}
                                onSelectAll={() => product.images && setSelectedImageIds(product.images.map((i: any) => i.id))}
                                onDeselectAll={() => setSelectedImageIds([])}
                                onDeleteSelected={async () => {
                                    if (!confirm(`Delete ${selectedImageIds.length} images?`)) return;
                                    try {
                                        await Promise.all(selectedImageIds.map(id => deleteProductImage(id)));
                                        toast.success("Images deleted");
                                        const p = await getProduct(product.id);
                                        setProduct(p);
                                        setSelectedImageIds([]);
                                    } catch (e) { toast.error("Failed to delete images"); }
                                }}
                                onUpdate={() => {
                                    // Reload product to refresh images
                                    getProduct(product.id).then((p) => {
                                        setProduct(p);
                                        // Ensure selected IDs are valid
                                        if (p.images) {
                                            const newIds = p.images.map((img: any) => img.id);
                                            setSelectedImageIds(prev => prev.filter(id => newIds.includes(id)));
                                        }
                                    });
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="optimization">
                    <SeoScorecard
                        analysis={seoAnalysis}
                        loading={analyzingSeo}
                        onAnalyze={handleAnalyzeSeo}
                    />
                </TabsContent>

                <TabsContent value="studio">
                    <Card>
                        <CardHeader>
                            <CardTitle>Creative Studio</CardTitle>
                            <CardDescription>Create social media content and marketing assets using your product credentials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageEditor
                                images={Array.isArray(product.images) ? product.images.map((img: any) => img.image_url || img) : []}
                                productTitle={product.generatedTitle || product.originalTitle || ""}
                                productPrice={product.price || ""}
                                productDescription={product.generatedDescription || product.originalDescription || ""}
                                productTags={Array.isArray(product.generatedTags) ? product.generatedTags : []}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
