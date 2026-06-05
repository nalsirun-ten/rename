import ru from './ru';
import type { Language } from '../stores/language';

// ─── Key type (derived from Russian — the reference language) ──────────
export type TranslationKey = keyof typeof ru;

// ─── Russian is always loaded (default language) ───────────────────────
export { ru };

// ─── Lazy-loaded languages ─────────────────────────────────────────────
let enCache: Record<string, string> | null = null;
let kgCache: Record<string, string> | null = null;
let enLoading: Promise<void> | null = null;
let kgLoading: Promise<void> | null = null;

export async function loadLanguage(lang: Language): Promise<void> {
  if (lang === 'ru') return; // already loaded
  if (lang === 'en') {
    if (enCache) return;
    if (enLoading) return enLoading;
    enLoading = import('./en')
      .then(m => { enCache = m.default; })
      .catch(err => {
        console.error('Failed to load English translations:', err);
        enLoading = null; // allow retry on next attempt
      });
    return enLoading;
  }
  if (lang === 'kg') {
    if (kgCache) return;
    if (kgLoading) return kgLoading;
    kgLoading = import('./kg')
      .then(m => { kgCache = m.default; })
      .catch(err => {
        console.error('Failed to load Kyrgyz translations:', err);
        kgLoading = null; // allow retry on next attempt
      });
    return kgLoading;
  }
}

export function getTranslation(key: TranslationKey, lang: Language): string {
  if (lang === 'ru') {
    return ru[key] ?? key;
  }
  const cache = lang === 'en' ? enCache : kgCache;
  if (cache) {
    return cache[key] ?? ru[key] ?? key;
  }
  // Fallback: if lazy load hasn't finished, use Russian
  return ru[key] ?? key;
}
