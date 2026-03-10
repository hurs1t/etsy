
"use client";

import { useEffect, useState } from "react";
import { useLangStore } from "@/stores/lang-store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HowItWorks() {
    const { t } = useLangStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const steps = [
        {
            number: "01",
            title: t('step1Title'),
            description: t('step1Desc'),
            icon: "extension",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH2TtiBBWw3MRc7azPbjoZGzbhHtdeRv3B58uK27rEvEGPW7A853rEhwXsUOdfj5evzQdexvSsled5NWPDHRiTnaE8IgzBX4hJLOks91PdC6wSRIL0rCMn7ILOSyfz0EwStnEFVLqIPAeTg_M129bAFYGUEusv1oQ89Opvvs46b9teS5yhbvMPs7rJXBqx_GcZOgnmkQsVUaLDqhmrN9cqdhwz_1nLjst0RWbhyXuWsSMB_-Wp0A_TETZ1vH0UctCzVD-UPU2FLoc7"
        },
        {
            number: "02",
            title: t('step2Title'),
            description: t('step2Desc'),
            icon: "auto_awesome",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBilDmNhwUsm19i2Xut60eJI7C5uL7yz3S2V-Mlc9VWhFdH97YrEBQYzwHr3Eji8gW1Fl8tnLEuiGcJIkNXqchjEG_BR8LzVJzDvYDB91G_LyL7ZM3pzMaNlJs1dAgL1kgvhAJYbmLffP8hzvvyeRdRLplY2avMchjVdIEFraHkIirnU_TzkYzPKoV6sNQ0jmIR--qhQh1t42Gi1za51pKnt9JZqE4_lVZfSmu31i3Mq9hGSVi3EAQk8VKxiPXjK4K8iUjmdOxS2kpJ"
        },
        {
            number: "03",
            title: t('step3Title'),
            description: t('step3Desc'),
            icon: "rocket_launch",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH2TtiBBWw3MRc7azPbjoZGzbhHtdeRv3B58uK27rEvEGPW7A853rEhwXsUOdfj5evzQdexvSsled5NWPDHRiTnaE8IgzBX4hJLOks91PdC6wSRIL0rCMn7ILOSyfz0EwStnEFVLqIPAeTg_M129bAFYGUEusv1oQ89Opvvs46b9teS5yhbvMPs7rJXBqx_GcZOgnmkQsVUaLDqhmrN9cqdhwz_1nLjst0RWbhyXuWsSMB_-Wp0A_TETZ1vH0UctCzVD-UPU2FLoc7"
        }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="py-20 lg:py-32 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-8">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Setup Guide
                        </div>
                        <h1 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight italic">
                            How it <span className="text-primary italic">Actually</span> Works
                        </h1>
                        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
                            Everything you need to know to automate your Etsy dropshipping business from AliExpress in under 60 seconds.
                        </p>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="space-y-32">
                            {steps.map((step, index) => (
                                <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
                                    <div className="lg:w-1/2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="text-6xl font-black text-primary/20">{step.number}</span>
                                            <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800"></div>
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tight">{step.title}</h2>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                                            {step.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                <span className="material-symbols-outlined text-primary">{step.icon}</span>
                                                <span className="font-bold text-sm">Automated Workflow</span>
                                            </div>
                                            <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                <span className="font-bold text-sm">Ready in Seconds</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:w-1/2 relative">
                                        <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl"></div>
                                        <div className="relative rounded-[2rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl">
                                            <img src={step.image} alt={step.title} className="w-full aspect-video object-cover" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ / Final CTA */}
                <section className="py-24 bg-slate-900 dark:bg-black text-white text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className="text-3xl lg:text-5xl font-black mb-8 italic tracking-tight">Stop Wasting Time on Manual Listings</h2>
                        <p className="text-xl text-slate-400 mb-12 font-medium">Join thousands of sellers who have automated their entire workflow with EtsyAuto AI.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/register">
                                <Button className="bg-primary text-white font-black px-12 py-8 rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-widest hover:scale-105 transition-all">
                                    Start Your Free Trial
                                </Button>
                            </Link>
                            <Link href="/pricing" className="text-slate-400 hover:text-white font-bold transition-colors">
                                View Pricing Plans
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
