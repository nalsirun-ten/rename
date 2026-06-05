import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Vacancy {
  id: string;
  title: string;
  salary: string;
  description: string;
  created_at: string;
}

interface VacanciesState {
  vacancies: Vacancy[];
  isLoading: boolean;
  fetchVacancies: () => Promise<void>;
}

export const useVacanciesStore = create<VacanciesState>((set, get) => ({
  vacancies: [],
  isLoading: false,

  fetchVacancies: async () => {
    if (get().vacancies.length > 0) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ vacancies: data as Vacancy[] });
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
