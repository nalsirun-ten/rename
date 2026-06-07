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
  images?: string[];
  likes: number;
  created_at: string;
  category?: string;
}

import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';
import type { TranslationKey } from '../i18n/translations';

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

export function getRatingLabelKey(rating: number): TranslationKey {
  switch (rating) {
    case 5: return 'rating_excellent';
    case 4: return 'rating_good';
    case 3: return 'rating_ok';
    case 2: return 'rating_bad';
    case 1: return 'rating_terrible';
    default: return 'rating_ok';
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

export function getPluralFormKey(n: number): TranslationKey {
  if (n % 100 >= 11 && n % 100 <= 19) return 'reviews_many';
  const last = n % 10;
  if (last === 1) return 'reviews_one';
  if (last >= 2 && last <= 4) return 'reviews_few';
  return 'reviews_many';
}

// ─── Store ───────────────────────────────────────────────────────────

export type FilterMode = 'most_liked' | 'recent' | 'positive' | 'negative';

const REVIEWS_PAGE_SIZE = 5;

interface ReviewsState {
  reviews: Review[];
  likedReviews: Record<string, boolean>;
  stats: { totalCount: number; avgRating: number; dist: number[] } | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filter: FilterMode;
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterMode) => void;
  toggleLike: (reviewId: string, userId?: string) => Promise<void>;
  isLiked: (reviewId: string) => boolean;
  fetchReviews: (force?: boolean) => Promise<void>;
  fetchMoreReviews: () => Promise<void>;
  fetchLikedReviews: (userId: string) => Promise<void>;
  addReview: (review: { rating: number; text: string; branch_id: string; user_id?: string; guest_name?: string; guest_avatar?: string; category?: string }) => Promise<void>;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      likedReviews: {},
      stats: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      filter: 'most_liked',
      page: 1,
      hasMore: true,
      isLoadingMore: false,

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        get().fetchReviews(true);
      },

      setFilter: (filter: FilterMode) => {
        set({ filter });
        get().fetchReviews(true);
      },

      fetchReviews: async () => {
        const { searchQuery, filter, reviews } = get();
        const hasExisting = reviews.length > 0;
        set({ isLoading: !hasExisting, page: 1, error: null });
        try {
          let query = supabase
            .from('reviews')
            .select('id, rating, text, guest_name, guest_avatar, category, images, likes, created_at, user:profiles!reviews_user_id_fkey(id, full_name, avatar_url)', { count: 'exact' });

          if (searchQuery.trim()) {
            // we search by guest_name and text for simplicity
            query = query.or(`guest_name.ilike.%${searchQuery.trim()}%,text.ilike.%${searchQuery.trim()}%`);
          }

          if (filter === 'positive') {
            query = query.gte('rating', 4);
          } else if (filter === 'negative') {
            query = query.lte('rating', 3);
          }

          if (filter === 'most_liked') {
            query = query.order('likes', { ascending: false }).order('created_at', { ascending: false });
          } else {
            query = query.order('created_at', { ascending: false });
          }

          const { data, error, count } = await retry(() => query.range(0, REVIEWS_PAGE_SIZE - 1));
          if (error) throw error;

          // Fetch all ratings for global stats
          let currentStats = get().stats;
          if (!currentStats || filter === 'most_liked') {
            const { data: allRatingsData } = await retry(() => supabase.from('reviews').select('rating'));
            if (allRatingsData) {
              const allRatings = allRatingsData as { rating: number }[];
              const totalCount = allRatings.length;
              const avgRating = totalCount > 0 ? allRatings.reduce((s, r) => s + r.rating, 0) / totalCount : 0;
              const dist = [5, 4, 3, 2, 1].map(star => allRatings.filter(r => r.rating === star).length);
              currentStats = { totalCount, avgRating, dist };
            }
          }
          
          const formatted = (data || []).map((r: any) => ({
            id: r.id,
            rating: r.rating,
            text: r.text,
            guest_name: r.guest_name,
            guest_avatar: r.guest_avatar,
            user: r.user,
            images: r.images,
            likes: r.likes || 0,
            created_at: r.created_at,
            category: r.category,
          }));
          if (
            JSON.stringify(get().reviews) !== JSON.stringify(formatted) ||
            JSON.stringify(get().stats) !== JSON.stringify(currentStats) ||
            get().hasMore !== ((count ?? 0) > REVIEWS_PAGE_SIZE)
          ) {
            set({ 
              reviews: formatted, 
              stats: currentStats,
              hasMore: (count ?? 0) > REVIEWS_PAGE_SIZE 
            });
          }
        } catch (err: any) {
          console.error('Error fetching reviews:', err);
          set({ error: err?.message || 'Failed to load reviews' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoreReviews: async () => {
        const { page, reviews, hasMore, isLoadingMore, searchQuery, filter } = get();
        if (!hasMore || isLoadingMore) return;
        set({ isLoadingMore: true });
        
        const nextPage = page + 1;
        const from = page * REVIEWS_PAGE_SIZE;
        const to = from + REVIEWS_PAGE_SIZE - 1;

        try {
          let query = supabase
            .from('reviews')
            .select('id, rating, text, guest_name, guest_avatar, category, images, likes, created_at, user:profiles!reviews_user_id_fkey(id, full_name, avatar_url)', { count: 'exact' });

          if (searchQuery.trim()) {
            query = query.or(`guest_name.ilike.%${searchQuery.trim()}%,text.ilike.%${searchQuery.trim()}%`);
          }

          if (filter === 'positive') {
            query = query.gte('rating', 4);
          } else if (filter === 'negative') {
            query = query.lte('rating', 3);
          }

          if (filter === 'most_liked') {
            query = query.order('likes', { ascending: false }).order('created_at', { ascending: false });
          } else {
            query = query.order('created_at', { ascending: false });
          }

          const { data, error, count } = await retry(() => query.range(from, to));

          if (error) throw error;

          const formatted = (data || []).map((r: any) => ({
            id: r.id,
            rating: r.rating,
            text: r.text,
            guest_name: r.guest_name,
            guest_avatar: r.guest_avatar,
            user: r.user,
            images: r.images,
            likes: r.likes || 0,
            created_at: r.created_at,
            category: r.category,
          }));
          set({
            reviews: [...reviews, ...formatted],
            page: nextPage,
            hasMore: (count ?? 0) > to + 1
          });
        } catch (err: any) {
          console.error('Error fetching more reviews:', err);
        } finally {
          set({ isLoadingMore: false });
        }
      },

  fetchLikedReviews: async (userId: string) => {
    try {
      const { data, error } = await retry(() => supabase
        .from('review_likes')
        .select('review_id')
        .eq('user_id', userId));
        
      if (error) throw error;
      
      const likedMap: Record<string, boolean> = {};
      data?.forEach((row: any) => { likedMap[row.review_id] = true; });
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
        // Keep optimistic state — will sync on next fetch
      }
    }
  },

  addReview: async (reviewPayload) => {
    try {
      const { data, error } = await retry(() => supabase.from('reviews').insert([
        {
          rating: reviewPayload.rating,
          text: reviewPayload.text,
          branch_id: reviewPayload.branch_id,
          user_id: reviewPayload.user_id || null,
          guest_name: reviewPayload.guest_name || null,
          guest_avatar: reviewPayload.guest_avatar || null,
          category: reviewPayload.category || null,
          likes: 0
        }
      ]).select('id, rating, text, guest_name, guest_avatar, category, images, likes, created_at, user:profiles!reviews_user_id_fkey(id, full_name, avatar_url)').single());
      
      if (error) throw error;
      
      // If we are currently sorting by recent, we can unshift it to the top.
      const state = get();
      if (data) {
        const newReview = {
          id: data.id,
          rating: data.rating,
          text: data.text,
          guest_name: data.guest_name,
          guest_avatar: data.guest_avatar,
          user: data.user,
          images: data.images,
          likes: data.likes || 0,
          created_at: data.created_at,
          category: data.category,
        };
        set({ reviews: [newReview, ...state.reviews] });
      }
    } catch (err) {
      console.error('Failed to add review:', err);
      throw err;
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
