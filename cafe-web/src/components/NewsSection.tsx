// ─── NewsSection – horizontal carousel with bento cutout cards ──────
// Flutter: news_section.dart
//   - LayoutBuilder → cardW = min(availableW*0.84, 380), height = cardW*0.45
//   - ListView.builder horizontal with ScrollController for dots
//   - _NewsCard: BentoShape with circular cutout bottom-right
//     Stack: background image/gradient → gradient overlay → Tag + Title + Content
//     Positioned date badge (48×48 circle) in cutout

import { useState, useRef, useEffect } from 'react';
import { useNewsStore, type NewsItem, getCategoryTag, getCategoryTagKey } from '../stores/news';
import { thumbnailUrl } from '../utils/imageUrl';
import NewsDetailModal from './NewsDetailModal';
import { useT } from '../i18n/useT';

// ─── Color lerp helper ────────────────────────────────────────────────

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff;
  const br = (bh >> 16) & 0xff,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
}

// ─── NewsCard ─────────────────────────────────────────────────────────
// Exact copy of Flutter _NewsCard:
//   BentoShape (borderRadius:24, circular cutout at bottom-right)
//   → background image or gradient fallback
//   → gradient overlay (top→bottom: transparent→10%→85% dark)
//   → Tag (Container #185D93 bg, 10px w700 white)
//   → Title (max 2 lines, 15px w700 white)
//   → Content preview (max 40 chars, 11px white 70%)
//   → Date badge (Positioned right:0 bottom:0, 48×48 circle, border 3.5px)

import React from 'react';
import type { TranslationKey } from '../i18n/translations';

const MONTH_CAPS_KEYS: TranslationKey[] = [
  'month_jan_caps', 'month_feb_caps', 'month_mar_caps', 'month_apr_caps',
  'month_may_caps', 'month_jun_caps', 'month_jul_caps', 'month_aug_caps',
  'month_sep_caps', 'month_oct_caps', 'month_nov_caps', 'month_dec_caps',
];

