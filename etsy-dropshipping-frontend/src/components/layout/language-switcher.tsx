
"use client";

import { useLangStore } from "@/stores/lang-store";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const { lang, setLang } = useLangStore();

    return (
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-primary'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLang('tr')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'tr'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-primary'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
            >
                TR
            </button>
        </div>
    );
}
