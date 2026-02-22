
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function TermsPage() {
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 antialiased font-sans">
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">magic_button</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EtsyAuto</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <Link href="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {t('login')}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 dark:border-zinc-800">
                    <h1 className="text-4xl font-black mb-8 tracking-tight uppercase italic">{t('termsOfService')}</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
                        <p className="text-lg leading-relaxed">
                            By using EtsyAuto, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms carefully.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Acceptance of Agreement</h2>
                            <p>You agree to the terms and conditions outlined in this Terms of Service Agreement with respect to our platform and services. This Agreement constitutes the entire and only agreement between us and you.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Use of Service</h2>
                            <p>Our service is intended for Etsy sellers looking to automate product listing processes. You are responsible for ensuring your use of EtsyAuto complies with Etsy's Seller Policy and Terms of Use.</p>
                            <p>You may not use our service for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Subscription and Billing</h2>
                            <p>Subscription fees are billed in advance on a monthly or annual basis and are non-refundable. There will be no refunds or credits for partial months of service, upgrade/downgrade refunds, or refunds for months unused.</p>
                            <p>All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities, and you shall be responsible for payment of all such taxes.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Modifications to the Service</h2>
                            <p>EtsyAuto reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>
                        </section>

                        <p className="pt-8 text-sm italic">Last updated: October 2024</p>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-zinc-800 py-8 text-center text-xs text-slate-400">
                © 2024 EtsyAuto AI. All rights reserved.
            </footer>
        </div>
    );
}