const NewsCard = React.memo(function NewsCard({
  item,
  tag,
  cardWidth,
  cardHeight,
  onTap,
}: {
  item: NewsItem;
  tag: string;
  cardWidth: number;
  cardHeight: number;
  onTap: () => void;
}) {
  const t = useT();
  const contentPreview =
    item.content.length > 40 ? `${item.content.substring(0, 40)}...` : item.content;

  let day = '';
  let month = '';
  if (item.createdAt) {
    const d = new Date(item.createdAt);
    day = d.getDate().toString();
    month = t(MONTH_CAPS_KEYS[d.getMonth()]);
  }

  return (
    <button
      className="btn-reset"
      onClick={onTap}
      style={{
        position: 'relative',
        width: cardWidth,
        height: cardHeight,
        flexShrink: 0,
        scrollSnapAlign: 'start',
      }}
    >
      {/* ── Card body ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: day ? '36px 36px 0 36px' : 36,
          overflow: 'hidden',
        }}
      >
        {/* Background image or fallback */}
        {item.imageUrl ? (
          <img
            src={thumbnailUrl(item.imageUrl, 600)}
            alt={item.title}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #4A3B32 0%, #2C1F17 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="icon-material"
                style={{
                  fontSize: 'clamp(40px, 10.2rem, 56px)',
                  color: 'rgba(255,255,255,0.32)',
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                article
              </span>
            </div>
          </>
        )}

        {/* Gradient overlay: transparent → 10% at 40% → 85% at bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(26,18,11,0.1) 40%, rgba(26,18,11,0.85) 100%)',
          }}
        />

        {/* ── Content ── */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {/* Category tag */}
          <span
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: 8,
              backgroundColor: '#185D93',
              fontSize: 'clamp(10px, 2.5rem, 14px)',
              fontWeight: 700,
              color: '#FFF',
              letterSpacing: 0.5,
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            {tag}
          </span>

          {/* Title — max 2 lines */}
          <span
            style={{
              fontSize: 'clamp(15px, 3.8rem, 21px)',
              fontWeight: 700,
              color: '#FFF',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'left',
              marginBottom: contentPreview ? 2 : 0,
            }}
          >
            {item.title}
          </span>

          {/* Content preview — 1 line, 70% opacity */}
          {contentPreview && (
            <span
              style={{
                fontSize: 'clamp(11px, 2.8rem, 15px)',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {contentPreview}
            </span>
          )}
        </div>
      </div>

      {/* ── Border Overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: day ? '36px 36px 0 36px' : 36,
          border: '4px solid #1E293B',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Continuous Border Overlay (Inside Variant) ── */}
      {day && (() => {
        const cutoutScale = Math.min(1, cardHeight / 170);
        const cutoutSize = 100 * cutoutScale;
        const cutoutOffset = 2 - 2 * cutoutScale;

        return (
          <>
            <svg
              width={cutoutSize}
              height={cutoutSize}
              viewBox="0 0 100 100"
              style={{
                position: 'absolute',
                bottom: cutoutOffset,
                right: cutoutOffset,
                pointerEvents: 'none',
                zIndex: 2,
                overflow: 'visible',
              }}
            >
              {/* Fill to hide the card's original corner and border */}
              <path
                d="M 98 0 L 98 23.5 A 16 16 0 0 1 78 39 A 32 32 0 0 0 39 78 A 16 16 0 0 1 23.5 98 L 0 98 L 0 104 L 104 104 L 104 0 Z"
                fill="#FEF9F5"
              />
              {/* Stroke to draw the continuous curved dark border */}
              <path
                d="M 98 0 L 98 23.5 A 16 16 0 0 1 78 39 A 32 32 0 0 0 39 78 A 16 16 0 0 1 23.5 98 L 0 98"
                fill="none"
                stroke="#1E293B"
                strokeWidth={4 / cutoutScale}
              />
            </svg>

            {/* ── Date Badge (Fully Inside) ── */}
            <div
              style={{
                position: 'absolute',
                bottom: 6 * cutoutScale + cutoutOffset,
                right: 6 * cutoutScale + cutoutOffset,
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                transform: `scale(${cutoutScale})`,
                transformOrigin: 'bottom right',
              }}
            >
              <span style={{ color: '#FFF', fontSize: 'clamp(16px, 4.1rem, 22px)', fontWeight: 700, lineHeight: 1 }}>
                {day}
              </span>
              <span style={{ color: '#94A3B8', fontSize: 'clamp(10px, 2.5rem, 14px)', fontWeight: 700, lineHeight: 1, marginTop: 2, letterSpacing: 0.5 }}>
                {month}
              </span>
            </div>
          </>
        );
      })()}

    </button>
  );
});

// ─── SkeletonCard ─────────────────────────────────────────────────────

function SkeletonCard({ cardWidth, cardHeight }: { cardWidth: number; cardHeight: number }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width: cardWidth,
        height: cardHeight,
        flexShrink: 0,
        borderRadius: 36,
        scrollSnapAlign: 'start',
      }}
    />
  );
}

// ─── DotsIndicator ────────────────────────────────────────────────────
// Subscribes to the carousel's scroll directly (rAF-throttled) and re-renders
// ONLY itself. Keeping scrollPosition in NewsSection state re-rendered the
// whole section on every scrolled pixel of the carousel.

function DotsIndicator({
  count,
  scrollElRef,
  itemWidth,
}: {
  count: number;
  scrollElRef: React.RefObject<HTMLDivElement | null>;
  itemWidth: number;
}) {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrollPosition(el.scrollLeft);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollElRef]);

  if (count <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: count }, (_, index) => {
        const scrollIndex = Math.max(0, Math.min(scrollPosition / itemWidth, count - 1));
        const distance = Math.abs(scrollIndex - index);
        // Animated width: 8px → 20px as distance goes 1 → 0
        const dotWidth = distance < 1 ? 8 + 12 * (1 - distance) : 8;
        // Animated color: inactive (#CBD5E1) → active (#1E293B)
        const activeColor = distance < 1 ? lerpColor('#1E293B', '#CBD5E1', distance) : '#CBD5E1';

        return (
          <div
            key={index}
            style={{
              height: 8,
              width: dotWidth,
              borderRadius: 4,
              backgroundColor: activeColor,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── NewsSection ──────────────────────────────────────────────────────

export default function NewsSection() {
  const { news, isLoading } = useNewsStore();
  const t = useT();
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  // LayoutBuilder equivalent: measure available width
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);


  // Card dimensions (match Flutter logic)
  const cardW = Math.min(containerWidth * 0.84, 380);
  const cardH = cardW * 0.45;
  const itemWidth = cardW + 14; // 14px gap between cards

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      <div ref={containerRef} style={{ paddingBottom: 28 }}>
        {/* ── Section title ── */}
        <h3
          style={{
            fontSize: 'clamp(16px, 4.5rem, 22px)',
            fontWeight: 800,
            letterSpacing: -0.5,
            color: '#000',
            marginBottom: 12,
            paddingLeft: 20,
          }}
        >
          {t('news_title')}
        </h3>

        {/* ── Carousel ── */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              gap: 14,
              paddingLeft: 16,
              paddingRight: 16,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollPaddingLeft: 16,
              scrollbarWidth: 'none',
              overscrollBehaviorX: 'contain',
              height: cardH || 120,
            }}
          >
            {[0, 1].map((i) => (
              <SkeletonCard key={i} cardWidth={cardW || 280} cardHeight={cardH || 120} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div
            style={{
              height: cardH || 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 14, color: '#94A3B8' }}>{t('news_empty')}</span>
          </div>
        ) : containerWidth > 0 ? (
          <>
            <div
              ref={scrollRef}
              style={{
                display: 'flex',
                gap: 14,
                paddingLeft: 16,
                paddingRight: 16,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollPaddingLeft: 16,
                scrollbarWidth: 'none',
                overscrollBehaviorX: 'contain',
                height: cardH,
              }}
            >
              {news.map((item) => {
                const tag = t(getCategoryTagKey(item.category));
                return (
                  <NewsCard
                    key={item.id}
                    item={item}
                    tag={tag}
                    cardWidth={cardW}
                    cardHeight={cardH}
                    onTap={() => setSelectedItem(item)}
                  />
                );
              })}
            </div>

            {/* ── Dots indicator ── */}
            <div style={{ marginTop: 16 }}>
              <DotsIndicator count={news.length} scrollElRef={scrollRef} itemWidth={itemWidth} />
            </div>
          </>
        ) : null}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <NewsDetailModal
          item={selectedItem}
          tag={t(getCategoryTagKey(selectedItem.category))}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
