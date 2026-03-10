
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
                try {
                    const langData = (translations[lang as Language] || translations['en']) as Record<string, string>;
                    return langData[key as string] || (translations['en'] as Record<string, string>)[key as string] || (key as string);
                } catch (e) {
                    return (translations['en'] as any)[key] || key;
                }
            },
        }),
        {
            name: 'lang-storage',
        }
    )
);
