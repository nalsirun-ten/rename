import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';

export type MenuTab = 'Меню' | 'Бизнес ланч';

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite: boolean;
  category: string;
  kcal?: number;
}

const PAGE_SIZE_MENU = 8;

interface MenuState {
  items: MenuItem[];
  categories: string[];
  favoriteIds: Record<string, boolean>;
  searchQuery: string;
  activeTab: MenuTab;
  sortBy: string;
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: MenuTab) => void;
  setSortBy: (sortBy: string) => void;
  toggleFavorite: (id: string) => Promise<void>;
  fetchFavorites: (userId: string) => Promise<void>;
  fetchMenuItems: (force?: boolean) => Promise<void>;
  fetchMoreMenuItems: () => Promise<void>;
  isLoading: boolean;
  lastFetchedAt: number;
}

const POPULAR_CATEGORIES = [
  'Кофе',
  'Чай',
  'Лимонады',
  'Напитки',
  'Авторские напитки',
  'Выпечка',
  'Десерты',
  'Завтраки',
  'Салаты',
  'Супы',
  'Горячие блюда',
  'Паста',
  'Пицца',
  'Бургеры',
  'Сэндвичи',
  'Суши',
  'Роллы',
  'Закуски',
  'Гарниры',
  'Соусы',
  'Фреши',
  'Смузи',
  'Молочные коктейли',
  'Детское меню',
  'Бизнес-ланчи',
  'Вегетарианское меню',
  'Мороженое',
  'Блины и панкейки',
  'Стейки',
  'Гриль и мангал',
  'Боулы и Поке',
  'Морепродукты',
  'WOK',
  'Шаурма и Донеры',
  'Хот-доги',
  'Пироги',
  'Сеты',
  'Сезонное меню',
  'Алкогольные коктейли',
  'Соки и Воды'
];

function normalizeCategory(dbCategory: string | null | undefined): string {
  if (!dbCategory) return '';
  const trimmed = dbCategory.trim();
  const match = POPULAR_CATEGORIES.find(cat => cat.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

function getActiveCategories(items: MenuItem[]): string[] {
  return POPULAR_CATEGORIES.filter(popularCat =>
    items.some(item => item.category === popularCat)
  );
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
  items: [],
  categories: [],
  favoriteIds: {},
  isLoading: false,
  lastFetchedAt: 0,
  page: 1,
  hasMore: true,
  isLoadingMore: false,
  searchQuery: '',
  activeTab: 'Меню',
  sortBy: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setActiveTab: (tab: MenuTab) => set({ activeTab: tab }),
  setSortBy: (sortBy: string) => set({ sortBy }),

  fetchMenuItems: async (force = false) => {
    const state = get();
    // Reset page to show first page of items (IndexedDB may hold more from previous session).
    // Do NOT reset hasMore — preserve the last known value to avoid StrictMode re-triggers.
    set({ page: 1 });

    if (!force && state.items.length > 0 && state.categories.length > 0 && Date.now() - state.lastFetchedAt < CACHE_TTL_MS) {
      if (state.isLoading) set({ isLoading: false });
      return;
    }
    const hasExisting = get().items.length > 0;
    set({ isLoading: !hasExisting, hasMore: true });
    
    try {
      const itemsRes = await retry(() => supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, category, calories', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE_MENU - 1));

      const { data, error, count } = itemsRes;

      if (data && !error) {
        const formattedItems = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url,
          category: normalizeCategory(item.category),
          isFavorite: !!get().favoriteIds[item.id],
          kcal: item.calories || null,
        }));

        const activeCategories = getActiveCategories(formattedItems);
        const hasMoreFlag = (count ?? 0) > PAGE_SIZE_MENU;

        if (
          JSON.stringify(get().items) !== JSON.stringify(formattedItems) ||
          JSON.stringify(get().categories) !== JSON.stringify(activeCategories) ||
          get().hasMore !== hasMoreFlag
        ) {
          set({
            items: formattedItems,
            categories: activeCategories,
            hasMore: hasMoreFlag,
            lastFetchedAt: Date.now(),
          });
        } else {
          set({ lastFetchedAt: Date.now() });
        }
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMoreMenuItems: async () => {
    const { page, items, hasMore, isLoadingMore } = get();
    if (!hasMore || isLoadingMore) return;
    set({ isLoadingMore: true });
    const nextPage = page + 1;
    const from = page * PAGE_SIZE_MENU;
    const to = from + PAGE_SIZE_MENU - 1;
    try {
      const { data, error, count } = await retry(() => supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, category, calories', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to));
      if (data && !error) {
        const newItems = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url,
          category: normalizeCategory(item.category),
          isFavorite: !!get().favoriteIds[item.id],
          kcal: item.calories || null,
        }));
        const combinedItems = [...items, ...newItems];
        const activeCategories = getActiveCategories(combinedItems);
        
        set({
          items: combinedItems,
          categories: activeCategories,
          page: nextPage,
          hasMore: (count ?? 0) > to + 1,
        });
      }
    } catch (err) {
      console.error('Error fetching more menu items:', err);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  fetchFavorites: async (userId: string) => {
    const { data } = await supabase
      .from('user_favorites')
      .select('item_id')
      .eq('user_id', userId);
      
    if (data) {
      const newFavoriteIds: Record<string, boolean> = {};
      data.forEach((fav: any) => {
        newFavoriteIds[fav.item_id] = true;
      });
      set((state) => ({
        favoriteIds: newFavoriteIds,
        items: state.items.map((item) => ({
          ...item,
          isFavorite: !!newFavoriteIds[item.id]
        }))
      }));
    }
  },

  toggleFavorite: async (id: string) => {
    const item = get().items.find(i => i.id === id);
    const newIsFavorite = !item?.isFavorite;
    
    set((state) => ({
      favoriteIds: {
        ...state.favoriteIds,
        [id]: newIsFavorite
      },
      items: state.items.map((i) =>
        i.id === id ? { ...i, isFavorite: newIsFavorite } : i
      ),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      if (newIsFavorite) {
        await supabase.from('user_favorites').insert({
          user_id: session.user.id,
          item_id: id,
        });
      } else {
        await supabase.from('user_favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('item_id', id);
      }
    }
  },
}),
    {
      name: 'cafe-menu-storage',
      partialize: (state) => ({ items: state.items, categories: state.categories, favoriteIds: state.favoriteIds, lastFetchedAt: state.lastFetchedAt }),
    }
  )
);
