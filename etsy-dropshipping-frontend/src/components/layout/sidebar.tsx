
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/services/product.service";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);
    const [usage, setUsage] = useState({ current: 0, limit: 100 });

    useEffect(() => {
        setIsMounted(true);
        const fetchStats = async () => {
            try {
                const stats = await getDashboardStats();
                if (stats) {
                    setUsage({
                        current: (stats as any).monthlyUsage || 0,
                        limit: (stats as any).monthlyLimit || 100
                    });
                }
            } catch (error) {
                console.error("Failed to fetch sidebar stats", error);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    if (!isMounted) {
        return <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-full shrink-0" />;
    }

    const routes = [
        {
            label: t('dashboard'),
            icon: "dashboard",
            href: "/dashboard",
        },
        {
            label: t('products'),
            icon: "inventory_2",
            href: "/products",
        },
        {
            label: t('aiGenerator'),
            icon: "auto_awesome",
            href: "/ai-generator",
            isPro: true,
        },
        {
            label: t('etsySync'),
            icon: "sync",
            href: "/sync",
        },
        {
            label: t('analytics'),
            icon: "monitoring",
            href: "/analytics",
        },
        {
            label: t('settings'),
            icon: "settings",
            href: "/settings",
        },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-full shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-2xl font-bold">sync_alt</span>
                </div>
                <div>
                    <h1 className="text-lg font-heading font-medium tracking-tight text-slate-900 dark:text-white">EtsyAuto</h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[8px]">Etsy AI Tool</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            <span className={cn(
                                "material-symbols-outlined text-[20px]",
                                route.isPro && !isActive ? "text-ai-glow" : ""
                            )}>
                                {route.icon}
                            </span>
                            <span className="tracking-tight">{route.label}</span>
                            {route.isPro && (
                                <span className="ml-auto text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Pro</span>
                            )}
                        </Link>
                    );
                })}

                <div className="pt-6 pb-2">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support</p>
                </div>
                <Link
                    href="/help"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all font-sans"
                >
                    <span className="material-symbols-outlined text-[20px]">help_outline</span>
                    <span className="tracking-tight">{t('helpCenter')}</span>
                </Link>
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('usageLimit')}</p>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full mb-2 overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, Math.round((usage.current / usage.limit) * 100))}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500">{usage.current} / {usage.limit} {t('importsUsed')}</p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-500 transition-all rounded-xl font-bold"
                    onClick={handleLogout}
                >
                    <span className="material-symbols-outlined mr-3">logout</span>
                    {t('logout')}
                </Button>
            </div>
        </aside>
    );
}
