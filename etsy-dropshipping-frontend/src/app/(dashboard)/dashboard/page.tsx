
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/services/product.service";
import { useLangStore } from "@/stores/lang-store";
import { Loader2 } from "lucide-react";

interface DashboardStats {
    total: number;
    drafts: number;
    published: number;
    recent: any[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLangStore();

    useEffect(() => {
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
                    <h2 className="text-2xl font-black tracking-tight mb-1">Dashboard Overview</h2>
                    <p className="text-slate-500 dark:text-zinc-400">Manage and automate your AliExpress to Etsy flow.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-primary">shopping_cart</span>
                        </div>
                        <span className="text-green-600 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">+12%</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Imported Today</p>
                    <h3 className="text-2xl font-black mt-1 tracking-tight">{stats?.total.toString() || "0"}</h3>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm ai-shimmer transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-ai-glow">auto_awesome</span>
                        </div>
                        <span className="text-blue-600 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Active</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Pending AI Optimization</p>
                    <h3 className="text-2xl font-black mt-1 tracking-tight">{stats?.drafts.toString() || "0"}</h3>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-green-600">health_and_safety</span>
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Stable</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Store Health</p>
                    <h3 className="text-2xl font-black mt-1 text-green-600 tracking-tight">98%</h3>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                            <span className="material-symbols-outlined text-slate-600 dark:text-zinc-400">sync_saved_locally</span>
                        </div>
                        <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">89% rate</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Successful Syncs</p>
                    <h3 className="text-2xl font-black mt-1 tracking-tight">{stats?.published.toString() || "0"}</h3>
                </div>
            </div>

            {/* Recent Imports Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Recent Imports</h3>
                    <div className="flex items-center gap-2">
                        <Link href="/products" className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 transition-colors">View All</Link>
                        <button className="material-symbols-outlined text-slate-400 hover:text-slate-600 cursor-pointer p-1">filter_list</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-widest font-bold">
                                <th className="px-6 py-4 font-bold">Product</th>
                                <th className="px-6 py-4 font-bold">Source Link</th>
                                <th className="px-6 py-4 font-bold">Date Added</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {stats?.recent.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded bg-slate-100 dark:bg-zinc-800 overflow-hidden border border-slate-200 dark:border-zinc-700">
                                                <img
                                                    className="w-full h-full object-cover"
                                                    alt={product.originalTitle}
                                                    src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop"}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold truncate max-w-[200px] text-slate-900 dark:text-white">{product.originalTitle || "Untitled Product"}</p>
                                                <p className="text-[10px] text-slate-400">ID: AE-{product.id.substring(0, 5).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a className="text-primary text-xs flex items-center gap-1 hover:underline underline-offset-2" href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
                                            AliExpress <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                                            {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{new Date(product.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!product.isPublished ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-ai-glow text-[10px] font-black uppercase tracking-wider ai-shimmer">
                                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                                AI Processing
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-black uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Synced
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/products/${product.id}`} className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </Link>
                                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                                <span className="material-symbols-outlined text-lg">sync</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Information Cards */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-gradient-to-br from-primary to-orange-600 rounded-xl p-8 text-white relative overflow-hidden group shadow-xl shadow-primary/20">
                    <div className="relative z-10">
                        <h4 className="text-lg font-bold mb-2 uppercase tracking-tight">Grow your sales with AI</h4>
                        <p className="text-white/80 text-sm mb-6 max-w-md leading-relaxed">Our new AI description generator can boost conversion by up to 35%. Try it on your draft products now.</p>
                        <button className="bg-white text-primary font-bold py-3 px-6 rounded-lg text-sm hover:shadow-2xl transition-all active:scale-95">Open AI Suite</button>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/10 text-[160px] rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700">auto_awesome</span>
                </div>

                <div className="w-full md:w-80 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 transform group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-4xl">api</span>
                    </div>
                    <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">Last Sync Check</h4>
                    <p className="text-xs text-slate-500 mb-6 font-medium">Success: October 24, 14:00 PM</p>
                    <button className="w-full py-3 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Force API Refresh
                    </button>
                </div>
            </div>
        </div>
    );
}

