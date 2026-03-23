
"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/product.service";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RefreshCw, DollarSign, ShoppingBag, Truck, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { t } = useLangStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ revenue: "0.00", count: 0, pending: 0, currency: "USD" });
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data.results || []);
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setIsMounted(true);
        fetchOrders();
    }, []);

    if (!isMounted) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    const formatPrice = (total: any) => {
        if (!total) return "---";
        return (total.amount / total.divisor).toFixed(2) + " " + (total.currency_code || '$');
    };

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('paid') || s.includes('completed')) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";
        if (s.includes('unpaid') || s.includes('pending')) return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
        if (s.includes('refund') || s.includes('cancel')) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400";
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight uppercase">{t('ordersNav')}</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Financial overview and order tracking.</p>
                </div>
                <Button onClick={fetchOrders} disabled={loading} variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-6 border-2 hover:bg-slate-50 transition-all">
                    {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                    Refresh Data
                </Button>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all group overflow-hidden bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Revenue</CardTitle>
                        <div className="size-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">{stats.currency} {stats.revenue}</div>
                        <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-tighter">+12.5% from last month</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all group overflow-hidden bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Orders</CardTitle>
                        <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">{stats.count}</div>
                        <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase tracking-tighter">Real-time sync active</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all group overflow-hidden bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Shipments</CardTitle>
                        <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">{stats.pending}</div>
                        <p className="text-[10px] text-orange-500 font-bold mt-1 uppercase tracking-tighter">Needs attention soon</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all group overflow-hidden bg-white dark:bg-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profit Estimate</CardTitle>
                        <div className="size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                            <Truck className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-heading">{stats.currency} {(parseFloat(stats.revenue) * 0.35).toFixed(2)}</div>
                        <p className="text-[10px] text-purple-500 font-bold mt-1 uppercase tracking-tighter">Estimated 35% margin</p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-zinc-800/50 border-b-2 border-slate-100 dark:border-zinc-800">
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Order ID</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Customer</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Shipping Status</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                            <TableHead className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Total</TableHead>
                            <TableHead className="px-6 py-6 text-right text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-48">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-bold text-slate-400">Syncing with Etsy...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-48">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl text-slate-200">shopping_bag</span>
                                        <span className="text-sm font-medium text-slate-400">No orders found in recent history.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.receipt_id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors border-b border-slate-100 dark:border-zinc-800">
                                    <TableCell className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">#{order.receipt_id}</span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{order.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">{order.buyer_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge variant="outline" className={cn(
                                            "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider border-2",
                                            getStatusStyles(order.status)
                                        )}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {order.is_shipped ? (
                                                <>
                                                    <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Shipped</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="size-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Processing</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">{formatDate(order.created_timestamp)}</TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(order.total_price)}</span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <Button variant="ghost" className="h-9 px-4 font-black uppercase tracking-widest text-[9px] hover:bg-primary/10 hover:text-primary transition-all rounded-xl border-2 border-transparent hover:border-primary/20">
                                            Details
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
