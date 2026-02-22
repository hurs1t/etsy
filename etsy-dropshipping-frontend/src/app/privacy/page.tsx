
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function PrivacyPage() {
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 antialiased font-sans">
            {/* Header */}
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
                    <h1 className="text-4xl font-black mb-8 tracking-tight uppercase italic">{t('privacyPolicy')}</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
                        <p className="text-lg leading-relaxed">
                            At EtsyAuto, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
                            <p>We collect information that you provide directly to us when you create an account, use our extension, or communicate with us.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Account Information:</strong> Name, email address, and password.</li>
                                <li><strong>Shop Data:</strong> If linked, we access your Etsy shop data via API to facilitate uploads.</li>
                                <li><strong>Usage Data:</strong> Information about how you interact with our platform and extension.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
                            <p>We use the collected data to provide, maintain, and improve our services, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Optimizing your product listings with AI.</li>
                                <li>Synchronizing data between AliExpress and Etsy.</li>
                                <li>Providing customer support and technical assistance.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Data Security</h2>
                            <p>We implement robust security measures to protect your data. Your Etsy API tokens are encrypted and handled with extreme care. We never store your payment information on our servers; all transactions are handled by PCI-compliant partners like Stripe.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Your Rights</h2>
                            <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.</p>
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

