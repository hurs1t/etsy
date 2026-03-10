
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CookiesPage() {
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 antialiased font-sans">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 dark:border-zinc-800">
                    <h1 className="text-4xl font-black mb-8 tracking-tight uppercase italic">{t('cookiePolicy')}</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
                        <p className="text-lg leading-relaxed">
                            This Cookie Policy explains how EtsyAuto uses cookies and similar technologies to recognize you when you visit our website.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What are cookies?</h2>
                            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How we use cookies?</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Essential Cookies:</strong> These are required for the operation of our service (e.g., maintaining your login session).</li>
                                <li><strong>Preference Cookies:</strong> Used to remember your selected language and other UI settings.</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform to improve performance.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Controlling Cookies</h2>
                            <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you.</p>
                        </section>

                        <p className="pt-8 text-sm italic">Last updated: October 2024</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
