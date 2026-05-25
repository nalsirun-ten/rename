import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import MainShell from './components/MainShell';
import LoginPage from './pages/LoginPage';
import { useProfileStore } from './stores/profile';
import { useMenuStore } from './stores/menu';
import { useNewsStore } from './stores/news';
import { useBranchesStore } from './stores/branches';
import { useStoriesStore } from './stores/stories';
import { useReviewsStore } from './stores/reviews';
import { useNotificationStore } from './stores/notification';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch global data regardless of auth
    useMenuStore.getState().fetchMenuItems();
    useNewsStore.getState().fetchNews();
    useBranchesStore.getState().fetchBranches();
    useStoriesStore.getState().fetchStories();
    useReviewsStore.getState().fetchReviews();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        useProfileStore.getState().fetchProfile(session.user.id);
        useMenuStore.getState().fetchFavorites(session.user.id);
        useReviewsStore.getState().fetchLikedReviews(session.user.id);
        useNotificationStore.getState().fetchNotifications(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        useProfileStore.getState().fetchProfile(session.user.id);
        useMenuStore.getState().fetchFavorites(session.user.id);
        useReviewsStore.getState().fetchLikedReviews(session.user.id);
        useNotificationStore.getState().fetchNotifications(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1B5E3D', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 24, fontWeight: 700 }}>Загрузка...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return <MainShell />;
}
