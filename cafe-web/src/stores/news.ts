import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  fetchNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  isLoading: false,
  fetchNews: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('news_posts').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      set({
        news: data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          imageUrl: item.image_url,
          createdAt: item.created_at,
          category: 'info', // DB is missing category, fallback to info
        }))
      });
    }
    set({ isLoading: false });
  }
}));
