import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number; // 1-5
  text: string;
  guest_name?: string;
  guest_avatar?: string;
  user?: {
    full_name: string;
    avatar_url?: string;
    id?: string;
  };
  doctor?: {
    full_name: string;
  };
  images?: string[];
  likes: number;
  created_at: string;
}

// ─── Mock data ───────────────────────────────────────────────────────

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    rating: 5,
    text: 'Отличное место! Очень вкусный кофе и приятная атмосфера. Персонал вежливый и внимательный. Обязательно вернусь сюда ещё!',
    user: { full_name: 'Айжан М.', avatar_url: undefined, id: 'user1' },
    doctor: { full_name: 'Бариста Азамат' },
    likes: 24,
    created_at: '2026-05-20T10:30:00Z',
  },
  {
    id: '2',
    rating: 4,
    text: 'Хороший кофе и уютно. Немного долго ждал заказ, но оно того стоило.',
    guest_name: 'Айдай',
    likes: 8,
    created_at: '2026-05-19T15:45:00Z',
  },
  {
    id: '3',
    rating: 5,
    text: 'Лучший латте в городе! Рекомендую всем любителям кофе. Отдельное спасибо бариста Айдане за красивый латте-арт.',
    user: { full_name: 'Бекжан Т.', avatar_url: undefined, id: 'user2' },
    doctor: { full_name: 'Айдана К.' },
    likes: 17,
    created_at: '2026-05-18T09:15:00Z',
  },
  {
    id: '4',
    rating: 3,
    text: 'Неплохо, но ожидал большего. Цены высоковаты для такого качества.',
    guest_name: 'Гость',
    likes: 3,
    created_at: '2026-05-17T12:00:00Z',
  },
  {
    id: '5',
    rating: 5,
    text: 'Прекрасное обслуживание! Очень понравился десерт и капучино. Уютная обстановка, отличная музыка.',
    user: { full_name: 'Дария С.', avatar_url: undefined, id: 'user3' },
    likes: 31,
    created_at: '2026-05-16T14:20:00Z',
  },
  {
    id: '6',
    rating: 4,
    text: 'Хорошая кофейня, но парковка маленькая. Кофе отличный, десерты свежие.',
    guest_name: 'Азамат',
    likes: 12,
    created_at: '2026-05-15T11:00:00Z',
  },
  {
    id: '7',
    rating: 5,
    text: 'Обожаю это место! Хожу сюда каждое утро перед работой. Бариста знают мой заказ наизусть ❤️',
    user: { full_name: 'Карина М.', avatar_url: undefined, id: 'user4' },
    doctor: { full_name: 'Бариста Азамат' },
    likes: 42,
    created_at: '2026-05-14T08:30:00Z',
  },
  {
    id: '8',
    rating: 2,
    text: 'Долго ждал заказ, кофе был холодный. Надеюсь исправитесь.',
    guest_name: 'Нурсултан',
    likes: 1,
    created_at: '2026-05-12T16:10:00Z',
  },
  {
    id: '9',
    rating: 5,
    text: 'Уютная кофейня с отличным кофе и вкусными круассанами. Идеальное место для работы с ноутбуком.',
    user: { full_name: 'Эрмек Ж.', avatar_url: undefined, id: 'user5' },
    likes: 19,
    created_at: '2026-05-10T13:45:00Z',
  },
  {
    id: '10',
    rating: 4,
    text: 'Приятное место, хороший выбор напитков. Добавьте больше веганских опций пожалуйста!',
    guest_name: 'Алия',
    likes: 6,
    created_at: '2026-05-08T10:00:00Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

export function getRatingLabel(rating: number): string {
  switch (rating) {
    case 5: return 'Отлично';
    case 4: return 'Хорошо';
    case 3: return 'Нормально';
    case 2: return 'Плохо';
    case 1: return 'Ужасно';
    default: return '';
  }
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return '#10B981';
  if (rating === 3) return '#F59E0B';
  return '#EF4444';
}

export function getAvatarGradient(name: string): [string, string] {
  const gradients: [string, string][] = [
    ['#6366F1', '#818CF8'],
    ['#10B981', '#34D399'],
    ['#F59E0B', '#FBBF24'],
    ['#EF4444', '#F87171'],
    ['#8B5CF6', '#A78BFA'],
    ['#0EA5E9', '#38BDF8'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function getInitials(name: string): string {
  return name.length > 0 ? name[0].toUpperCase() : '?';
}

export function getPluralForm(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 19) return 'отзывов';
  const last = n % 10;
  if (last === 1) return 'отзыв';
  if (last >= 2 && last <= 4) return 'отзыва';
  return 'отзывов';
}

// ─── Store ───────────────────────────────────────────────────────────

interface ReviewsState {
  reviews: Review[];
  likedReviews: Set<string>;
  toggleLike: (reviewId: string) => void;
  isLiked: (reviewId: string) => boolean;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: MOCK_REVIEWS,
  likedReviews: new Set(['1', '5']),
  toggleLike: (reviewId: string) =>
    set((state) => {
      const next = new Set(state.likedReviews);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return { likedReviews: next };
    }),
  isLiked: (reviewId: string) => get().likedReviews.has(reviewId),
}));
