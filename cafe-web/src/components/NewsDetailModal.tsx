// ─── NewsDetailModal – full detail view for a news item ──────────────
// Flutter: news_detail_modal.dart
//   - Image (CachedNetworkImage with 24px border radius, 2px border, 200px height)
//   - Title (22px w800) + date + category tag row
//   - Divider + full content text (15px, line-height 1.6)

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { NewsItem } from '../stores/news';
import { getCategoryColor } from '../stores/news';

// ─── Constants ────────────────────────────────────────────────────────

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDateStr(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  } catch {
    return '';
  }
}

interface Props {
  item: NewsItem;
  tag: string;
  onClose: () => void;
}

export default function NewsDetailModal({ item, tag, onClose }: Props) {
  const categoryColor = getCategoryColor(item.category);
  const dateStr = formatDateStr(item.createdAt);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleOverlay = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return createPortal(
    <div
      className="ndm-overlay overlay-base"
      onClick={handleOverlay}
    >
      <div className="sheet-base flex-col" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div className="flex-between" style={{ padding: '24px 16px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {tag || 'Новость'}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button 
            className="btn-reset flex-center" 
            onClick={onClose}
            style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>

        {/* ── Image (if available) ── */}
        {item.imageUrl ? (
          <>
            <div
              style={{
                borderRadius: 24,
                border: '2px solid #1E293B',
                overflow: 'hidden',
                marginBottom: 20,
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{
                  width: '100%',
                  height: 'clamp(200px, 51vw, 280px)',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Fallback gradient banner when no image */}
            <div
              className="flex-center"
              style={{
                borderRadius: 24,
                border: '2px solid #1E293B',
                overflow: 'hidden',
                height: 'clamp(200px, 51vw, 280px)',
                marginBottom: 20,
                background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}44)`,
              }}
            >
              <span
                className="icon-material"
                style={{
                  fontSize: 'clamp(48px, 12.3vw, 68px)',
                  color: categoryColor,
                  fontVariationSettings: "'FILL' 1",
                  opacity: 0.4,
                }}
              >
                article
              </span>
            </div>
          </>
        )}

        {/* ── Title ── */}
        <h2
          style={{
            fontSize: 'clamp(22px, 5.6vw, 32px)',
            fontWeight: 800,
            color: '#1E293B',
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </h2>

        {/* ── Date + Category tag row ── */}
        <div className="flex-between" style={{ marginBottom: 8 }}>
          {dateStr ? (
            <span style={{ fontSize: 'clamp(13px, 3.3vw, 18px)', fontWeight: 500, color: '#64748B' }}>
              {dateStr}
            </span>
          ) : (
            <span />
          )}
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 8,
              backgroundColor: categoryColor,
              fontSize: 'clamp(11px, 2.8vw, 15px)',
              fontWeight: 700,
              color: '#FFF',
            }}
          >
            {tag}
          </span>
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            height: 1,
            backgroundColor: '#E2E8F0',
            marginBottom: 8,
          }}
        />

        {/* ── Full content ── */}
        {item.content && (
          <p
            style={{
              fontSize: 'clamp(15px, 3.8vw, 21px)',
              color: '#1E293B',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {item.content}
          </p>
        )}

        {/* ── Bottom spacing ── */}
        <div style={{ height: 16 }} />
        </div>
      </div>
    </div>,
    document.body
  );
}
