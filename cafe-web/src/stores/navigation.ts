import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      name: 'navigation-tab',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
