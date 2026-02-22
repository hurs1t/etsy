
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations } from '@/lib/translations';

interface LangState {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

export const useLangStore = create<LangState>()(
    persist(
        (set, get) => ({
            lang: 'en',
            setLang: (lang) => set({ lang }),
            t: (key) => {
                const { lang } = get();
                return translations[lang][key] || translations['en'][key] || key;
            },
        }),
        {
            name: 'lang-storage',
        }
    )
);
