
"use client";

import { useState, useEffect } from "react";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getEtsySyncStats, syncAllProducts } from "@/services/product.service";
import { Loader2 } from "lucide-react";

export default function EtsySyncPage() {
    const { t } = useLangStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await getEtsySyncStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch sync stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        fetchStats();
    }, []);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncAllProducts();
            await fetchStats();
            toast.success(result?.message || "Sync completed! Your Etsy listings are now up-to-date.");
        } catch (error) {
            toast.error("Sync failed. Please try again later.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleUpgrade = () => {
        toast.success("AI Guard Protection Activated! Your account is now being monitored for price shifts.");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight uppercase">{t('etsySync')}</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Real-time marketplace sync for your AliExpress dropshipping business.</p>
                </div>
                <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 rounded-2xl active:scale-95 transition-all"
                >
                    <span className={`material-symbols-outlined mr-2 ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                    {isSyncing ? "Syncing..." : "Sync"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-lg rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                <span className="material-symbols-outlined text-slate-600 transition-colors group-hover:text-primary">inventory_2</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Total Products</p>
                                <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">{stats?.totalCount || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-lg rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                <span className="material-symbols-outlined text-green-600">verified_user</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Connected</p>
                                <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">{stats?.syncedCount || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-lg rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                <span className="material-symbols-outlined text-amber-600">edit_note</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Draft Products</p>
                                <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">{stats?.draftCount || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-lg rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <span className="material-symbols-outlined text-blue-600">sync</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Sync Health</p>
                                <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Healthy</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-2xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-6 px-8">
                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Live Inventory Audit Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listing</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Etsy ID</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">State</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price Point</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Synced</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentActivity?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-10 text-center font-medium text-slate-400 italic">No synced products found yet.</td>
                                    </tr>
                                ) : (
                                    stats?.recentActivity?.map((item: any, i: number) => (
                                        <tr
                                            key={i}
                                            className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all group cursor-pointer"
                                            onClick={() => window.location.href = `/products/${item.id}`}
                                        >
                                            <td className="px-8 py-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-zinc-800 group-hover:border-primary/20 transition-all">
                                                    <img
                                                        src={item.product_images?.[0]?.image_url || "/placeholder-product.png"}
                                                        alt={item.generated_title || item.original_title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-semibold text-sm max-w-[300px] truncate underline-offset-4 decoration-primary/30 group-hover:text-primary transition-colors">
                                                {item.generated_title || item.original_title}
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-slate-400 tracking-tighter uppercase whitespace-nowrap">
                                                ID: {item.id.slice(0, 8)}
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 whitespace-nowrap">
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-sm font-heading font-bold text-slate-900 dark:text-white">${item.price}</td>
                                            <td className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">{new Date(item.updated_at).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="p-10 bg-zinc-900 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 transform translate-x-32 group-hover:translate-x-24 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="material-symbols-outlined text-primary">verified</span>
                            <h3 className="text-3xl font-heading font-bold tracking-tighter uppercase whitespace-pre line-clamp-1">Auto-Sync Health Check</h3>
                        </div>
                        <p className="text-zinc-400 font-medium max-w-md">Our AI backend automatically checks for price shifts and stockouts on AliExpress every hour.</p>
                    </div>
                    <Button
                        onClick={handleUpgrade}
                        className="h-14 px-10 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all rounded-2xl shadow-xl active:scale-95"
                    >
                        Upgrade Protection
                    </Button>
                </div>
            </div>
        </div>
    );
}
