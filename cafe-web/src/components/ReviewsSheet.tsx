import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useReviewsStore,
  getRatingLabelKey,
  getRatingColor,
  getAvatarGradient,
  getInitials,
  getPluralFormKey,
  type Review,
} from '../stores/reviews';
import { useProfileStore } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';
import type { TranslationKey } from '../i18n/translations';


// ─── Types ───────────────────────────────────────────────────────────

type FilterMode = 'most_liked' | 'recent' | 'positive' | 'negative';

const FILTER_LABEL_KEYS: Record<FilterMode, TranslationKey> = {
  most_liked: 'reviews_filter_popular',
  recent: 'reviews_filter_new',
  positive: 'reviews_filter_positive',
  negative: 'reviews_filter_negative',
};

// ─── Rating stars helper ─────────────────────────────────────────────

function StarRow({ rating, size }: { rating: number; size?: string }) {
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

function StatsCard({ stats }: { stats: { totalCount: number; avgRating: number; dist: number[] } | null }) {
  const t = useT();
  if (!stats) return null;

  const { totalCount, avgRating, dist } = stats;
  const maxDist = Math.max(...dist, 1);

  return (
    <div
      style={{
        margin: '0 16px 16px',
        padding: '20px 16px',
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
        <span style={{ fontSize: 'clamp(42px, 10.7rem, 60px)', fontWeight: 900, color: '#FFF', lineHeight: 1 }}>
          {avgRating.toFixed(1)}
        </span>
        <div style={{ height: 6 }} />
        <StarRow rating={Math.round(avgRating)} size={'clamp(13px, 4.1rem, 22px)'} />
        <div style={{ height: 6 }} />
        <span style={{ fontSize: 'clamp(13px, 3.3rem, 18px)', fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
          {totalCount} {t(getPluralFormKey(totalCount))}
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
              <span style={{ width: 14, fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textAlign: 'right' }}>
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
              <span style={{ width: 20, fontSize: 'clamp(11px, 2.8rem, 15px)', fontWeight: 600, color: 'rgba(255,255,255,0.38)' }}>
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
  const { id: profileId } = useProfileStore();
  const t = useT();
  const liked = isLiked(review.id);

  const name = review.user?.full_name ?? review.guest_name ?? t('guest');
  const avatarUrl = review.user?.avatar_url ?? review.guest_avatar;
  const initials = getInitials(name);
  const [avatarGradA, avatarGradB] = getAvatarGradient(name);
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
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        border: 'none',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18)',
      }}
    >
      {/* ── Header: Avatar, Name, Ratings ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 'clamp(44px, 11.2rem, 62px)', height: 'clamp(44px, 11.2rem, 62px)', borderRadius: '50%',
            background: `linear-gradient(to bottom right, ${avatarGradA}, ${avatarGradB})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              loading="lazy"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span style={{ color: '#FFF', fontWeight: 800, fontSize: 'clamp(18px, 4.6rem, 26px)' }}>{initials}</span>
          )}
        </div>

        {/* Name, Date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 700, color: '#1E293B',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
            {isVerified && (
              <span
                className="icon-material"
                style={{
                  fontSize: 'clamp(14px, 3.6rem, 20px)', color: '#10B981',
                  fontVariationSettings: "'FILL' 1",
                  flexShrink: 0,
                }}
              >
                verified
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 500, color: '#94A3B8' }}>{dateStr}</span>
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
            <span style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 800, color: '#FFF' }}>
              {t(getRatingLabelKey(review.rating))}
            </span>
            <span
              className="icon-material"
              style={{
                fontSize: 'clamp(12px, 3.1rem, 16px)', color: '#FFF',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              star
            </span>
          </div>
          <div style={{ height: 4 }} />
          <StarRow rating={review.rating} size={'clamp(8px, 2.5rem, 14px)'} />
        </div>
      </div>

      {/* ── Text ── */}
      {review.text && (
        <p
          style={{
            fontSize: 'clamp(14px, 3.6rem, 20px)', color: '#1E293B', lineHeight: 1.5,
            marginTop: 12, marginBottom: 0,
          }}
        >
          {review.text}
        </p>
      )}

      {/* ── Images ── */}
      {review.images && review.images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', overscrollBehaviorX: 'contain' }}>
          {review.images.map((img, i) => (
            <div
              key={i}
              style={{
                width: 'clamp(80px, 20.4rem, 112px)', height: 'clamp(80px, 20.4rem, 112px)', borderRadius: 12, flexShrink: 0,
                backgroundColor: '#FFF', border: '1px solid #FFEDD5',
                overflow: 'hidden',
              }}
            >
              <img
                src={img}
                alt={t('photo_alt', { n: i + 1 })}
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
          <span style={{ fontSize: 'clamp(10px, 2.6rem, 14px)', fontWeight: 600, color: '#10B981' }}>
            {t('reviews_verified_buyer')}
          </span>
        ) : (
          <div />
        )}
        <button
          className="btn-reset"
          onClick={() => toggleLike(review.id, profileId || undefined)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 12,
          }}
        >
          <span
            className="icon-material"
            style={{
              fontSize: 'clamp(20px, 5.1rem, 28px)',
              color: liked ? '#EF4444' : '#94A3B8',
              fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            favorite
          </span>
          <span
            style={{
              fontSize: 'clamp(13px, 3.3rem, 18px)', fontWeight: 600,
              color: liked ? '#EF4444' : '#94A3B8',
            }}
          >
            {displayLikes === 0 && !liked ? t('reviews_useful') : displayLikes}
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
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { reviews, stats, searchQuery, filter, setSearchQuery, setFilter, fetchMoreReviews, isLoadingMore } = useReviewsStore();
  const [showFilterMenu, setShowFilterMenu] = useState(false);


  useLockBodyScroll();
  const handleOverlayClick = useOverlayClose(onClose);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      fetchMoreReviews();
    }
  };

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
        <div className="flex-between" style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('reviews_title')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button
            className="btn-reset flex-center"
            onClick={onClose}
            style={{
              width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%',
              backgroundColor: '#E2E8F0',
            }}
          >
            <span className="icon-material" style={{
              fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B',
              fontVariationSettings: "'FILL' 0",
            }}>
              close
            </span>
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} onScroll={handleScroll}>
          {/* Stats */}
          <StatsCard stats={stats} />

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
                fontSize: 'clamp(22px, 5.6rem, 32px)', color: '#545454',
                fontVariationSettings: "'FILL' 0",
              }}>
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('reviews_search_placeholder')}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 500, color: '#0F172A',
                  backgroundColor: 'transparent', fontFamily: "'Outfit', sans-serif",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 16px', display: 'flex',
                  }}
                >
                  <span className="icon-material" style={{
                    fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#9E9E9E',
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
                  width: 'clamp(48px, 12.2rem, 67px)', height: 'clamp(48px, 12.2rem, 67px)', borderRadius: '50%',
                  backgroundColor: '#1E293B',
                }}
              >
                <span className="icon-material" style={{
                  fontSize: 'clamp(22px, 5.6rem, 32px)', color: '#FFF',
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
                    {(Object.entries(FILTER_LABEL_KEYS) as [FilterMode, TranslationKey][]).map(([key, transKey]) => (
                      <button
                        key={key}
                        className="btn-reset"
                        onClick={() => {
                          setFilter(key);
                          setShowFilterMenu(false);
                        }}
                        style={{
                          display: 'block', width: '100%', padding: '12px 16px',
                          fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: filter === key ? 700 : 500,
                          color: filter === key ? '#C27A3E' : '#1E293B',
                          textAlign: 'left',
                        }}
                      >
                        {t(transKey)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Review cards ── */}
          <div style={{ padding: '0 16px 120px' }}>
            {reviews.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '40px 0', gap: 12,
              }}>
                <span className="icon-material" style={{
                  fontSize: 'clamp(52px, 13.3rem, 73px)', color: '#CBD5E1',
                }}>
                  chat_bubble_outline
                </span>
                <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600, color: '#94A3B8' }}>
                  {t('reviews_no_reviews')}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {isLoadingMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 32px' }}>
                    <span className="icon-material animate-spin" style={{ color: '#94A3B8', fontSize: 32 }}>autorenew</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
