import React from 'react';
import { type MenuItem, useMenuStore } from '../stores/menu';
import { useT } from '../i18n/useT';

interface Props {
  item: MenuItem;
}

const MenuCard = React.memo(function MenuCard({ item }: Props) {
  const t = useT();
  const toggleFavorite = useMenuStore((s) => s.toggleFavorite);

  return (
    <div style={{
      padding: '12px 0',
      margin: '0 12px',
      borderBottom: '1px solid #000000',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {/* Left: Image */}
      <div style={{
        flexShrink: 0,
        width: 'clamp(96px, 24.5rem, 140px)',
        height: 'clamp(96px, 24.5rem, 140px)',
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#E2E8F0',
      }}>
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Right: Content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        position: 'relative',
        paddingTop: 2,
        paddingBottom: 2,
      }}>
        <div style={{ paddingRight: 44 }}>
          {/* Title */}
          <h3 style={{
            fontSize: 'clamp(15px, 3.8rem, 21px)',
            fontWeight: 600,
            color: '#0F172A',
            marginBottom: 6,
            marginTop: -4,
            lineHeight: 1.2,
          }}>
            {item.title}
          </h3>
          
          {/* Description */}
          <p style={{
            fontSize: 'clamp(12px, 3.1rem, 16px)',
            fontWeight: 400,
            color: '#334155',
            marginBottom: 8,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.description}
          </p>
        </div>

        {/* Footer: Price & Calories */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingRight: 44 }}>
          <div style={{ fontSize: 'clamp(15px, 3.8rem, 20px)', fontWeight: 600, color: '#0F172A' }}>
            {item.price} <span style={{ fontSize: 'clamp(11px, 2.8rem, 14px)', fontWeight: 700, color: '#64748B', letterSpacing: 0.5 }}>{t('som')}</span>
          </div>
          {item.kcal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', color: '#3B82F6' }}>local_fire_department</span>
              <span style={{ fontSize: 'clamp(11px, 2.8rem, 14px)', fontWeight: 700, color: '#475569' }}>{item.kcal} {t('kcal_abbr')}</span>
            </div>
          )}
        </div>

        {/* Favorite Button (Absolute Top Right of the right container) */}
        <button
          className="btn-reset flex-center"
          onClick={() => toggleFavorite(item.id)}
          aria-label={item.isFavorite ? t('menu_favorite_remove') : t('menu_favorite_add')}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 'clamp(34px, 8.7rem, 48px)',
            height: 'clamp(34px, 8.7rem, 48px)',
            borderRadius: 12,
            border: item.isFavorite ? '1.5px solid #EF4444' : '1.5px solid transparent',
            backgroundColor: item.isFavorite ? '#EF4444' : '#EFF6FF',
            transition: 'all 0.2s',
          }}
        >
          <span className="icon-material" style={{
            fontSize: 'clamp(19px, 4.8rem, 26px)',
            color: item.isFavorite ? '#FFFFFF' : '#3B82F6',
            fontVariationSettings: item.isFavorite ? "'FILL' 1" : "'FILL' 0",
          }}>
            favorite
          </span>
        </button>
      </div>
    </div>
  );
});

// Custom comparison function if needed, but shallow compare on item is usually enough 
// if item references are stable. Wait, Zustand lists usually create new objects if nested 
// properties change, so React.memo works out of the box.
export default MenuCard;
