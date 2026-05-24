import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'event' | 'promo' | 'info' | 'service';
  imageUrl?: string;
  createdAt?: string;
}

// ─── Category config ─────────────────────────────────────────────────

const CATEGORY_TAGS: Record<NewsItem['category'], string> = {
  event: 'Событие',
  promo: 'Акция',
  info: 'Новость',
  service: 'Сервис',
};

export function getCategoryTag(category: NewsItem['category']): string {
  return CATEGORY_TAGS[category] ?? 'Новость';
}

export function getCategoryColor(category: NewsItem['category']): string {
  switch (category) {
    case 'promo': return '#EF4444';
    case 'event': return '#8B5CF6';
    case 'service': return '#10B981';
    case 'info': default: return '#3B82F6';
  }
}

// ─── Mock data ───────────────────────────────────────────────────────

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Новое летнее меню уже здесь!',
    content: 'Мы обновили меню: свежие лимонады, холодный кофе и новые десерты. Заходите попробовать первыми! В ассортименте: лавандовый раф, матча-латте со льдом, фирменный айс-капучино и многое другое.',
    category: 'promo',
    createdAt: '2026-05-22T10:00:00Z',
  },
  {
    id: '2',
    title: 'Мастер-класс по латте-арту',
    content: 'Приглашаем всех желающих на бесплатный мастер-класс! Наш бариста Азамат покажет, как создавать красивый латте-арт. Суббота, 15:00. Количество мест ограничено, записывайтесь у администратора.',
    category: 'event',
    createdAt: '2026-05-18T14:00:00Z',
  },
  {
    id: '3',
    title: 'Скидка 20% на все десерты',
    content: 'Только в эти выходные скидка 20% на все десерты при заказе любого кофе. Попробуйте наш фирменный чизкейк и тирамису! Акция действует во всех филиалах.',
    category: 'promo',
    createdAt: '2026-05-15T08:00:00Z',
  },
  {
    id: '4',
    title: 'Открытие нового филиала',
    content: 'Мы открываем новый филиал в центре города! Адрес: ул. Чуй, 123. В день открытия — бесплатный кофе для первых 50 гостей. Ждём вас!',
    category: 'event',
    createdAt: '2026-05-10T12:00:00Z',
  },
  {
    id: '5',
    title: 'Новые часы работы',
    content: 'Обратите внимание: с 1 июня мы переходим на летний режим работы. Теперь мы открыты с 7:00 до 23:00 ежедневно. Утренний кофе стал ещё доступнее!',
    category: 'info',
    createdAt: '2026-05-05T09:00:00Z',
  },
];

// ─── Store ───────────────────────────────────────────────────────────

interface NewsState {
  news: NewsItem[];
  isLoading: boolean;
}

export const useNewsStore = create<NewsState>(() => ({
  news: MOCK_NEWS,
  isLoading: false,
}));
