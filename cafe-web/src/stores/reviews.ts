import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number; // 1-5
  text: string;
  guest_name?: string;
  guest_avatar?: string;
  user?: {
    full_name: string;
    avatar_url?: string;
    id?: string;
  };
  doctor?: {
    full_name: string;
  };
  images?: string[];
  likes: number;
  created_at: string;
}

import { supabase } from '../lib/supabase';

// ─── Helpers ─────────────────────────────────────────────────────────

export function getRatingLabel(rating: number): string {
  switch (rating) {
    case 5: return 'Отлично';
    case 4: return 'Хорошо';
    case 3: return 'Нормально';
    case 2: return 'Плохо';
    case 1: return 'Ужасно';
    default: return '';
  }
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return '#10B981';
  if (rating === 3) return '#F59E0B';
  return '#EF4444';
}

export function getAvatarGradient(name: string): [string, string] {
  const gradients: [string, string][] = [
    ['#6366F1', '#818CF8'],
    ['#10B981', '#34D399'],
    ['#F59E0B', '#FBBF24'],
    ['#EF4444', '#F87171'],
    ['#8B5CF6', '#A78BFA'],
    ['#0EA5E9', '#38BDF8'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function getInitials(name: string): string {
  return name.length > 0 ? name[0].toUpperCase() : '?';
}

export function getPluralForm(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 19) return 'отзывов';
  const last = n % 10;
  if (last === 1) return 'отзыв';
  if (last >= 2 && last <= 4) return 'отзыва';
  return 'отзывов';
}

// ─── Store ───────────────────────────────────────────────────────────

interface ReviewsState {
  reviews: Review[];
  likedReviews: Record<string, boolean>;
  isLoading: boolean;
  toggleLike: (reviewId: string, userId?: string) => Promise<void>;
  isLiked: (reviewId: string) => boolean;
  fetchReviews: () => Promise<void>;
  fetchLikedReviews: (userId: string) => Promise<void>;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      likedReviews: {},
      isLoading: false,

  fetchReviews: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user:profiles!reviews_user_id_fkey(id, full_name, avatar_url), doctor:baristas!reviews_barista_id_fkey(full_name)')
        .order('likes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        guest_name: r.guest_name,
        guest_avatar: r.guest_avatar,
        user: r.user,
        doctor: r.doctor,
        images: r.images,
        likes: r.likes || 0,
        created_at: r.created_at,
      }));
      set({ reviews: formatted });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLikedReviews: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('review_likes')
        .select('review_id')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      const likedMap: Record<string, boolean> = {};
      data?.forEach(row => { likedMap[row.review_id] = true; });
      set({ likedReviews: likedMap });
    } catch (error) {
      console.error('Error fetching liked reviews:', error);
    }
  },

  toggleLike: async (reviewId: string, userId?: string) => {
    const state = get();
    const isLiked = !!state.likedReviews[reviewId];
    
    // Optimistic UI update
    const nextMap = { ...state.likedReviews };
    if (isLiked) {
      delete nextMap[reviewId];
    } else {
      nextMap[reviewId] = true;
    }
    
    set({
      likedReviews: nextMap,
      reviews: state.reviews.map(r => 
        r.id === reviewId 
          ? { ...r, likes: r.likes + (isLiked ? -1 : 1) } 
          : r
      )
    });
    
    // Persist to Supabase if logged in
    if (userId) {
      try {
        if (isLiked) {
          await supabase.from('review_likes').delete().match({ review_id: reviewId, user_id: userId });
        } else {
          await supabase.from('review_likes').insert({ review_id: reviewId, user_id: userId });
        }
      } catch (err) {
        console.error('Failed to toggle like in DB:', err);
        // Rollback optimistic update on error
        set({
          likedReviews: state.likedReviews,
          reviews: state.reviews
        });
      }
    }
  },

  isLiked: (reviewId: string) => !!get().likedReviews[reviewId],
    }),
    {
      name: 'cafe-reviews-storage',
      partialize: (state) => ({ likedReviews: state.likedReviews }),
    }
  )
);
