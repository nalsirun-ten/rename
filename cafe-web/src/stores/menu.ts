import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import coffee3dImage from '@assets/images/coffee_cup_3d.png';
import restoranImage from '@assets/images/restoran-komanda.jpg';

export type MenuTab = 'Меню' | 'Бизнес ланч';

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite: boolean;
  category: string;
}

// MOCK_MENU is removed, we fetch from Supabase

interface MenuState {
  items: MenuItem[];
  searchQuery: string;
  activeTab: MenuTab;
  sortBy: string;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: MenuTab) => void;
  setSortBy: (sortBy: string) => void;
  toggleFavorite: (id: string) => Promise<void>;
  fetchFavorites: (userId: string) => Promise<void>;
  fetchMenuItems: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  searchQuery: '',
  activeTab: 'Меню',
  sortBy: 'Без сортировки',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setActiveTab: (tab: MenuTab) => set({ activeTab: tab }),
  setSortBy: (sortBy: string) => set({ sortBy }),

  fetchMenuItems: async () => {
    const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      set({
        items: data.map(item => ({
          id: item.id,
          title: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url,
          category: item.category,
          isFavorite: false, // will be updated by fetchFavorites later
        }))
      });
      // Try fetching favorites if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        get().fetchFavorites(session.user.id);
      }
    }
  },
  
  fetchFavorites: async (userId: string) => {
    const { data } = await supabase
      .from('user_favorites')
      .select('item_id')
      .eq('user_id', userId);
      
    if (data) {
      const favoriteIds = new Set(data.map((fav: any) => fav.item_id));
      set((state) => ({
        items: state.items.map((item) => ({
          ...item,
          isFavorite: favoriteIds.has(item.id)
        }))
      }));
    }
  },

  toggleFavorite: async (id: string) => {
    // Optimistic UI update
    const item = get().items.find(i => i.id === id);
    const newIsFavorite = !item?.isFavorite;
    
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isFavorite: newIsFavorite } : i
      ),
    }));

    // Update remote DB
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
}));
