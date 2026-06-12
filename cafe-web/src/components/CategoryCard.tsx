import React from 'react';
import { useT } from '../i18n/useT';

interface Props {
  name: string;
  count: number;
  emoji: string;
  color: string;
  imageUrl?: string;
  imageSize?: number;
  onClick: () => void;
}

const CategoryCard = React.memo(function CategoryCard({ name, count, emoji, imageUrl, imageSize = 180, color, onClick }: Props) {
  const t = useT();
  const imgSize = imageSize;
  const offset = Math.round(imgSize * 0.22);
  return (
    <button
      className="btn-reset"
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        height: 120,
        backgroundColor: color,
        borderRadius: 16,
        border: '1.5px solid #94A3B8',
        boxShadow: '3px 4px 10px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.15s',
        textAlign: 'left',
        flexShrink: 0,
        overflow: 'hidden',
      }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      {/* ── Text Container (Top Left) ── */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2, right: imageUrl ? imgSize * 0.55 : 80 }}>
        <div style={{
          fontSize: 'clamp(24px, 5.4rem, 30px)',
          fontWeight: 800,
          color: '#000000',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 'clamp(17px, 4.2rem, 21px)',
          fontWeight: 600,
          color: '#FFFFFF',
        }}>
          {count} {t('items_count')}
        </div>
      </div>

      {/* ── Image / Emoji Overlay (Bottom Right) ── */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          style={{
            position: 'absolute',
            bottom: -offset,
            right: -Math.round(offset * 0.75),
            width: imgSize,
            height: imgSize,
            objectFit: 'contain',
            zIndex: 1,
          }}
        />
      ) : (
        <div style={{
          position: 'absolute',
          bottom: -5,
          right: 0,
          fontSize: 'clamp(64px, 15vw, 84px)',
          lineHeight: 1,
          zIndex: 1,
          transform: 'rotate(-5deg)',
        }}>
          {emoji}
        </div>
      )}
    </button>
  );
});

export default CategoryCard;
