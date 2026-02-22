
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CreditCard, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLangStore();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<any>(null);

    useEffect(() => {
        const planName = searchParams.get("plan") || "Starter";
        const price = searchParams.get("price") || "29";
        setPlan({ name: planName, price: price });
    }, [searchParams]);

    const handlePayment = async () => {
        setLoading(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        toast.success("Payment successful! Redirecting to dashboard...");
        router.push("/dashboard");
    };

    if (!plan) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans antialiased text-slate-900 dark:text-zinc-100">
            <header className="h-20 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-10 justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary p-2 rounded-xl">
                        <span className="material-symbols-outlined text-white">magic_button</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight uppercase italic">{t('dashboard')}</span>
                </Link>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-16 px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Order Review & Payment */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black tracking-tight uppercase italic">Complete Subscription</h2>
                        <p className="text-slate-500 font-medium">Unlock full Etsy growth features for your business.</p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
                            <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full h-14 bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-5 text-sm font-bold focus:border-primary transition-all outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full h-14 bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-5 text-sm font-bold focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">CVV</label>
                                        <input
                                            type="text"
                                            placeholder="***"
                                            className="w-full h-14 bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-5 text-sm font-bold focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="JOHN DOE"
                                    className="w-full h-14 bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl px-5 text-sm font-bold focus:border-primary transition-all outline-none uppercase"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
                            <Button
                                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 text-lg transition-all active:scale-95"
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : `Subscribe for $${plan.price}/Month`}
                            </Button>
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">7-day free trial included • Cancel anytime</p>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-between gap-6 opacity-60">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">PCI Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">256-bit AES</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Summary & FAQ */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Summary Card */}
                    <div className="bg-slate-900 border border-zinc-700/50 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Summary</h3>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h4 className="text-2xl font-black italic tracking-tight">{plan.name} Plan</h4>
                                    <p className="text-zinc-400 text-sm font-medium">Billed Monthly</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black">${plan.price}</p>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">/Month</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-zinc-800">
                                <div className="flex justify-between text-zinc-400">
                                    <span className="text-sm font-medium">Subtotal</span>
                                    <span className="text-sm font-bold text-white">${plan.price}.00</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span className="text-sm font-medium">Tax (0%)</span>
                                    <span className="text-sm font-bold text-white">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl mt-4">
                                    <span className="font-black uppercase tracking-widest text-[10px]">Total Due Today</span>
                                    <span className="text-2xl font-black text-primary">$0.00</span>
                                </div>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-center">Your card will be charged after 7 days</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Mini */}
                    <div className="space-y-6 px-4">
                        <h4 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            Help & Billing FAQ <ChevronRight className="w-4 h-4 text-primary" />
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <h5 className="font-bold text-sm mb-1">Can I cancel anytime?</h5>
                                <p className="text-xs text-slate-500 leading-relaxed">Yes, you can cancel your subscription from your account settings at any point. No hidden fees.</p>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm mb-1">Secure Payments?</h5>
                                <p className="text-xs text-slate-500 leading-relaxed">Your payment information is encrypted and never stored on our servers. Transactions are handled via Stripe.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-zinc-800 text-center">
                <div className="flex justify-center gap-8 mb-6">
                    <Link href="/terms" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</Link>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">© 2024 EtsyAuto AI. Built for professional sellers.</p>
            </footer>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-zinc-950"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
