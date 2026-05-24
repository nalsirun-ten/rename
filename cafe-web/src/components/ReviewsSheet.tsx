import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  useReviewsStore,
  getRatingLabel,
  getRatingColor,
  getAvatarGradient,
  getInitials,
  getPluralForm,
  type Review,
} from '../stores/reviews';

// ─── Types ───────────────────────────────────────────────────────────

type FilterMode = 'most_liked' | 'recent' | 'positive' | 'negative';

const FILTER_LABELS: Record<FilterMode, string> = {
  most_liked: 'Популярные',
  recent: 'Новые',
  positive: 'Положительные',
  negative: 'Отрицательные',
};

// ─── Rating stars helper ─────────────────────────────────────────────

function StarRow({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        return (
          <span
            key={star}
            className="icon-material"
            style={{
              fontSize: size,
              color: filled ? '#FFB800' : '#E2E8F0',
              fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        );
      })}
    </div>
  );
}

// ─── StatsCard ───────────────────────────────────────────────────────

function StatsCard({ reviews }: { reviews: Review[] }) {
  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

  // Distribution: count per star (5,4,3,2,1)
  const dist = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length,
  );
  const maxDist = Math.max(...dist, 1);

  return (
    <div
      style={{
        margin: '0 16px 16px',
        padding: 20,
        background: 'linear-gradient(to bottom right, #1E293B, #0F172A)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.3)',
        display: 'flex',
        gap: 24,
      }}
    >
      {/* Left: Big rating */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 42, fontWeight: 900, color: '#FFF', lineHeight: 1 }}>
          {avgRating.toFixed(1)}
        </span>
        <div style={{ height: 6 }} />
        <StarRow rating={Math.round(avgRating)} size={16} />
        <div style={{ height: 6 }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
          {totalCount} {getPluralForm(totalCount)}
        </span>
      </div>

      {/* Right: Distribution bars */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
        {[5, 4, 3, 2, 1].map((star, i) => {
          const count = dist[i];
          const fraction = count / maxDist;
          const barGradient =
            star >= 4
              ? 'linear-gradient(to right, #10B981, #34D399)'
              : star === 3
                ? 'linear-gradient(to right, #FBBF24, #F59E0B)'
                : 'linear-gradient(to right, #EF4444, #F87171)';

          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textAlign: 'right' }}>
                {star}
              </span>
              <div
                style={{
                  flex: 1, height: 8, borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${fraction * 100}%`, height: '100%',
                    borderRadius: 6, background: barGradient,
                    transition: 'width 400ms ease',
                  }}
                />
              </div>
              <span style={{ width: 20, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.38)' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ReviewCard ──────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const { isLiked, toggleLike } = useReviewsStore();
  const liked = isLiked(review.id);

  const name = review.user?.full_name ?? review.guest_name ?? 'Гость';
  const avatarUrl = review.user?.avatar_url ?? review.guest_avatar;
  const initials = getInitials(name);
  const [avatarGradA, avatarGradB] = getAvatarGradient(name);
  const staffName = review.doctor?.full_name;
  const isVerified = !!review.user?.id;

  // Format date
  let dateStr = '';
  try {
    dateStr = new Date(review.created_at).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    // ignore
  }

  const baseLikes = review.likes;
  const displayLikes = liked ? Math.max(baseLikes, 1) : baseLikes;

  return (
    <div
      style={{
        marginBottom: 12,
        padding: 16,
        backgroundColor: '#EFF6FF',
        borderRadius: 32,
        border: '1px solid #BFDBFE',
      }}
    >
      {/* ── Header: Avatar, Name, Ratings ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: `linear-gradient(to bottom right, ${avatarGradA}, ${avatarGradB})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span style={{ color: '#FFF', fontWeight: 800, fontSize: 18 }}>{initials}</span>
          )}
        </div>

        {/* Name, Date, Staff */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 15, fontWeight: 700, color: '#1E293B',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            {isVerified && (
              <span
                className="icon-material"
                style={{
                  fontSize: 14, color: '#10B981',
                  fontVariationSettings: "'FILL' 1",
                  flexShrink: 0,
                }}
              >
                verified
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8' }}>{dateStr}</span>
            {staffName && (
              <>
                <span style={{ color: '#E2E8F0' }}>•</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#C27A3E' }}>{staffName}</span>
              </>
            )}
          </div>
        </div>

        {/* Rating badge + stars (top right) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <div
            style={{
              padding: '2px 6px', borderRadius: 6,
              backgroundColor: getRatingColor(review.rating),
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>
              {getRatingLabel(review.rating)}
            </span>
            <span
              className="icon-material"
              style={{
                fontSize: 12, color: '#FFF',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              star
            </span>
          </div>
          <div style={{ height: 4 }} />
          <StarRow rating={review.rating} size={10} />
        </div>
      </div>

      {/* ── Text ── */}
      {review.text && (
        <p
          style={{
            fontSize: 14, color: '#1E293B', lineHeight: 1.5,
            marginTop: 12, marginBottom: 0,
          }}
        >
          {review.text}
        </p>
      )}

      {/* ── Images ── */}
      {review.images && review.images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
          {review.images.map((img, i) => (
            <div
              key={i}
              style={{
                width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                backgroundColor: '#FFF', border: '1px solid #FFEDD5',
                overflow: 'hidden',
              }}
            >
              <img
                src={img}
                alt={`Фото ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Footer: verified + like ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        {isVerified ? (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>
            Проверенный покупатель
          </span>
        ) : (
          <div />
        )}
        <button
          className="btn-reset"
          onClick={() => toggleLike(review.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 12,
          }}
        >
          <span
            className="icon-material"
            style={{
              fontSize: 20,
              color: liked ? '#EF4444' : '#94A3B8',
              fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
          <span
            style={{
              fontSize: 13, fontWeight: 600,
              color: liked ? '#EF4444' : '#94A3B8',
            }}
          >
            {displayLikes === 0 && !liked ? 'Полезно' : displayLikes}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── ReviewsSheet ────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export default function ReviewsSheet({ onClose }: Props) {
  const { reviews } = useReviewsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('most_liked');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  // Filter + search logic
  const filtered = useMemo(() => {
    let result = [...reviews];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => {
        const userName = (r.user?.full_name ?? r.guest_name ?? '').toLowerCase();
        const text = (r.text || '').toLowerCase();
        return text.includes(q) || userName.includes(q);
      });
    }

    // Filter
    switch (filter) {
      case 'positive':
        result = result.filter((r) => r.rating >= 4);
        break;
      case 'negative':
        result = result.filter((r) => r.rating <= 3);
        break;
      case 'most_liked':
        result.sort((a, b) => (b.likes - a.likes) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [reviews, search, filter]);

  return createPortal(
    <div
      className="rs-overlay overlay-base"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div
        ref={sheetRef}
        className="rs-sheet flex-col"
        style={{
          width: '100%', maxWidth: 430,
          height: '88vh',
          backgroundColor: '#F8F9FB',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div className="flex-between" style={{ padding: '16px 20px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              Отзывы
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button
            className="btn-reset flex-center"
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: '#F1F5F9',
            }}
          >
            <span className="icon-material" style={{
              fontSize: 20, color: '#64748B',
              fontVariationSettings: "'FILL' 0",
            }}>
              close
            </span>
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {/* Stats */}
          <StatsCard reviews={reviews} />

          {/* Search & Filter bar */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
            {/* Search input */}
            <div
              style={{
                flex: 1, height: 48, borderRadius: 100,
                backgroundColor: '#FFF', border: '1.5px solid #E2E8F0',
                display: 'flex', alignItems: 'center', paddingLeft: 16, gap: 8,
              }}
            >
              <span className="icon-material" style={{
                fontSize: 22, color: '#545454',
                fontVariationSettings: "'FILL' 0",
              }}>
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по отзывам"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 15, fontWeight: 500, color: '#0F172A',
                  backgroundColor: 'transparent', fontFamily: "'Outfit', sans-serif",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 16px', display: 'flex',
                  }}
                >
                  <span className="icon-material" style={{
                    fontSize: 20, color: '#9E9E9E',
                  }}>
                    close
                  </span>
                </button>
              )}
            </div>

            {/* Filter button */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-reset flex-center"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: '#1E293B',
                }}
              >
                <span className="icon-material" style={{
                  fontSize: 22, color: '#FFF',
                  fontVariationSettings: "'FILL' 0",
                }}>
                  tune
                </span>
              </button>

              {/* Dropdown menu */}
              {showFilterMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 1 }}
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute', top: 52, right: 0, zIndex: 2,
                      backgroundColor: '#FFF', borderRadius: 16,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      overflow: 'hidden', minWidth: 200,
                    }}
                  >
                    {(Object.entries(FILTER_LABELS) as [FilterMode, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        className="btn-reset"
                        onClick={() => {
                          setFilter(key);
                          setShowFilterMenu(false);
                        }}
                        style={{
                          display: 'block', width: '100%', padding: '12px 20px',
                          fontSize: 15, fontWeight: filter === key ? 700 : 500,
                          color: filter === key ? '#C27A3E' : '#1E293B',
                          textAlign: 'left',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Review cards ── */}
          <div style={{ padding: '0 16px 120px' }}>
            {filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 0', gap: 12,
              }}>
                <span className="icon-material" style={{
                  fontSize: 52, color: '#CBD5E1',
                }}>
                  chat_bubble_outline
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>
                  Нет отзывов
                </span>
              </div>
            ) : (
              filtered.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
