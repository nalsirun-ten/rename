import { create } from 'zustand';

export interface Story {
  id: string;
  title: string;
  category: 'service' | 'promo' | 'menu' | 'places' | 'vip';
  imageUrl?: string;
  videoUrl?: string;
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
  { id: '1', title: 'Новое латте', category: 'service', imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&h=700' },
  { id: '2', title: 'Скидка 20%', category: 'promo', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', imageUrl: 'https://images.unsplash.com/photo-1481833761820-0509d32170b4?auto=format&fit=crop&w=400&h=700' },
  { id: '3', title: 'Круассаны', category: 'menu', imageUrl: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=400&h=700' },
  { id: '4', title: 'Новый филиал', category: 'places', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&h=700' },
  { id: '5', title: 'VIP-карта', category: 'vip', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&h=700' },
];

interface StoriesState {
  stories: Story[];
  isLoading: boolean;
  seenStories: Set<string>;
  activeStoryId: string | null;
  markAsSeen: (id: string) => void;
  openStory: (id: string) => void;
  closeStory: () => void;
}

export const useStoriesStore = create<StoriesState>((set) => ({
  stories: MOCK_STORIES,
  isLoading: false,
  seenStories: new Set<string>(),
  activeStoryId: null,
  markAsSeen: (id: string) =>
    set((state) => ({ seenStories: new Set([...state.seenStories, id]) })),
  openStory: (id: string) => set({ activeStoryId: id }),
  closeStory: () => set({ activeStoryId: null }),
}));
