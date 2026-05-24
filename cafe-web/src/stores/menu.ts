import { create } from 'zustand';
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
}

const MOCK_MENU: MenuItem[] = [
  {
    id: '1',
    title: 'Бамбл-кофе',
    description: 'Освежающий трехслойный напиток на основе апельсинового фреша, карамельного сиропа и двойного эспрессо. Идеально бодрит в жаркие летние дни.',
    price: 250,
    imageUrl: coffee3dImage,
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Капучино',
    description: 'Сливочный капучино с нежной пенкой.',
    price: 150,
    imageUrl: coffee3dImage,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Круассан классический',
    description: 'Хрустящий круассан на сливочном масле.',
    price: 120,
    imageUrl: restoranImage, // Mocking with available image
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Круассан с миндалем',
    description: 'Свежевыпеченный французский круассан с щедрой начинкой из сладкого миндального крема (франжипана) и лепестками миндаля сверху. Подаётся тёплым.',
    price: 160,
    imageUrl: restoranImage,
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Фисташковый рулет',
    description: 'Легкий меренговый рулет со сливочно-фисташковым кремом и свежей малиной. Буквально тает во рту и оставляет нежное ореховое послевкусие.',
    price: 240,
    imageUrl: restoranImage,
    isFavorite: false,
  },
  {
    id: '6',
    title: 'Флэт Уайт',
    description: 'Двойной эспрессо с тонким слоем нежной глянцевой молочной пены. Яркий кофейный вкус для тех, кто любит крепкий, но мягкий кофе.',
    price: 180,
    imageUrl: coffee3dImage,
    isFavorite: false,
  },
  {
    id: '7',
    title: 'Эспрессо',
    description: 'Бодрящий эспрессо из 100% арабики.',
    price: 100,
    imageUrl: coffee3dImage,
    isFavorite: false,
  },
  {
    id: '8',
    title: 'Эспрессо-тоник',
    description: 'Двойной эспрессо с холодным тоником, большим количеством льда и долькой сочного грейпфрута. Уникальный баланс горечи кофе и сладости тоника.',
    price: 220,
    imageUrl: coffee3dImage,
    isFavorite: false,
  },
];

interface MenuState {
  items: MenuItem[];
  searchQuery: string;
  activeTab: MenuTab;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: MenuTab) => void;
  toggleFavorite: (id: string) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  items: MOCK_MENU,
  searchQuery: '',
  activeTab: 'Меню',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setActiveTab: (tab: MenuTab) => set({ activeTab: tab }),
  toggleFavorite: (id: string) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ),
    })),
}));
