import { useCallback } from 'react';
import { useLanguageStore } from '../stores/language';
import { getTranslation, type TranslationKey } from './translations';

export function useT() {
  const lang = useLanguageStore((s) => s.language);
  return useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = getTranslation(key, lang);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [lang]
  );
}
