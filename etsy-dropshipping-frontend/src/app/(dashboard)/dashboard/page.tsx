"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/product.service";
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
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.drafts || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.published || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Etsy Sales Integration</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.recent.map((product) => (
                                <div key={product.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{(product.originalTitle || 'No Title').substring(0, 50)}...</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(product.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {product.price ? `$${product.price}` : 'N/A'}
                                    </div>
                                </div>
                            ))}
                            {stats?.recent.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
