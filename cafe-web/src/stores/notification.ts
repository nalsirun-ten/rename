import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_active: boolean;
  user_id: string | null;
  image_url?: string;
}

const PAGE_SIZE_NOTIFICATIONS = 10;

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  readNotificationIds: Record<string, boolean>; // Persisted on device
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  setUnreadCount: (count: number) => void;
  fetchNotifications: (userId: string) => Promise<void>;
  fetchMoreNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      unreadCount: 0,
      notifications: [],
      readNotificationIds: {},
      isLoading: false,
      page: 1,
      hasMore: true,
      isLoadingMore: false,
      
      setUnreadCount: (count: number) => set({ unreadCount: count }),

      markAsRead: (notificationId: string) => {
        const nextRead = { ...get().readNotificationIds, [notificationId]: true };
        const updated = get().notifications.map(n => 
          n.id === notificationId ? { ...n, is_active: false } : n
        );
        set({
          readNotificationIds: nextRead,
          notifications: updated,
          unreadCount: Math.max(0, get().unreadCount - 1)
        });
      },

      markAllAsRead: () => {
        const notifications = get().notifications;
        const nextRead = { ...get().readNotificationIds };
        
        notifications.forEach(n => {
          if (n.is_active) {
            nextRead[n.id] = true;
          }
        });

        const updated = notifications.map(n => ({ ...n, is_active: false }));

        set({
          readNotificationIds: nextRead,
          notifications: updated,
          unreadCount: 0
        });
      },

      fetchNotifications: async (userId: string) => {
        // 1. Check if running in standalone mode (PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
        
        if (!isStandalone) {
          // If in browser, do not show any notifications
          set({ notifications: [], unreadCount: 0, isLoading: false, hasMore: false });
          return;
        }

        // 2. Track when the PWA was installed/first launched
        let pwaInstalledAt = localStorage.getItem('pwaInstalledAt');
        if (!pwaInstalledAt) {
          pwaInstalledAt = new Date().toISOString();
          localStorage.setItem('pwaInstalledAt', pwaInstalledAt);
        }

        set({ isLoading: true, page: 1 });
        try {
          // 1. Fetch user's registration date
          const { data: profile } = await retry(() => supabase
            .from('profiles')
            .select('created_at')
            .eq('id', userId)
            .single());

          const userCreatedAt = profile?.created_at || new Date(0).toISOString();

          // Since read state is local, we must know which exact DB notifications are unread locally.
          const { data: allIdsData } = await retry(() => supabase
            .from('notifications')
            .select('id')
            .eq('is_active', true)
            .gte('created_at', pwaInstalledAt)
            .or(`user_id.eq.${userId},user_id.is.null`));

          // Fetch notifications first page
          const { data, error, count } = await retry(() => supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('is_active', true)
            .gte('created_at', pwaInstalledAt)
            .or(`user_id.eq.${userId},user_id.is.null`)
            .order('created_at', { ascending: false })
            .range(0, PAGE_SIZE_NOTIFICATIONS - 1));

          if (error) throw error;

          let notificationsData = data?.map((n: any) => ({ ...n, message: n.body })) as Notification[] || [];

          const readIds = get().readNotificationIds;
          
          // Mark locally read notifications as inactive in the state
          const processedData = notificationsData.map(n => 
            readIds[n.id] ? { ...n, is_active: false } : n
          );
          
          // Calculate actual unread considering locally read items
          let unreadCountReal = 0;
          if (allIdsData) {
            // Accurately count how many of the valid DB notifications are NOT in readIds
            unreadCountReal = allIdsData.filter((n: any) => !readIds[n.id]).length;
          }

          set({ 
            notifications: processedData,
            unreadCount: unreadCountReal,
            hasMore: (count ?? 0) > PAGE_SIZE_NOTIFICATIONS
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoreNotifications: async (userId: string) => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
        if (!isStandalone) return;

        const { page, notifications, hasMore, isLoadingMore } = get();
        if (!hasMore || isLoadingMore) return;
        set({ isLoadingMore: true });

        let pwaInstalledAt = localStorage.getItem('pwaInstalledAt') || new Date().toISOString();
        
        try {
          const { data: profile } = await retry(() => supabase
            .from('profiles')
            .select('created_at')
            .eq('id', userId)
            .single());

          const userCreatedAt = profile?.created_at || new Date(0).toISOString();

          const nextPage = page + 1;
          const from = page * PAGE_SIZE_NOTIFICATIONS;
          const to = from + PAGE_SIZE_NOTIFICATIONS - 1;

          const { data, error, count } = await retry(() => supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('is_active', true)
            .gte('created_at', pwaInstalledAt)
            .or(`user_id.eq.${userId},user_id.is.null`)
            .order('created_at', { ascending: false })
            .range(from, to));

          if (error) throw error;

          const notificationsData = data.map((n: any) => ({ ...n, message: n.body })) as Notification[];
          const readIds = get().readNotificationIds;
          const processedData = notificationsData.map(n => 
            readIds[n.id] ? { ...n, is_active: false } : n
          );
          
          const newNotifications = [...notifications, ...processedData];
          
          // Do not recalculate unread count on pagination, as it was already accurately calculated 
          // on initial fetch and is maintained by markAsRead/markAllAsRead.
          const currentUnreadCount = get().unreadCount;

          set({
            notifications: newNotifications,
            unreadCount: currentUnreadCount,
            page: nextPage,
            hasMore: (count ?? 0) > to + 1,
          });
        } catch (error) {
          console.error('Error fetching more notifications:', error);
        } finally {
          set({ isLoadingMore: false });
        }
      },
    }),
    {
      name: 'cafe-notifications-storage',
      partialize: (state) => ({ readNotificationIds: state.readNotificationIds }),
    }
  )
);
