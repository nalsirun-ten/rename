import { create } from 'zustand';
import restoranImage from '@assets/images/restoran-komanda.jpg';
import coffee3dImage from '@assets/images/coffee_cup_3d.png';

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

const MOCK_BRANCHES: Branch[] = [
  {
    id: '1',
    title: 'Центральный филиал',
    address: 'Бишкек, пр. Чуй 125',
    openTime: '08:00',
    closeTime: '22:00',
    type: 'Кофейня',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&h=400',
    isOpen: true,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Парк Ататюрк',
    address: 'Бишкек, ул. Ахунбаева 92',
    openTime: '09:00',
    closeTime: '23:00',
    type: 'Кофейня',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&h=400',
    isOpen: true,
    isSaved: false,
  },
  {
    id: '3',
    title: 'Дордой Плаза',
    address: 'Бишкек, ул. Ибраимова 115 (ТЦ Dordoi Plaza, 1 этаж)',
    openTime: '10:00',
    closeTime: '22:00',
    type: 'Точка на вынос',
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&h=400',
    isOpen: true,
    isSaved: false,
  },
  {
    id: '4',
    title: 'Южные Ворота',
    address: 'Бишкек, ул. Токомбаева 23/1',
    openTime: '08:00',
    closeTime: '23:00',
    type: 'Кофейня',
    imageUrl: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=600&h=400',
    isOpen: true,
    isSaved: false,
  },
];

interface BranchesState {
  branches: Branch[];
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
}

export const useBranchesStore = create<BranchesState>((set) => ({
  branches: MOCK_BRANCHES,
  searchQuery: '',
  filter: 'Все',
  activeTab: 'Списком',
  activeBranchId: null,
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilter: (filter: FilterType) => set({ filter }),
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  openBranch: (id: string) => set({ activeBranchId: id }),
  closeBranch: () => set({ activeBranchId: null }),
  toggleSaved: (id: string) =>
    set((state) => ({
      branches: state.branches.map((b) =>
        b.id === id ? { ...b, isSaved: !b.isSaved } : b
      ),
    })),
}));
