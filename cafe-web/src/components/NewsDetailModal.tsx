// ─── NewsDetailModal – full detail view for a news item ──────────────
// Flutter: news_detail_modal.dart
//   - Image (CachedNetworkImage with 24px border radius, 2px border, 200px height)
//   - Title (22px w800) + date + category tag row
//   - Divider + full content text (15px, line-height 1.6)

import { useEffect, useCallback } from 'react';
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

  return (
    <div
      className="ndm-overlay overlay-base"
      onClick={handleOverlay}
    >
      <div
        className="ndm-sheet sheet-base"
        style={{ maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
      >
        <div className="drag-handle" />

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
                  height: 200,
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
                height: 200,
                marginBottom: 20,
                background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}44)`,
              }}
            >
              <span
                className="icon-material"
                style={{
                  fontSize: 48,
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
            fontSize: 22,
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
            <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>
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
              fontSize: 11,
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
              fontSize: 15,
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
  );
}
