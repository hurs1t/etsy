
"use client";

import { useState, useEffect } from "react";
import { useLangStore } from "@/stores/lang-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAnalytics } from "@/services/product.service";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
    const { t } = useLangStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<string>('30d');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getAnalytics(
                    range === 'custom' ? undefined : range,
                    range === 'custom' ? startDate : undefined,
                    range === 'custom' ? endDate : undefined
                );
                setData(res);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [range, startDate, endDate, isMounted]);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const timeSavedMinutes = (data?.totalProducts || 0) * 24;
    const timeSavedHours = (timeSavedMinutes / 60).toFixed(1);

    const stats = [
        { label: t('revenue') || "Total Revenue", value: `$${data?.revenue?.toLocaleString() || "0"}`, change: "+12.4%", icon: "payments", color: "text-green-600" },
        { label: t('orders') || "Total Orders", value: data?.orders?.toString() || "0", change: "+8.2%", icon: "shopping_bag", color: "text-blue-600" },
        { label: t('conversionRate') || "Conversion Rate", value: `${data?.conversionRate || "0"}%`, change: "+0.4%", icon: "trending_up", color: "text-purple-600" },
        { label: t('roas') || "Ad Spent (RoAS)", value: `${data?.roas || "0"}x`, change: "-2.1%", icon: "ads_click", color: "text-amber-600" },
        { label: t('aiTimeSavings') || "AI Time Savings", value: `${timeSavedHours}h`, change: "∞ ROI", icon: "auto_awesome", color: "text-ai-glow" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight uppercase">{t('analytics')}</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Track your performance and optimize your sales strategies.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-100/50 dark:bg-zinc-900/50 p-2 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800">
                    <div className="flex gap-1">
                        <Button
                            variant={range === '7d' ? 'default' : 'ghost'}
                            onClick={() => setRange('7d')}
                            className={`h-9 px-4 font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all ${range === '7d' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'}`}
                        >
                            {t('last7Days') || "7 Days"}
                        </Button>
                        <Button
                            variant={range === '30d' ? 'default' : 'ghost'}
                            onClick={() => setRange('30d')}
                            className={`h-9 px-4 font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all ${range === '30d' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'}`}
                        >
                            {t('last30Days') || "30 Days"}
                        </Button>
                        <Button
                            variant={range === 'custom' ? 'default' : 'ghost'}
                            onClick={() => setRange('custom')}
                            className={`h-9 px-4 font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all ${range === 'custom' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800'}`}
                        >
                            {t('customRange') || "Custom"}
                        </Button>
                    </div>

                    {range === 'custom' && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-primary focus:ring-2 focus:ring-primary outline-none"
                            />
                            <span className="text-[10px] font-bold text-slate-400">TO</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-primary focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-2 border-slate-100 dark:border-zinc-800 shadow-lg group hover:border-primary/30 transition-all rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-zinc-800 group-hover:bg-primary/5 transition-colors`}>
                                    <span className={`material-symbols-outlined text-xl ${stat.color}`}>{stat.icon}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-tight">{stat.label}</p>
                            <p className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tighter mt-1">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between py-6 px-8">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic uppercase italic">{t('revenueGrowth') || "Revenue Growth"}</CardTitle>
                        <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_vert</span>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="aspect-[16/7] bg-slate-50 dark:bg-zinc-800/20 rounded-3xl flex items-end justify-between p-8 gap-3 border border-slate-100 dark:border-zinc-800/50">
                            {(data?.chartData || [40, 60, 45, 90, 65, 80, 50, 70, 85, 45, 95, 100]).map((h: number, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div
                                        style={{ height: `${Math.max(h, 5)}%` }}
                                        className="w-full bg-primary/20 dark:bg-primary/10 group-hover:bg-primary rounded-t-xl transition-all duration-700 cursor-pointer relative shadow-inner"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-2xl z-20">
                                            ${(h * (data?.revenue > 0 ? 1 : 42)).toFixed(0)}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-6 px-8">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic uppercase">{t('coreCategories') || "Core Categories"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {[
                            { name: t('homeDecor') || "Home Decor", value: 45, color: "bg-primary" },
                            { name: t('electronics') || "Electronics", value: 25, color: "bg-blue-500" },
                            { name: t('jewelry') || "Jewelry", value: 20, color: "bg-purple-500" },
                            { name: t('kitchen') || "Kitchen", value: 10, color: "bg-amber-500" },
                        ].map((cat, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                                    <span>{cat.name}</span>
                                    <span className="text-primary">{cat.value}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-zinc-700/50">
                                    <div className={`h-full ${cat.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${cat.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between py-6 px-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic uppercase">{t('bestPerforming') || "Best Performing Listings"}</CardTitle>
                    <Button variant="ghost" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic hover:bg-primary/5 rounded-xl">{t('detailedAudit') || "Detailed Audit"}</Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('listingAsset') || "Listing Asset"}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('delta') || "Delta"}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('salesVol') || "Sales Vol."}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('grossRevenue') || "Gross Revenue"}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('deepDive') || "Deep Dive"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!data?.topProducts || data.topProducts.length === 0) ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center font-bold text-slate-400 italic italic">
                                            {t('noSalesData') || "No sales data available for top listings."}
                                        </td>
                                    </tr>
                                ) : (
                                    data.topProducts.map((item: any, i: number) => (
                                        <tr key={i} className="border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all group">
                                            <td className="px-8 py-5 font-black text-sm italic text-slate-800 dark:text-zinc-200">{item.name}</td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${!item.growth.startsWith('-') ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                    {item.growth}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-black italic text-slate-600 dark:text-zinc-400 tracking-tighter">{item.sales}</td>
                                            <td className="px-8 py-5 text-sm font-black text-primary italic">${item.revenue?.toLocaleString()}</td>
                                            <td className="px-8 py-5">
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-sm">analytics</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
