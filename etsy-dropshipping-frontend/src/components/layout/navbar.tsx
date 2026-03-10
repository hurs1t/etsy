
"use client";

import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const { t } = useLangStore();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">magic_button</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white italic">EtsyAuto</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="/#features">{t('features')}</Link>
                        <Link className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="/how-it-works">{t('howItWorks')}</Link>
                        <Link className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="/pricing">{t('pricing')}</Link>
                        <Link className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="/#testimonials">{t('testimonials')}</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link href="/login">
                            <button className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-all">{t('login')}</button>
                        </Link>
                        <Link href="/register">
                            <button className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition-all shadow-md shadow-primary/20">
                                {t('startTrial')}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
