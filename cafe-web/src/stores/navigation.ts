import { create } from 'zustand';

interface NavigationState {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeTab: 0,
  setActiveTab: (index: number) => set({ activeTab: index }),
}));

