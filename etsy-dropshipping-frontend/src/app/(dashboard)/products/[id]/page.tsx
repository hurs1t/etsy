"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, updateProduct, getShippingProfiles, publishProduct } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductImages } from "@/components/products/product-images";
import { ImageEditor } from "@/components/products/image-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
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
                    setSelectedImageIds(productData.images.map((img: any) => img.id || img));
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

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProduct(product.id, {
                originalTitle: product.originalTitle,
                generatedTitle: product.generatedTitle,
                originalDescription: product.originalDescription,
                generatedDescription: product.generatedDescription,
                generatedTags: Array.isArray(product.generatedTags) ? product.generatedTags : [],
                price: parseFloat(product.price),
                shippingProfileId: product.shippingProfileId
            });
            toast.success("Product updated");
        } catch (error) {
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
                    <TabsTrigger value="studio">Studio (Editor)</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    {/* ... existing details content ... */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                            <CardDescription>Update the product title, description and price.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* ... (keep existing content) ... */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={product.generatedTitle || product.originalTitle || ''}
                                    onChange={(e) => setProduct({ ...product, generatedTitle: e.target.value })}
                                />
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
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={10}
                                    value={product.generatedDescription || product.originalDescription || ''}
                                    onChange={(e) => setProduct({ ...product, generatedDescription: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (Comma separated)</Label>
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
