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
interface StoriesState {
  stories: Story[];
  isLoading: boolean;
  seenStories: Record<string, boolean>;
  activeStoryId: string | null;
  markAsSeen: (id: string) => void;
  openStory: (id: string) => void;
  closeStory: () => void;
  fetchStories: () => Promise<void>;
}

export const useStoriesStore = create<StoriesState>()(
  persist(
    (set) => ({
      stories: [],
      isLoading: false,
      seenStories: {},
      activeStoryId: null,
      markAsSeen: (id: string) =>
        set((state) => ({ seenStories: { ...state.seenStories, [id]: true } })),
      openStory: (id: string) => set({ activeStoryId: id }),
      closeStory: () => set({ activeStoryId: null }),
  fetchStories: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category as any,
        imageUrl: s.image_url,
        videoUrl: s.video_url,
        description: s.description,
        createdAt: s.created_at,
      }));
      set({ stories: formatted });
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      set({ isLoading: false });
    }
  },
    }),
    {
      name: 'cafe-stories-storage',
      partialize: (state) => ({ seenStories: state.seenStories }),
    }
  )
);
