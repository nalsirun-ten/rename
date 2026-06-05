import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';

export type BranchType = 'Кофейня' | 'Точка на вынос';
export type FilterType = 'Все' | BranchType;
export type TabType = 'Списком' | 'Карта';

export interface WeeklySchedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  [key: string]: string | undefined;
}

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
  latitude: number | null;
  longitude: number | null;
  weeklySchedule?: WeeklySchedule;
}

// MOCK_BRANCHES removed, using Supabase

const PAGE_SIZE_BRANCHES = 7;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function parseWorkingHours(working_hours?: string): [string, string] {
  let openTime = '08:00';
  let closeTime = '22:00';
  if (working_hours && working_hours.includes('-')) {
    const parts = working_hours.split('-');
    openTime = parts[0].trim();
    closeTime = parts[1].trim();
  }
  return [openTime, closeTime];
}

export function isBranchOpenNow(branch: Branch): boolean {
  if (branch.isOpen === false) return false;

  const bishkekTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Bishkek" });
  const bishkekDate = new Date(bishkekTimeString);
  
  const dayIndex = bishkekDate.getDay() === 0 ? 6 : bishkekDate.getDay() - 1;
  const time = `${String(bishkekDate.getHours()).padStart(2, '0')}:${String(bishkekDate.getMinutes()).padStart(2, '0')}`;
  
  const WEEKDAY_ENGLISH_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const todayKey = WEEKDAY_ENGLISH_KEYS[dayIndex];
  const scheduleStr = branch.weeklySchedule?.[todayKey] || `${branch.openTime} - ${branch.closeTime}`;

  if (scheduleStr.toLowerCase().includes('закрыто') || scheduleStr.toLowerCase().includes('closed')) {
    return false;
  }

  const parts = scheduleStr.split('-');
  if (parts.length === 2) {
    const openTime = parts[0].trim();
    const closeTime = parts[1].trim();
    
    // Handle cross-midnight e.g., 08:00 - 03:00
    if (closeTime < openTime) {
      return time >= openTime || time <= closeTime;
    }
    return time >= openTime && time <= closeTime;
  }
  
  return true;
}

interface BranchesState {
  branches: Branch[];
  savedBranchIds: Record<string, boolean>;
  searchQuery: string;
  filter: FilterType;
  activeTab: TabType;
  activeBranchId: string | null;
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterType) => void;
  setActiveTab: (tab: TabType) => void;
  openBranch: (id: string) => void;
  closeBranch: () => void;
  toggleSaved: (id: string) => void;
  fetchBranches: (force?: boolean) => Promise<void>;
  fetchMoreBranches: () => Promise<void>;
  isLoading: boolean;
  lastFetchedAt: number;
  error: string | null;
}

export const useBranchesStore = create<BranchesState>()(
  persist(
    (set, get) => ({
      branches: [],
      isLoading: false,
      lastFetchedAt: 0,
      error: null,
      savedBranchIds: {},
      searchQuery: '',
      filter: 'Все',
      activeTab: 'Списком',
      activeBranchId: null,
      page: 1,
      hasMore: true,
      isLoadingMore: false,
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

  fetchBranches: async (force = false) => {
    // Reset page to show only page 1 items (IndexedDB may hold more from previous session).
    // Do NOT reset hasMore — preserve the last known value to avoid StrictMode re-triggers.
    set({ page: 1 });
    // Skip if loaded AND recently fetched (unless forced)
    if (!force && get().branches.length > 0 && Date.now() - get().lastFetchedAt < CACHE_TTL_MS) return;
    const hasExisting = get().branches.length > 0;
    set({ isLoading: !hasExisting, hasMore: true });
    const { data, error, count } = await retry(() => supabase
      .from('branches')
      .select('*', { count: 'exact' })
      .range(0, PAGE_SIZE_BRANCHES - 1));
    if (data && !error) {
      set({
        branches: data.map((b: any) => {
          const [openTime, closeTime] = parseWorkingHours(b.working_hours);
          return {
            id: b.id,
            title: b.name,
            address: b.address,
            openTime,
            closeTime,
            type: ((b.type === 'takeaway' || b.type === 'Точка на вынос') ? 'Точка на вынос' : 'Кофейня') as BranchType,
            imageUrl: b.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&h=400',
            isOpen: b.is_active !== false,
            isSaved: !!get().savedBranchIds[b.id],
            latitude: b.latitude ?? null,
            longitude: b.longitude ?? null,
            weeklySchedule: b.weekly_schedule || undefined,
          };
        }),
        hasMore: (count ?? 0) > PAGE_SIZE_BRANCHES,
        lastFetchedAt: Date.now(),
      });
    }
    set({ isLoading: false, error: null });
  },

  fetchMoreBranches: async () => {
    const { page, branches, hasMore, isLoadingMore } = get();
    if (!hasMore || isLoadingMore) return;
    set({ isLoadingMore: true });
    const nextPage = page + 1;
    const from = page * PAGE_SIZE_BRANCHES;
    const to = from + PAGE_SIZE_BRANCHES - 1;
    const { data, error, count } = await retry(() => supabase
      .from('branches')
      .select('*', { count: 'exact' })
      .range(from, to));
    if (data && !error) {
      const newBranches = data.map((b: any) => {
        const [openTime, closeTime] = parseWorkingHours(b.working_hours);
        return {
          id: b.id,
          title: b.name,
          address: b.address,
          openTime,
          closeTime,
          type: ((b.type === 'takeaway' || b.type === 'Точка на вынос') ? 'Точка на вынос' : 'Кофейня') as BranchType,
          imageUrl: b.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&h=400',
          isOpen: b.is_active !== false,
          isSaved: !!get().savedBranchIds[b.id],
          latitude: b.latitude ?? null,
          longitude: b.longitude ?? null,
          weeklySchedule: b.weekly_schedule || undefined,
        };
      });
      set({
        branches: [...branches, ...newBranches],
        page: nextPage,
        hasMore: (count ?? 0) > to + 1,
        isLoadingMore: false,
      });
    } else {
      set({ isLoadingMore: false });
    }
  },
    }),
    {
      name: 'cafe-branches-storage',
      partialize: (state) => ({ savedBranchIds: state.savedBranchIds }),
    }
  )
);
