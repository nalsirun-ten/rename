import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface FaqItem {
  id: string;
  question_ru: string;
  question_en: string;
  question_kg: string;
  answer_ru: string;
  answer_en: string;
  answer_kg: string;
  order_index: number;
}

interface FaqState {
  items: FaqItem[];
  isLoading: boolean;
  fetchFaq: () => Promise<void>;
}

export const useFaqStore = create<FaqState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchFaq: async () => {
    if (get().items.length > 0) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      set({ items: data || [] });
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
