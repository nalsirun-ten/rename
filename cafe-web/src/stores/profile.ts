import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ─── Tier system (exact copy of Flutter TierUtils) ───
const TIERS = [
  { name: 'Любитель', nameKey: 'tier_iron', image: 'coffee_bean', min: 0, max: 100, cb: 3 },
  { name: 'Ценитель', nameKey: 'tier_gold', image: 'coffee_leaf', min: 100, max: 500, cb: 5 },
  { name: 'Знаток', nameKey: 'tier_sapphire', image: 'golden_bean', min: 500, max: 1000, cb: 7 },
  { name: 'Гурман', nameKey: 'tier_diamond', image: 'diamond_bean', min: 1000, max: 9999999, cb: 10 },
];

export function getTierForVisits(visits: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (visits >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTierForVisits(visits: number) {
  for (let i = 0; i < TIERS.length; i++) {
    if (visits < TIERS[i].max) {
      return i + 1 < TIERS.length ? TIERS[i + 1] : null;
    }
  }
  return null;
}

interface ProfileState {
  id: string | null;
  name: string;
  phone: string;
  points: number;
  visits: number;
  loyaltyNumber: string;
  photo?: string | null;
  updateProfile: (data: Partial<Omit<ProfileState, 'updateProfile' | 'fetchProfile'>>) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  id: null,
  name: 'Загрузка...',
  phone: '',
  points: 0,
  visits: 0,
  loyaltyNumber: '000000',
  photo: null,
  
  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      set({
        id: data.id,
        name: data.full_name || 'Гость',
        phone: data.phone || '',
        points: data.points_balance || 0,
        visits: data.stamps_count || 0,
        loyaltyNumber: '000000', // not in DB yet
        photo: data.avatar_url || null,
      });
    }
  },

  updateProfile: async (data) => {
    // Optimistic update
    set((state) => ({ ...state, ...data }));
    
    // Save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const updates = {
        full_name: data.name,
        avatar_url: data.photo,
      };
      // remove undefined
      Object.keys(updates).forEach(key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]);
      
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);
    }
  },
}));
