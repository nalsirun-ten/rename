import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';
import type { TranslationKey } from '../i18n/translations';

// ─── Rewards system ───
export const REWARDS = [
  { visits: 20, nameKey: 'reward_20' as TranslationKey, image: 'cookie' },
  { visits: 40, nameKey: 'reward_40' as TranslationKey, image: 'coffee' },
  { visits: 60, nameKey: 'reward_60' as TranslationKey, image: 'croissant' },
  { visits: 80, nameKey: 'reward_80' as TranslationKey, image: 'cake' },
  { visits: 100, nameKey: 'reward_100' as TranslationKey, image: 'sandwich' },
  { visits: 120, nameKey: 'reward_120' as TranslationKey, image: 'salad' },
  { visits: 140, nameKey: 'reward_140' as TranslationKey, image: 'pasta' },
  { visits: 160, nameKey: 'reward_160' as TranslationKey, image: 'pizza' },
  { visits: 180, nameKey: 'reward_180' as TranslationKey, image: 'burger' },
  { visits: 200, nameKey: 'reward_200' as TranslationKey, image: 'rolls' },
  { visits: 300, nameKey: 'reward_300' as TranslationKey, image: 'steak' },
  { visits: 500, nameKey: 'reward_500' as TranslationKey, image: 'dinner' },
  { visits: 750, nameKey: 'reward_750' as TranslationKey, image: 'dinner' },
  { visits: 1000, nameKey: 'reward_1000' as TranslationKey, image: 'gift' },
];

export function getNextReward(visits: number) {
  for (let i = 0; i < REWARDS.length; i++) {
    if (visits < REWARDS[i].visits) {
      return REWARDS[i];
    }
  }
  const cycle = Math.floor((visits - 1000) / 250);
  const nextVisits = 1000 + (cycle + 1) * 250;
  return { visits: nextVisits, nameKey: 'reward_generic' as TranslationKey, image: 'gift' };
}

export function getAchievedRewards(visits: number) {
  return REWARDS.filter(r => visits >= r.visits);
}

interface ProfileState {
  id: string | null;
  name: string;
  phone: string;
  visits: number;
  stamps: number;
  loyaltyNumber: string;
  photo?: string | null;
  lastRouletteSpin: string | null;
  activePrize: string | null;
  updateProfile: (data: Partial<Omit<ProfileState, 'updateProfile' | 'fetchProfile' | 'requestPushPermission' | 'signOut' | 'recordRouletteSpin'>>, avatarFile?: File | null) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  recordRouletteSpin: (prize: string) => Promise<void>;
  requestPushPermission: (vapidKey: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isOnboarded: boolean;
  setOnboarded: (val: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  id: null,
  name: 'Загрузка...',
  phone: '',
  visits: 0,
  stamps: 0,
  loyaltyNumber: '000000',
  photo: null,
  lastRouletteSpin: null,
  activePrize: null,
  isLoading: true,
  isOnboarded: true,
  setOnboarded: (val: boolean) => set({ isOnboarded: val }),
  
  fetchProfile: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await retry(() => supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single());
      
    if (data && !error) {
      set({
        id: data.id,
        name: data.full_name || 'Гость',
        phone: data.phone || '',
        visits: data.visits || 0,
        stamps: data.stamps_count || 0,
        loyaltyNumber: data.loyalty_number || '000000',
        photo: data.avatar_url || null,
        lastRouletteSpin: data.last_roulette_spin || null,
        activePrize: data.active_prize || null,
        isOnboarded: !!data.full_name,
      });
    }
    set({ isLoading: false });
  },

  updateProfile: async (data, avatarFile) => {
    const optimisticData = { ...data };
    if (avatarFile) delete optimisticData.photo;
    
    set((state) => ({ ...state, ...optimisticData }));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const updates: any = {};
      if (data.name !== undefined) updates.full_name = data.name;

      if (avatarFile) {
        const oldPhotoUrl = get().photo;
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          updates.avatar_url = publicUrlData.publicUrl;
          set({ photo: updates.avatar_url });

          if (oldPhotoUrl) {
            const oldFileName = oldPhotoUrl.split('/').pop();
            if (oldFileName) {
              supabase.storage.from('avatars').remove([oldFileName]).catch(err => console.error('Error deleting old avatar:', err));
            }
          }
        } else {
          console.error('Error uploading avatar:', uploadError);
        }
      } else if (data.photo === null) {
        const oldPhotoUrl = get().photo;
        if (oldPhotoUrl) {
          const oldFileName = oldPhotoUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('avatars').remove([oldFileName]).catch(err => console.error('Error deleting avatar:', err));
          }
        }
        updates.avatar_url = null;
        set({ photo: null });
      }
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', session.user.id);
      }
    }
  },

  recordRouletteSpin: async (prize: string) => {
    const { id } = get();
    if (!id) return;
    const now = new Date().toISOString();
    
    set({ lastRouletteSpin: now });

    const updates: any = { last_roulette_spin: now };
    
    if (prize !== 'Следующий раз повезет' && prize !== 'Банкрот') {
      updates.active_prize = prize;
      set({ activePrize: prize });
    }

    await supabase.from('profiles').update(updates).eq('id', id);
  },

  signOut: async () => {
    try {
      try {
        const { messaging } = await import('../lib/firebase');
        const messagingInstance = await messaging();
        if (messagingInstance) {
          const { getToken } = await import('firebase/messaging');
          const registration = await navigator.serviceWorker.ready;
          const token = await getToken(messagingInstance, { serviceWorkerRegistration: registration });
          if (token) {
            await supabase.from('user_fcm_tokens').delete().eq('token', token);
          }
        }
      } catch (e) {
        console.error('Error removing token on signout', e);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ id: null, name: 'Гость', visits: 0, photo: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  requestPushPermission: async (vapidKey: string) => {
    try {
      const { messaging } = await import('../lib/firebase');
      const messagingInstance = await messaging();
      
      if (!messagingInstance) {
        console.warn('Firebase messaging not initialized');
        return;
      }

      let permission = (Notification as any).permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const { getToken } = await import('firebase/messaging');
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: registration });

        
        if (token) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { error: upsertError } = await retry(() => supabase.from('user_fcm_tokens').upsert({ user_id: session.user.id, token: token }, { onConflict: 'token' }));
            if (upsertError) {
              console.error('Error saving FCM token to user_fcm_tokens:', upsertError);
            } else {
              console.log('FCM token saved successfully to user_fcm_tokens.');
              console.log('✅ Токен успешно получен и сохранен!');
            }
          }
        } else {
          console.log('No registration token available.');
        }
      } else {
        console.log('Notification permission denied.');
      }
    } catch (error: any) {
      console.error('An error occurred while retrieving token. ', error);
    }
  },

}));
