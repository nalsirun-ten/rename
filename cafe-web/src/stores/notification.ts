import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

// Mock — will be wired to Supabase when we build the notifications feature
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 3, // mock
  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
