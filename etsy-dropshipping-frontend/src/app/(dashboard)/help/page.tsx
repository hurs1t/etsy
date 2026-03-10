
"use client";

import { useLangStore } from "@/stores/lang-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
    const { t } = useLangStore();

    const faqs = [
        { q: "How do I connect my Etsy shop?", a: "Go to Settings > Shop Connection and click 'Connect Etsy Shop'. Follow the OAuth process to authorize EtsyAuto." },
        { q: "Can I import products from Amazon?", a: "Currently we support AliExpress perfectly. Amazon and eBay support is coming in Q4 2024." },
        { q: "Is the AI content SEO optimized?", a: "Yes, our AI is trained on top-selling Etsy listings to generate titles and tags that rank high in search results." },
        { q: "How do I cancel my subscription?", a: "You can manage or cancel your subscription at any time from Settings > Billing." }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black italic tracking-tight uppercase">{t('helpCenter')}</h1>
                <p className="text-slate-500 font-medium">Need help? We've got you covered with guides and support.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-primary">book</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic tracking-tight uppercase">Documentation</h3>
                            <p className="text-sm text-slate-500 font-medium">Read our full guide on how to scale your Etsy store.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-blue-600">support_agent</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic tracking-tight uppercase">Support Chat</h3>
                            <p className="text-sm text-slate-500 font-medium">Talk to our experts for personalized help.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary italic">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-8">
                        {faqs.map((faq, i) => (
                            <div key={i} className="space-y-2 pb-6 border-b border-slate-50 dark:border-zinc-800/50 last:border-0 last:pb-0">
                                <h4 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">{faq.q}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="bg-primary p-12 rounded-[3rem] text-white text-center shadow-2xl shadow-primary/30 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 skew-y-6 transform origin-top-left"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tight mb-6">Still have questions?</h2>
                    <p className="text-white/80 font-bold mb-10 max-w-xl mx-auto">Our support team is available 24/7 to help you with any technical or business questions.</p>
                    <Button className="bg-white text-primary font-black px-12 py-7 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">
                        Contact Support Team
                    </Button>
                </div>
            </div>
        </div>
    );
}
