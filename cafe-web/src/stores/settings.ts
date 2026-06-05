import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  get: (key: string) => string | undefined;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoading: false,
  get: (key: string) => get().settings[key],

  fetchSettings: async () => {
    // Only fetch if empty to avoid extra calls (can add a forced fetch if needed)
    if (Object.keys(get().settings).length > 0) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('settings_key, settings_value');

      if (error) throw error;

      const newSettings: Record<string, string> = {};
      data?.forEach(row => {
        newSettings[row.settings_key] = row.settings_value;
      });

      set({ settings: newSettings });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
