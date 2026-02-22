
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
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
                <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-2xl font-bold">sync_alt</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight">EtsyAuto</h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">AliExpress Tool</p>
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
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <span className={cn(
                                "material-symbols-outlined",
                                route.isPro && !isActive ? "text-ai-glow" : ""
                            )}>
                                {route.icon}
                            </span>
                            {route.label}
                            {route.isPro && (
                                <span className="ml-auto text-[10px] bg-ai-glow/10 text-ai-glow px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Pro</span>
                            )}
                        </Link>
                    );
                })}

                <div className="pt-4 pb-2">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support</p>
                </div>
                <Link
                    href="/help"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <span className="material-symbols-outlined">help_outline</span>
                    {t('helpCenter')}
                </Link>
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 mb-4">
                    <p className="text-xs font-semibold mb-2">{t('usageLimit')}</p>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full mb-2">
                        <div className="bg-primary h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-[10px] text-slate-500">750 / 1,000 imports used</p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-500 transition-all rounded-lg"
                    onClick={handleLogout}
                >
                    <span className="material-symbols-outlined mr-3">logout</span>
                    {t('logout')}
                </Button>
            </div>
        </aside>
    );
}
