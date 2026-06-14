import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface AboutSection {
  id: string;
  icon: string;
  title_ru: string;
  title_en: string;
  title_kg: string;
  title_ko?: string;
  content_ru: string;
  content_en: string;
  content_kg: string;
  content_ko?: string;
  order_index: number;
}

interface AboutState {
  sections: AboutSection[];
  isLoading: boolean;
  fetchAbout: () => Promise<void>;
}

export const useAboutStore = create<AboutState>((set, get) => ({
  sections: [],
  isLoading: false,

  fetchAbout: async () => {
    if (get().sections.length > 0) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      set({ sections: data || [] });
    } catch (error) {
      console.error('Error fetching about sections:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
