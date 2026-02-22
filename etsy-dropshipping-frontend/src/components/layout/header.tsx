
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useLangStore } from "@/stores/lang-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function Header() {
    const { user } = useAuthStore();
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0" />;
    }

    return (
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-slate-400 material-symbols-outlined">cloud_done</span>
                <span className="text-xs font-medium text-slate-500">{t('apiConnected')}</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-900"></span>
                </button>
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-zinc-800">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.fullName || 'User'}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{user?.email}</p>
                    </div>
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-zinc-700">
                        <AvatarImage src={`https://i.pravatar.cc/100?u=${user?.email}`} />
                        <AvatarFallback>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
