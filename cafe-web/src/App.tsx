import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainShell from './components/MainShell';
import LoginPage from './pages/LoginPage';
import OfflineBanner from './components/OfflineBanner';
import { useProfileStore } from './stores/profile';
import { useMenuStore } from './stores/menu';
import { useNewsStore } from './stores/news';
import { useBranchesStore } from './stores/branches';
import { useStoriesStore } from './stores/stories';
import { useReviewsStore } from './stores/reviews';
import { useNotificationStore } from './stores/notification';
import { useNavigationStore } from './stores/navigation';
import { useToastStore } from './stores/toast';
import Toast from './components/Toast';
import { useT } from './i18n/useT';
import { useLanguageStore } from './stores/language';
import { loadLanguage } from './i18n/translations';
import { VAPID_KEY } from './lib/firebase';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const AUTH_DATA_LOADED = new Set<string>();

export function clearAuthData() {
  AUTH_DATA_LOADED.clear();
  useNotificationStore.setState({ notifications: [], unreadCount: 0, page: 1, hasMore: true });
  useReviewsStore.setState({ reviews: [], likedReviews: {} });
  useMenuStore.setState({ favoriteIds: {} });
  useProfileStore.setState({ id: null, name: 'Загрузка...', phone: '', visits: 0, stamps: 0, photo: null, loyaltyNumber: '000000', activePrize: null, lastRouletteSpin: null });
}

function loadPrivateData(userId: string) {
  if (AUTH_DATA_LOADED.has(userId)) return;
  AUTH_DATA_LOADED.add(userId);
  useProfileStore.getState().fetchProfile(userId);
  useMenuStore.getState().fetchFavorites(userId);
  useReviewsStore.getState().fetchLikedReviews(userId);
  useNotificationStore.getState().fetchNotifications(userId);
  // If the user already granted permissions previously, sync the token immediately 
  // so it is saved to their new session profile.
  if ('Notification' in window && (Notification as any).permission === 'granted') {
    useProfileStore.getState().requestPushPermission(VAPID_KEY);
  }
}

export default function App() {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage(language);
  }, [language]);

  useEffect(() => {
    // Fire public data immediately — don't wait for auth
    useMenuStore.getState().fetchMenuItems();
    useNewsStore.getState().fetchNews();
    useBranchesStore.getState().fetchBranches();
    useStoriesStore.getState().fetchStories();
    useReviewsStore.getState().fetchReviews();

    // Explicitly retrieve the session from localStorage.
    // onAuthStateChange alone can miss the initial session in PWA / multi-tab scenarios.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
      if (initialSession?.user) {
        // Always open home page after auth is restored
        useNavigationStore.getState().setActiveTab(0);
        loadPrivateData(initialSession.user.id);
      }
    });

    // Listen for subsequent auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        useNavigationStore.getState().setActiveTab(0);
        loadPrivateData(session.user.id);
      }
    });

    // Auto-sync token if user returns from OS settings after manually enabling permissions
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-fetch profile data when user returns to the app
        const profileId = useProfileStore.getState().id;
        if (profileId) {
          useProfileStore.getState().fetchProfile(profileId);
        }
        if ('Notification' in window && (Notification as any).permission === 'granted') {
          useProfileStore.getState().requestPushPermission(VAPID_KEY);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Firebase Foreground Messaging — delay until browser is idle
    let unsubscribeMessaging: (() => void) | undefined;
    const scheduleFirebase = (cb: () => void) => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(cb, { timeout: 5000 });
      } else {
        setTimeout(cb, 3000);
      }
    };
    scheduleFirebase(() => {
    import('./lib/firebase').then(({ messaging }) => {
      messaging().then(messagingInstance => {
        if (messagingInstance) {
          import('firebase/messaging').then(({ onMessage }) => {
            unsubscribeMessaging = onMessage(messagingInstance, (payload) => {
              console.log('Message received in foreground: ', payload);
              // Provide visual feedback for foreground messages since background SW won't handle them automatically
              if (payload.notification) {
                const notif = payload.notification;
                // If browser notifications are permitted, show one
                if (Notification.permission === 'granted') {
                  navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(notif.title || 'New message', {
                      body: notif.body,
                      icon: notif.image || '/icons/icon-192x192.png'
                    });
                  }).catch(() => {
                    useToastStore.getState().showToast(
                      `${notif.title}: ${notif.body}`,
                      'notification',
                      5000
                    );
                  });
                } else {
                  // Fallback toast for foreground notification
                  useToastStore.getState().showToast(
                    `${notif.title}: ${notif.body}`,
                    'notification',
                    5000
                  );
                }
              }
            });
          });
        }
      });
    }).catch(err => console.error("Firebase messaging not loaded", err));
    }); // end scheduleFirebase

    return () => {
      subscription.unsubscribe();
      if (unsubscribeMessaging) unsubscribeMessaging();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1B5E3D', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 24, fontWeight: 700 }}>{t('loading')}</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  const appBody = (
    <>
      <OfflineBanner />
      <MainShell />
      <Toast />
    </>
  );

  // Google Maps: load ONCE for the entire session — all map components share one instance.
  if (GOOGLE_MAPS_API_KEY) {
    return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        {appBody}
      </APIProvider>
    );
  }

  return appBody;
}
