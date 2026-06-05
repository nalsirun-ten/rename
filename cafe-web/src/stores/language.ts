import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ru' | 'en' | 'kg';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ru',
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: 'cafe-language',
    }
  )
);
