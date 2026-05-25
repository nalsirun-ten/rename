import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type BranchType = 'Кофейня' | 'Точка на вынос';
export type FilterType = 'Все' | BranchType;
export type TabType = 'Списком' | 'Карта';

export interface Branch {
  id: string;
  title: string;
  address: string;
  openTime: string;
  closeTime: string;
  type: BranchType;
  imageUrl: string;
  isOpen: boolean;
  isSaved: boolean;
}

// MOCK_BRANCHES removed, using Supabase
interface BranchesState {
  branches: Branch[];
  savedBranchIds: Record<string, boolean>;
  searchQuery: string;
  filter: FilterType;
  activeTab: TabType;
  activeBranchId: string | null;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterType) => void;
  setActiveTab: (tab: TabType) => void;
  openBranch: (id: string) => void;
  closeBranch: () => void;
  toggleSaved: (id: string) => void;
  fetchBranches: () => Promise<void>;
}

export const useBranchesStore = create<BranchesState>()(
  persist(
    (set, get) => ({
      branches: [],
      savedBranchIds: {},
      searchQuery: '',
      filter: 'Все',
      activeTab: 'Списком',
      activeBranchId: null,
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilter: (filter: FilterType) => set({ filter }),
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  openBranch: (id: string) => set({ activeBranchId: id }),
  closeBranch: () => set({ activeBranchId: null }),
  toggleSaved: (id: string) => {
    const currentSaved = !!get().savedBranchIds[id];
    const nextSavedBranchIds = { ...get().savedBranchIds };
    if (currentSaved) {
      delete nextSavedBranchIds[id];
    } else {
      nextSavedBranchIds[id] = true;
    }
    set((state) => ({
      savedBranchIds: nextSavedBranchIds,
      branches: state.branches.map((b) =>
        b.id === id ? { ...b, isSaved: !currentSaved } : b
      ),
    }));
  },
  fetchBranches: async () => {
    const { data, error } = await supabase.from('branches').select('*');
    if (data && !error) {
      set({
        branches: data.map((b) => {
          // Parse working_hours (e.g. "08:00 - 22:00" or similar)
          let openTime = '08:00';
          let closeTime = '22:00';
          if (b.working_hours && b.working_hours.includes('-')) {
            const parts = b.working_hours.split('-');
            openTime = parts[0].trim();
            closeTime = parts[1].trim();
          }

          return {
            id: b.id,
            title: b.name,
            address: b.address,
            openTime,
            closeTime,
            type: (b.type === 'takeaway' || b.type === 'Точка на вынос') ? 'Точка на вынос' : 'Кофейня',
            imageUrl: b.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&h=400',
            isOpen: b.is_active !== false,
            isSaved: !!get().savedBranchIds[b.id],
          };
        })
      });
    }
  },
    }),
    {
      name: 'cafe-branches-storage',
      partialize: (state) => ({ savedBranchIds: state.savedBranchIds }),
    }
  )
);
