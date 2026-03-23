
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  const { t } = useLangStore();
  const [isMounted, setIsMounted] = useState(false);
  const [userStats, setUserStats] = useState({ total: 0, limit: 100 });

  useEffect(() => {
    setIsMounted(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    fetch(apiUrl + '/auth/stats/users')
      .then(res => res.json())
      .then(data => setUserStats(data))
      .catch(err => console.error("Failed to fetch user stats", err));
  }, []);

  if (!isMounted) {
    return <div className="bg-background-light dark:bg-background-dark min-h-screen" />;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 whitespace-pre-line">
              {t('heroTitle').split(' ').map((word, i) => word === 'Etsy' || word === 'listings' ? <span key={i} className="text-primary">{word} </span> : word + ' ')}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('heroSub')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <button className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:brightness-110 transition-all shadow-xl shadow-primary/30 flex items-center gap-3">
                  {t('startFreeTrial')} <span className="material-symbols-outlined">rocket_launch</span>
                </button>
              </Link>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center">
              {userStats.total >= userStats.limit ? (
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                  Registration Limit Reached ({userStats.total}/{userStats.limit} Users)
                </p>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                    Beta Access: {userStats.total} / {userStats.limit} Spots Claimed
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{t('noCardRequired')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-2">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden aspect-[16/10] relative group">
                <img className="w-full h-full object-cover" alt="SaaS dashboard mockup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH2TtiBBWw3MRc7azPbjoZGzbhHtdeRv3B58uK27rEvEGPW7A853rEhwXsUOdfj5evzQdexvSsled5NWPDHRiTnaE8IgzBX4hJLOks91PdC6wSRIL0rCMn7ILOSyfz0EwStnEFVLqIPAeTg_M129bAFYGUEusv1oQ89Opvvs46b9teS5yhbvMPs7rJXBqx_GcZOgnmkQsVUaLDqhmrN9cqdhwz_1nLjst0RWbhyXuWsSMB_-Wp0A_TETZ1vH0UctCzVD-UPU2FLoc7" />
                <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-3/4 max-w-lg transform translate-y-8">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400">OPTIMIZING</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Crystal Table Lamp</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">SEO Score: 98%</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%]"></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                        <span>Generating Keywords</span>
                        <span className="text-primary">Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -z-10 -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">{t('trustedBy')}</h4>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 text-slate-500 dark:text-slate-400">
            <span className="text-xl font-bold italic tracking-tighter">Shopify</span>
            <span className="text-xl font-bold tracking-tighter uppercase">Amazon</span>
            <span className="text-xl font-bold tracking-tight">eBay</span>
            <span className="text-xl font-black italic">AliExpress</span>
            <span className="text-xl font-bold underline decoration-primary decoration-4 underline-offset-4">Etsy</span>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-background-light dark:bg-background-dark" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">{t('dominateEtsy')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t('growSalesAiDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('featureAiTitle')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{t('featureAiDesc')}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">sync_alt</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('featureSyncTitle')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{t('featureSyncDesc')}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">send</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('featureDraftTitle')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{t('featureDraftDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-slate-900/20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl"></div>
              <img className="relative rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700" alt="SaaS Workflow" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBilDmNhwUsm19i2Xut60eJI7C5uL7yz3S2V-Mlc9VWhFdH97YrEBQYzwHr3Eji8gW1Fl8tnLEuiGcJIkNXqchjEG_BR8LzVJzDvYDB91G_LyL7ZM3pzMaNlJs1dAgL1kgvhAJYbmLffP8hzvvyeRdRLplY2avMchjVdIEFraHkIirnU_TzkYzPKoV6sNQ0jmIR--qhQh1t42Gi1za51pKnt9JZqE4_lVZfSmu31i3Mq9hGSVi3EAQk8VKxiPXjK4K8iUjmdOxS2kpJ" />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-10 leading-tight">{t('workflow10x').split(',').map((p, i) => <span key={i} className={i === 1 ? 'text-primary' : ''}>{p}{(i === 0 && t('workflow10x').includes(',')) ? <br /> : ''}</span>)}</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-zinc-800 shadow-xl border border-slate-100 dark:border-zinc-700 text-primary font-black rounded-2xl flex items-center justify-center text-xl">1</div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('step1Title')}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t('step1Desc')}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-zinc-800 shadow-xl border border-slate-100 dark:border-zinc-700 text-primary font-black rounded-2xl flex items-center justify-center text-xl">2</div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('step2Title')}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t('step2Desc')}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-zinc-800 shadow-xl border border-slate-100 dark:border-zinc-700 text-primary font-black rounded-2xl flex items-center justify-center text-xl">3</div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('step3Title')}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t('step3Desc')}</p>
                  </div>
                </div>
              </div>
              <Link href="/register">
                <button className="mt-12 flex items-center gap-2 bg-slate-900 dark:bg-primary text-white font-bold px-8 py-4 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/30">
                  {t('startFreeTrial')} <span className="material-symbols-outlined">trending_flat</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="py-24 bg-background-light dark:bg-background-dark overflow-hidden relative" id="pricing">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-12 lg:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 transform translate-x-20"></div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">{t('scaleStore')}</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">{t('footerTagline')}</p>
            <div className="inline-flex flex-col sm:flex-row items-center gap-6">
              <Link href="/register">
                <button className="bg-primary text-white text-lg font-bold px-10 py-5 rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/40">
                  {t('getStartedFree')}
                </button>
              </Link>
              <div className="flex items-center gap-3 text-white/80">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                      <img className="w-full h-full object-cover" alt="User" src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">{t('joinUsers')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

