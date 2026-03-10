
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/services/product.service";
import { useLangStore } from "@/stores/lang-store";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardStats {
    total: number;
    drafts: number;
    published: number;
    recent: any[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const { t } = useLangStore();

    useEffect(() => {
        setIsMounted(true);
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-slate-500 font-medium tracking-tight">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight uppercase">{t('dashboard')} Overview</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium tracking-tight">Manage and automate your AliExpress to Etsy flow.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/ai-generator">
                        <Button className="bg-primary text-white font-bold uppercase tracking-widest text-[10px] h-11 px-8 shadow-lg shadow-primary/20 rounded-2xl">
                            <span className="material-symbols-outlined mr-2 text-sm">magic_button</span>
                            New Import
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl hover:border-primary/30 transition-all group rounded-[2rem] overflow-hidden">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-900/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
                            </div>
                            <span className="text-green-600 text-[10px] font-bold bg-green-100 dark:bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">+12.5%</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('importedToday')}</p>
                        <h3 className="text-4xl font-heading font-bold tracking-tighter text-slate-900 dark:text-white">{stats?.total.toString() || "0"}</h3>
                    </CardContent>
                </Card>

                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl ai-shimmer hover:border-ai-glow/30 transition-all group rounded-[2rem] overflow-hidden">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-ai-glow text-2xl">auto_awesome</span>
                            </div>
                            <span className="text-blue-600 text-[10px] font-bold bg-blue-100 dark:bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('aiGenerator')}</p>
                        <h3 className="text-4xl font-heading font-bold tracking-tighter text-slate-900 dark:text-white">Active</h3>
                    </CardContent>
                </Card>

                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl hover:border-green-500/30 transition-all group rounded-[2rem] overflow-hidden">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-green-600 text-2xl">health_and_safety</span>
                            </div>
                            <span className="text-slate-400 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full uppercase tracking-wider">Stable</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('storeHealth')}</p>
                        <h3 className="text-4xl font-heading font-bold tracking-tighter text-green-600">98%</h3>
                    </CardContent>
                </Card>

                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl hover:border-amber-500/30 transition-all group rounded-[2rem] overflow-hidden">
                    <CardContent className="p-7">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-amber-100 dark:bg-amber-900/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-amber-600 text-2xl">sync_saved_locally</span>
                            </div>
                            <span className="text-primary text-[10px] font-bold bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">89% rate</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('successfulSyncs')}</p>
                        <h3 className="text-4xl font-heading font-bold tracking-tighter text-slate-900 dark:text-white">{stats?.published.toString() || "0"}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Imports Table */}
            <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between py-6 px-8">
                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('recentImports')}</CardTitle>
                    <div className="flex items-center gap-3">
                        <Link href="/products">
                            <Button variant="outline" className="h-9 text-[10px] font-bold uppercase tracking-widest border-2 rounded-xl px-4">
                                {t('viewAll')}
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-zinc-800/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100 dark:border-zinc-800">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Date Added</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {stats?.recent.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden border-2 border-slate-200 dark:border-zinc-700 group-hover:border-primary/30 transition-all">
                                                <img
                                                    className="w-full h-full object-cover"
                                                    alt={product.originalTitle}
                                                    src={
                                                        typeof product.images?.[0] === 'string'
                                                            ? product.images[0]
                                                            : (product.images?.[0]?.image_url || product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop")
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic truncate max-w-[240px] text-slate-900 dark:text-white">{product.originalTitle || "Untitled Product"}</p>
                                                <p className="text-[10px] font-bold text-slate-400">ID: AE-{product.id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a className="text-primary text-[10px] font-black flex items-center gap-1 hover:underline underline-offset-4 uppercase italic" href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
                                            AliExpress <span className="material-symbols-outlined text-xs">open_in_new</span>
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold italic">
                                            {new Date(product.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">{new Date(product.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!product.isPublished ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-ai-glow text-[9px] font-black uppercase tracking-wider ai-shimmer">
                                                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                                                AI Processing
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-[9px] font-black uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                                Synced
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/products/${product.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-primary transition-all">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </Link>
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-green-500 transition-all">
                                                <span className="material-symbols-outlined text-lg">sync</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* AI Promo & API Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-primary to-orange-600 rounded-[2rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-primary/20">
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black italic mb-2 uppercase tracking-tight italic">{t('growSalesAi')}</h4>
                        <p className="text-white/80 font-bold mb-8 max-w-md leading-relaxed">{t('growSalesAiDesc')}</p>
                        <Link href="/ai-generator">
                            <Button className="bg-white text-primary font-black py-7 px-10 rounded-2xl text-xs hover:shadow-2xl transition-all active:scale-95 uppercase tracking-widest shadow-xl">
                                {t('openAiSuite')}
                            </Button>
                        </Link>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/10 text-[200px] rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700 pointer-events-none">auto_awesome</span>
                </div>

                <Card className="bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 p-10 flex flex-col items-center justify-center text-center shadow-xl group">
                    <div className="size-20 rounded-[1.5rem] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-primary mb-6 transform group-hover:rotate-6 transition-all shadow-inner">
                        <span className="material-symbols-outlined text-5xl">api</span>
                    </div>
                    <h4 className="font-black text-lg mb-1 uppercase tracking-tight">{t('lastSyncCheck')}</h4>
                    <p className="text-[10px] text-slate-500 mb-8 font-black uppercase tracking-widest">Success: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <Button variant="outline" className="w-full py-7 border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
                        {t('apiRefreshing')}
                    </Button>
                </Card>
            </div>
        </div>
    );
}
