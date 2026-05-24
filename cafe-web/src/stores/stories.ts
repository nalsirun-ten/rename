import { create } from 'zustand';

export interface Story {
  id: string;
  title: string;
  category: 'service' | 'promo' | 'menu' | 'places' | 'vip';
  imageUrl?: string;
  description?: string;
  createdAt?: string;
}

export const CAT_CFG: Record<Story['category'], { name: string; icon: string; colors: [string, string] }> = {
  service: { name: 'Новинки', icon: '☕', colors: ['#80CBC4', '#4DB6AC'] },
  promo:   { name: 'Акции',   icon: '🏷️', colors: ['#FFD6A5', '#FF9F45'] },
  menu:    { name: 'Меню',    icon: '🥐', colors: ['#90CAF9', '#64B5F6'] },
  places:  { name: 'Места',   icon: '📍', colors: ['#FFDAC1', '#E8A87C'] },
  vip:     { name: 'VIP',     icon: '⭐', colors: ['#C5CAE9', '#9FA8DA'] },
};

const MOCK_STORIES: Story[] = [
  { id: '1', title: 'Новое латте', category: 'service', imageUrl: undefined },
  { id: '2', title: 'Скидка 20%', category: 'promo', imageUrl: undefined },
  { id: '3', title: 'Круассаны', category: 'menu', imageUrl: undefined },
  { id: '4', title: 'Новый филиал', category: 'places', imageUrl: undefined },
  { id: '5', title: 'VIP-карта', category: 'vip', imageUrl: undefined },
];

interface StoriesState {
  stories: Story[];
  isLoading: boolean;
  seenStories: Set<string>;
  markAsSeen: (id: string) => void;
}

export const useStoriesStore = create<StoriesState>((set) => ({
  stories: MOCK_STORIES,
  isLoading: false,
  seenStories: new Set<string>(),
  markAsSeen: (id: string) =>
    set((state) => ({ seenStories: new Set([...state.seenStories, id]) })),
}));
