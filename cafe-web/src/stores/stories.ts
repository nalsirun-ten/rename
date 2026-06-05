import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Story {
  id: string;
  title: string;
  category: 'service' | 'promo' | 'menu' | 'places' | 'vip';
  imageUrl?: string;
  videoUrl?: string;
  description?: string;
  createdAt?: string;
}

export const CAT_CFG: Record<Story['category'], { name: string; icon: string; colors: [string, string] }> = {
  service: { name: 'Новинки', icon: '☕', colors: ['#80CBC4', '#4DB6AC'] },
  promo:   { name: 'Акции',   icon: '🏷️', colors: ['#FFD6A5', '#FF9F45'] },
  menu:    { name: 'Меню',    icon: '🥐', colors: ['#90CAF9', '#64B5F6'] },
  places:  { name: 'Места',   icon: '📍', colors: ['#FFDAC1', '#E8A87C'] },
  vip:     { name: 'VIP',     icon: '⭐', colors: ['#C5CAE9', '#9FA8DA'] },
};

import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';

const STORIES_PAGE_SIZE = 10;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface StoriesState {
  stories: Story[];
  isLoading: boolean;
  lastFetchedAt: number;
  error: string | null;
  seenStories: Record<string, boolean>;
  activeStoryId: string | null;
  _realtimeSetup: boolean;
  markAsSeen: (id: string) => void;
  openStory: (id: string) => void;
  closeStory: () => void;
  fetchStories: (force?: boolean) => Promise<void>;
}

export const useStoriesStore = create<StoriesState>()(
  persist(
    (set, get) => ({
      stories: [],
      isLoading: false,
      lastFetchedAt: 0,
      error: null,
      seenStories: {},
      activeStoryId: null,
      _realtimeSetup: false,
      markAsSeen: (id: string) =>
        set((state) => ({ seenStories: { ...state.seenStories, [id]: true } })),
      openStory: (id: string) => set({ activeStoryId: id }),
      closeStory: () => set({ activeStoryId: null }),
  fetchStories: async (force = false) => {
    // Skip if loaded AND recently fetched (unless forced)
    if (!force && get().stories.length > 0 && Date.now() - get().lastFetchedAt < CACHE_TTL_MS) return;
    const hasExisting = get().stories.length > 0;
    if (!hasExisting) set({ isLoading: true });
    try {
      const { data, error } = await retry(() => supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(STORIES_PAGE_SIZE));

      if (error) throw error;

      const formatted = (data || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        category: s.category as any,
        imageUrl: s.image_url,
        videoUrl: s.video_url,
        description: s.description,
        createdAt: s.created_at,
      }));
      set({ stories: formatted, lastFetchedAt: Date.now(), error: null });
    } catch (err: any) {
      console.error('Error fetching stories:', err);
      set({ error: err?.message || 'Failed to load stories' });
    } finally {
      set({ isLoading: false });
    }

    // Setup realtime subscription (once)
    if (!get()._realtimeSetup) {
      set({ _realtimeSetup: true });
      supabase
        .channel('stories-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
          get().fetchStories(true);
        })
        .subscribe();
    }
  },
    }),
    {
      name: 'cafe-stories-storage',
      partialize: (state) => ({ seenStories: state.seenStories }),
    }
  )
);
