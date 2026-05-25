import { create } from 'zustand';

import { supabase } from '../lib/supabase';

interface NotificationState {
  unreadCount: number;
  isLoading: boolean;
  setUnreadCount: (count: number) => void;
  fetchNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isLoading: false,
  setUnreadCount: (count: number) => set({ unreadCount: count }),
  
  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      // Just fetching the count of unread/active notifications for the user
      // For now we count all notifications where is_active = true and either user_id is null (global) or matches user
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .or(`user_id.eq.${userId},user_id.is.null`);

      if (error) throw error;
      set({ unreadCount: count || 0 });
    } catch (error) {
      console.error('Error fetching notifications count:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
