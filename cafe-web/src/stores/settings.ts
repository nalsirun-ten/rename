import { create } from 'zustand';

// ─── App settings — mirrors Flutter appSettingsProvider ───
// Keys: instagram_url, whatsapp_url, etc.
// Will be wired to Supabase later.

const MOCK_SETTINGS: Record<string, string> = {
  instagram_url: 'https://instagram.com/cafe',
  whatsapp_url: 'https://wa.me/996555123456',
};

interface SettingsState {
  settings: Record<string, string>;
  get: (key: string) => string | undefined;
}

export const useSettingsStore = create<SettingsState>((_set, get) => ({
  settings: MOCK_SETTINGS,
  get: (key: string) => get().settings[key],
}));
