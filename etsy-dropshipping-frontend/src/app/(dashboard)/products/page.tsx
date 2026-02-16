"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { UrlScraperForm } from "@/components/products/url-scraper-form";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <UrlScraperForm onSuccess={fetchProducts} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted border">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0].image_url || product.images[0]}
                                                    alt={product.originalTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[300px]">
                                        <div className="truncate" title={product.generatedTitle || product.originalTitle}>
                                            {product.generatedTitle || product.originalTitle}
                                        </div>
                                        {product.generatedTags && product.generatedTags.length > 0 && (
                                            <div className="text-xs text-muted-foreground truncate mt-1">
                                                {Array.isArray(product.generatedTags) ? product.generatedTags.slice(0, 3).join(", ") : product.generatedTags} ...
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.sourcePlatform}</TableCell>
                                    <TableCell>{product.price} {product.currency || 'USD'}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === 'connected' ? 'default' : 'secondary'}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={`/products/${product.id}`}>Edit</a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
