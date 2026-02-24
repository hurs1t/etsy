
"use client";

import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PricingPage() {
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="bg-background-light dark:bg-background-dark min-h-screen" />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-primary">
                                <span className="material-symbols-outlined text-3xl">auto_fix_high</span>
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white italic">EtsyAuto</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-bold">{t('login')}</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-primary hover:bg-primary/90 text-white font-bold">{t('startTrial')}</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="py-16 lg:py-24">
                {/* Hero */}
                <div className="max-w-4xl mx-auto px-4 text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.1] uppercase italic">
                        {t('pricingHero')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto font-medium">
                        {t('pricingSub')}
                    </p>

                    {/* Billing Toggle (Visual Only) */}
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm font-bold text-slate-500">{t('monthly')}</span>
                        <div className="relative flex h-10 w-48 items-center justify-between rounded-full bg-slate-100 dark:bg-zinc-800 p-1 cursor-pointer">
                            <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white dark:bg-zinc-700 shadow-sm transition-all shadow-lg" id="toggle-bg"></div>
                            <button className="z-10 w-1/2 text-[10px] font-black uppercase tracking-widest text-primary">{t('monthly')}</button>
                            <button className="z-10 w-1/2 text-[10px] font-black uppercase tracking-widest text-slate-500">{t('yearly')}</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-500">{t('yearly')}</span>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black text-primary animate-pulse">
                                {t('save20')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {/* Starter */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-10 flex flex-col hover:shadow-2xl transition-all duration-300 group">
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('starter')}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-black text-slate-900 dark:text-white italic">$9.99</span>
                                <span className="text-slate-400 font-bold">/mo</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Perfect for new Etsy sellers just getting started.</p>
                        </div>
                        <Link href="/checkout?plan=Silver&price=9.99" className="w-full">
                            <Button className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-black py-7 rounded-2xl mb-10 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
                                {t('startFreeTrial')}
                            </Button>
                        </Link>
                        <ul className="space-y-5 flex-grow">
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('shopLimit1')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('basicAnalytics')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('dailySync')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('emailSupport')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Pro */}
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border-4 border-primary p-10 flex flex-col shadow-3xl shadow-primary/20 scale-105 z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full whitespace-nowrap">
                            {t('mostPopular')}
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">{t('pro')}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-6xl font-black text-slate-900 dark:text-white italic">$19.99</span>
                                <span className="text-slate-400 font-bold">/mo</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium font-bold">Everything you need to scale your revenue to the moon.</p>
                        </div>
                        <Link href="/checkout?plan=Gold&price=19.99" className="w-full">
                            <Button className="w-full bg-primary text-white font-black py-8 rounded-2xl mb-10 hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 uppercase tracking-widest text-xs">
                                {t('getProAccess')}
                            </Button>
                        </Link>
                        <ul className="space-y-5 flex-grow font-bold">
                            <li className="flex items-center gap-3 text-sm">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('shopLimit3')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('aiSeoTags')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('bulkImport')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('dailySync')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('prioritySupport')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Business */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-10 flex flex-col hover:shadow-2xl transition-all duration-300">
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('business')}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-black text-slate-900 dark:text-white italic">$29.99</span>
                                <span className="text-slate-400 font-bold">/mo</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">The ultimate toolkit for power sellers running an empire.</p>
                        </div>
                        <Link href="/checkout?plan=Platinum&price=29.99" className="w-full">
                            <Button className="w-full bg-slate-900 text-white font-black py-7 rounded-2xl mb-10 hover:bg-black transition-all uppercase tracking-widest text-xs">
                                {t('startScalingNow')}
                            </Button>
                        </Link>
                        <ul className="space-y-5 flex-grow">
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('shopLimitUnlimited')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('competitorTool')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('multiShop')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                <span>{t('dedicatedAccount')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* FAQ or Trust Badges (Simplified) */}
                <div className="max-w-3xl mx-auto px-4 text-center mt-32">
                    <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10">
                        <span className="material-symbols-outlined text-6xl text-primary mb-6">verified_user</span>
                        <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tight italic">30-Day Money Back Guarantee</h2>
                        <p className="text-slate-500 font-bold leading-relaxed mb-8">Not satisfied? We'll refund your first month, no questions asked. We're here to help you succeed, not just take your money.</p>
                        <Button className="bg-primary text-white font-black px-12 py-7 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-widest text-xs">
                            Join 5,000+ Sellers
                        </Button>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-slate-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© 2024 EtsyAuto AI Optimization System</p>
                </div>
            </footer>
        </div>
    );
}
