import React, { useCallback } from 'react';
import { type MenuItem } from '../stores/menu';
import { useCartStore } from '../stores/cart';
import { useT } from '../i18n/useT';
import { thumbnailUrl } from '../utils/imageUrl';

interface Props {
  item: MenuItem;
}

const MenuCard = React.memo(function MenuCard({ item }: Props) {
  const t = useT();
  // Subscribe ONLY to this item's cart state — avoids re-rendering all cards when one changes
  const cartEntry = useCartStore(s => s.items.find(ci => ci.id === item.id));
  const isInCart = !!cartEntry;
  const cartQuantity = cartEntry?.quantity || 0;

  const handleCartAction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const { addItem, incrementQuantity } = useCartStore.getState();
    if (isInCart) {
      incrementQuantity(item.id);
    } else {
      addItem({ id: item.id, title: item.title, price: item.price, imageUrl: item.imageUrl });
    }
  }, [item.id, item.title, item.price, item.imageUrl, isInCart]);

  const thumb = thumbnailUrl(item.imageUrl, 400);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '3px 4px 10px rgba(0,0,0,0.08)',
      border: '1.5px solid #94A3B8',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
      }}>
        <img
          src={thumb}
          alt={item.title}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Cart quantity badge */}
        {isInCart && (
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: '#1B5E3D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>{cartQuantity}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: '10px 10px 12px 10px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {/* Title */}
        <h3 style={{
          fontSize: 'clamp(12px, 3.2rem, 15px)',
          fontWeight: 600,
          color: '#0F172A',
          margin: 0,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 'clamp(10px, 2.6rem, 13px)',
          fontWeight: 400,
          color: '#64748B',
          margin: 0,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}>
          {item.description}
        </p>

        {/* Footer: Price + Add to cart */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 }}>
          <div style={{ fontSize: 'clamp(13px, 3.4rem, 17px)', fontWeight: 700, color: '#0F172A' }}>
            {item.price} <span style={{ fontSize: 'clamp(10px, 2.6rem, 12px)', fontWeight: 600, color: '#64748B' }}>{t('som')}</span>
          </div>
          <button
            className="btn-reset flex-center"
            onClick={handleCartAction}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: isInCart ? '#1B5E3D' : '#F1F5F9',
              transition: 'all 0.15s',
              border: isInCart ? 'none' : '1px solid #E2E8F0',
            }}
          >
            <span className="icon-material" style={{
              fontSize: 18,
              color: isInCart ? '#FFF' : '#64748B',
            }}>
              {isInCart ? 'shopping_cart' : 'add_shopping_cart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default MenuCard;
