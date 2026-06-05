import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';
import type { TranslationKey } from '../i18n/translations';

// ─── Types ───────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'event' | 'promo' | 'info' | 'service';
  imageUrl?: string;
  createdAt?: string;
}

// ─── Category config ─────────────────────────────────────────────────

const CATEGORY_TAGS: Record<NewsItem['category'], string> = {
  event: 'Событие',
  promo: 'Акция',
  info: 'Новость',
  service: 'Сервис',
};

export function getCategoryTag(category: NewsItem['category']): string {
  return CATEGORY_TAGS[category] ?? 'Новость';
}

const CATEGORY_TAG_KEYS: Record<NewsItem['category'], TranslationKey> = {
  event: 'news_category_event',
  promo: 'news_category_promo',
  info: 'news_category_info',
  service: 'news_category_service',
};

export function getCategoryTagKey(category: NewsItem['category']): TranslationKey {
  return CATEGORY_TAG_KEYS[category] ?? 'news_category_info';
}

export function getCategoryColor(category: NewsItem['category']): string {
  switch (category) {
    case 'promo': return '#EF4444';
    case 'event': return '#8B5CF6';
    case 'service': return '#10B981';
    case 'info': default: return '#3B82F6';
  }
}

// MOCK_NEWS is removed, we fetch from Supabase
// ─── Store ───────────────────────────────────────────────────────────

interface NewsState {
  news: NewsItem[];
  isLoading: boolean;
  lastFetchedAt: number;
  fetchNews: (force?: boolean) => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      news: [],
      isLoading: false,
      lastFetchedAt: 0,
      fetchNews: async (force = false) => {
        // Skip if loaded AND recently fetched (unless forced)
        const state = get();
        if (!force && state.news.length > 0 && Date.now() - state.lastFetchedAt < CACHE_TTL_MS) return;
    // Only show skeletons on initial load, not on background refresh
    const hasExisting = get().news.length > 0;
    if (!hasExisting) set({ isLoading: true });
    const { data, error } = await retry(() => supabase.from('news_posts').select('*').order('created_at', { ascending: false }));
    if (data && !error) {
      set({
        news: data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          imageUrl: item.image_url,
          createdAt: item.created_at,
          category: 'info' as const, // DB is missing category, fallback to info
        })),
        lastFetchedAt: Date.now(),
      });
    }
    set({ isLoading: false });
  }
}),
    {
      name: 'cafe-news-storage',
      partialize: (state) => ({ news: state.news, lastFetchedAt: state.lastFetchedAt }),
    }
  )
);
