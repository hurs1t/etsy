"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CreditCard, Shield, HelpCircle, Star, Verified, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLangStore();
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<{ name: string; price: string } | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        const planName = searchParams.get("plan") || "Starter";
        const price = searchParams.get("price") || "29";
        setPlan({ name: planName, price: price });
    }, [searchParams]);

    const handleCheckout = async () => {
        if (!token) {
            toast.error("Please login to proceed with checkout");
            router.push("/login?redirect=/checkout");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/payments/create-checkout-session`, {
                planType: plan?.name
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data?.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("Failed to create checkout session");
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!plan) return null;

    const displayPrice = billingCycle === 'yearly'
        ? (parseInt(plan.price) * 12 * 0.8).toFixed(2)
        : plan.price;

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans min-h-screen antialiased">
            {/* Top Navigation Bar */}
            <header className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">magic_button</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase italic">EtsyAuto</h1>
                    </Link>
                    <Link className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest" href="/pricing">
                        <ArrowLeft className="w-4 h-4" />
                        {t('pricing')}
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Checkout Form */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Header Section */}
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Checkout</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Complete your subscription to unlock {plan.name} features.</p>
                        </div>

                        {/* Billing Cycle Selector - Simplified for design parity */}
                        <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 flex shadow-sm max-w-md">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`flex-1 py-3 text-center rounded-xl transition-all font-bold text-sm uppercase tracking-widest ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`flex-1 py-3 text-center rounded-xl transition-all font-bold text-sm uppercase tracking-widest relative ${billingCycle === 'yearly' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Yearly
                                <span className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">Save 20%</span>
                            </button>
                        </div>

                        {/* Payment Method Preview (Actual payment handled by Stripe) */}
                        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 md:p-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <CreditCard className="text-primary w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight">Payment Method</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="p-6 bg-slate-50 dark:bg-zinc-950 border-2 border-primary/20 rounded-2xl flex items-center justify-between border-dashed">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                                            <Verified className="text-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-widest">Secure Stripe Checkout</p>
                                            <p className="text-xs text-slate-500 font-medium">You'll be redirected to Stripe to finish safely.</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="text-primary w-6 h-6" />
                                </div>

                                <div className="flex items-start gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <Shield className="text-blue-500 w-6 h-6 flex-shrink-0" />
                                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                        Your security is our priority. We use 256-bit SSL encryption. We never store your full card details on our servers.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <Button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-8 rounded-2xl shadow-2xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] text-xl uppercase tracking-[0.1em]"
                        >
                            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : `Subscribe Now — $${displayPrice}`}
                        </Button>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-12 py-6 opacity-40">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">SSL Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Verified className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">PCI Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">7-Day Trial</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary & FAQ */}
                    <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                        {/* Order Summary Card */}
                        <aside className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-xl">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Order Summary</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xl font-black italic tracking-tight">{plan.name} Plan</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Billed {billingCycle}</p>
                                    </div>
                                    <span className="text-xl font-black">${displayPrice}</span>
                                </div>

                                <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 space-y-3">
                                    <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-slate-900 dark:text-white">${displayPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
                                        <span>Tax</span>
                                        <span className="text-slate-900 dark:text-white">$0.00</span>
                                    </div>
                                </div>

                                <div className="border-t-2 border-slate-100 dark:border-zinc-800 pt-6 flex justify-between items-center bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl">
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Due Today</span>
                                    <span className="text-3xl font-black text-primary">$0.00</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-black text-center uppercase tracking-widest">Free trial for 7 days, then ${displayPrice}/{billingCycle}</p>
                            </div>
                        </aside>

                        {/* FAQ Sidebar */}
                        <aside className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" /> Billing FAQ
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black italic">Can I cancel anytime?</h4>
                                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">Yes, you can cancel your subscription from your settings at any point. No questions asked.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black italic">Accepted payments?</h4>
                                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">We accept all major global credit cards, Apple Pay, and Google Pay through Stripe.</p>
                                </div>
                            </div>
                        </aside>

                        {/* Testimonial Small */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}
                            </div>
                            <p className="text-xs text-slate-500 italic font-medium leading-relaxed">"This tool doubled my sales in just 3 months. The AI optimization is game-changing."</p>
                            <p className="text-[10px] mt-4 font-black uppercase tracking-widest text-slate-400">— Sarah, Vintage Jewelry Shop</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center border-t border-slate-200 dark:border-zinc-800 mt-12">
                <div className="flex justify-center gap-10 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
                    <Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
                    <Link className="hover:text-primary transition-colors" href="/cookies">Refund Policy</Link>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">© 2024 EtsyAuto AI. All rights reserved.</p>
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
