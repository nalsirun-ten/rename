import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';

export interface ProductVariant {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  variants?: ProductVariant[];
}

// ─── Architecture: the whole menu is ~170 rows (~10 KB gzipped), so we load
// it ONCE with a single query and navigate entirely client-side. Opening a
// category, going back, searching — all instant, zero network requests.
// Stale-while-revalidate: cached data shows immediately; after the TTL a
// background refresh swaps in fresh data without any loading state.

interface MenuState {
  /** The complete menu — single source of truth for all views */
  items: MenuItem[];
  /** Derived from items — number of dishes per category */
  categoryCounts: Record<string, number>;
  categoryFilter: string;
  searchQuery: string;
  /** True only during the very first load (no cached data yet) */
  isLoading: boolean;
  lastFetchedAt: number;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  fetchMenuItems: (force?: boolean) => Promise<void>;
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
  'Курица',
  'Паста',
  'Лапша',
  'Пицца',
  'Бургеры',
  'Сэндвичи',
  'Суши',
  'Японские роллы',
  'Кимбап',
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

/** Categories that always appear in the delivery page (with DUK images) */
export const DUK_CATEGORIES = [
  'Японские роллы',
  'Курица',
  'Кимбап',
  'Горячие блюда',
  'Лапша',
  'Гарниры',
  'Супы',
  'Пицца',
  'Напитки',
  'Кофе',
  'Чай',
  'Лимонады',
  'Молочные коктейли',
  'Смузи',
  'Десерты',
  'Соусы',
];

function normalizeCategory(dbCategory: string | null | undefined): string {
  if (!dbCategory) return '';
  let trimmed = dbCategory.trim();
  if (trimmed.toLowerCase() === 'роллы') {
    trimmed = 'Японские роллы';
  }
  const match = POPULAR_CATEGORIES.find(cat => cat.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Deduplicates concurrent fetches (App startup + MenuPage mount + PTR)
let inflightFetch: Promise<void> | null = null;

export const useMenuStore = create<MenuState>()((set, get) => ({
  items: [],
  categoryCounts: {},
  categoryFilter: '',
  searchQuery: '',
  isLoading: false,
  lastFetchedAt: 0,

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // Pure client-side navigation — never clears data, never hits the network.
  // If the cache went stale while browsing, fetchMenuItems revalidates in the
  // background (TTL-guarded, so it's a no-op most of the time).
  setCategoryFilter: (category: string) => {
    if (get().categoryFilter === category) return;
    set({ categoryFilter: category });
    get().fetchMenuItems();
  },

  fetchMenuItems: async (force = false) => {
    const state = get();
    const cacheFresh = Date.now() - state.lastFetchedAt < CACHE_TTL_MS;
    if (!force && state.items.length > 0 && cacheFresh) return;
    if (inflightFetch) return inflightFetch;

    // Loading state only for the very first load — revalidation is invisible
    if (state.items.length === 0) set({ isLoading: true });

    inflightFetch = (async () => {
      try {
        const { data, error } = await retry(() => supabase
          .from('menu_items')
          .select('id, name, description, price, image_url, category, variants')
          .order('created_at', { ascending: false }));

        if (data && !error) {
          const items: MenuItem[] = data.map((item: any) => ({
            id: item.id,
            title: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.image_url,
            category: normalizeCategory(item.category),
            variants: Array.isArray(item.variants) && item.variants.length > 0 ? item.variants : undefined,
          }));

          const categoryCounts: Record<string, number> = {};
          for (const it of items) {
            if (it.category) categoryCounts[it.category] = (categoryCounts[it.category] || 0) + 1;
          }

          // Skip the state update (and the re-render) when nothing changed
          if (JSON.stringify(get().items) !== JSON.stringify(items)) {
            set({ items, categoryCounts, lastFetchedAt: Date.now() });
          } else {
            set({ lastFetchedAt: Date.now() });
          }
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        set({ isLoading: false });
        inflightFetch = null;
      }
    })();

    return inflightFetch;
  },
}));
