
"use client";

import Link from "next/link";
import { useLangStore } from "@/stores/lang-store";

export function Footer() {
    const { t } = useLangStore();

    return (
        <footer className="bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">magic_button</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-whiteitalic italic">EtsyAuto</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
                            {t('footerTagline')}
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 dark:text-white mb-4">{t('product')}</h5>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><a className="hover:text-primary transition-colors" href="/#features">{t('features')}</a></li>
                            <li><Link className="hover:text-primary transition-colors" href="/pricing">{t('pricing')}</Link></li>
                            <li><a className="hover:text-primary transition-colors" href="#">{t('extensions')}</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">{t('updates')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 dark:text-white mb-4">{t('company')}</h5>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link className="hover:text-primary transition-colors" href="/about">{t('aboutUs')}</Link></li>
                            <li><a className="hover:text-primary transition-colors" href="#">{t('careers')}</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">{t('blog')}</a></li>
                            <li><Link className="hover:text-primary transition-colors" href="/contact">{t('contact')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-900 dark:text-white mb-4">{t('legal')}</h5>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link className="hover:text-primary transition-colors" href="/privacy">{t('privacyPolicy')}</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/terms">{t('termsOfService')}</Link></li>
                            <li><Link className="hover:text-primary transition-colors" href="/cookies">{t('cookiePolicy')}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                    © 2024 EtsyAuto AI. {t('builtForSellers')}
                </div>
            </div>
        </footer>
    );
}
