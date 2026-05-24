import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      activeTab: 0,
      setActiveTab: (index: number) => set({ activeTab: index }),
    }),
    {
      name: 'cafe-nav',
    },
  ),
);
