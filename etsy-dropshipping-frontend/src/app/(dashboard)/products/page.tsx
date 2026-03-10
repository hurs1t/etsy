
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, deleteProductsBulk } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { useLangStore } from "@/stores/lang-store";

export default function ProductsPage() {
    const { t } = useLangStore();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
            setSelectedIds([]); // Reset selection on refresh
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setIsMounted(true);
        fetchProducts();
    }, []);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length && products.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sId => sId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

        setIsDeleting(true);
        try {
            await deleteProductsBulk(selectedIds);
            toast.success(`Deleted ${selectedIds.length} products`);
            fetchProducts();
        } catch (error) {
            toast.error("Failed to delete products");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight uppercase">{t('products')}</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage and optimize your AliExpress product library.</p>
                </div>
                <div className="flex items-center gap-4">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-zinc-800/50 border-b-2 border-slate-100 dark:border-zinc-800">
                            <TableHead className="w-[80px] px-6 py-6">
                                <Checkbox
                                    checked={products.length > 0 && selectedIds.length === products.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Image</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Product Details</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Pricing</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">{t('shippingFee')}</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">{t('shippingTime')}</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">{t('suggestedPrice')}</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                            <TableHead className="px-6 py-6 text-right text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-48">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-bold text-slate-400">Syncing with database...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-48">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl text-slate-200">inventory_2</span>
                                        <span className="text-sm font-medium text-slate-400">No products imported yet.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800">
                                    <TableCell className="px-6 py-4">
                                        <Checkbox
                                            checked={selectedIds.includes(product.id)}
                                            onCheckedChange={() => toggleSelectOne(product.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-zinc-800 group-hover:border-primary/20 transition-all">
                                            <img
                                                src={product.images?.[0]?.image_url || "/placeholder-product.png"}
                                                alt={product.generatedTitle || product.originalTitle}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="max-w-[300px]">
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2"
                                            >
                                                {product.generatedTitle || product.originalTitle}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{product.sourcePlatform}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-[10px] font-medium text-slate-400 capitalize">{product.status}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-heading font-bold text-slate-900 dark:text-white">${product.price}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sale (Etsy)</span>
                                            <span className="text-[10px] font-bold text-slate-300 mt-1 line-through decoration-red-500/30">${(product.purchasePrice || 0)} Alış</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600 dark:text-zinc-400 uppercase tracking-tighter">
                                            {product.attributes?.shippingFee || "---"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600 dark:text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
                                            {product.attributes?.shippingTime || "---"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col bg-green-50 dark:bg-green-500/5 p-2 rounded-xl border border-green-100 dark:border-green-500/10">
                                            <span className="text-sm font-heading font-bold text-green-600">${(Number(product.purchasePrice || product.price) * 1.4).toFixed(2)}</span>
                                            <span className="text-[8px] font-bold text-green-500/70 uppercase tracking-widest mt-0.5">REC. +40%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        {!product.isPublished ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-ai-glow text-[9px] font-bold uppercase tracking-wider ai-shimmer">
                                                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                                Draft
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-[9px] font-black uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                                Published
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/products/${product.id}`}>
                                                <Button variant="ghost" className="h-10 px-4 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 hover:text-primary transition-all underline underline-offset-4 decoration-2">
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
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
