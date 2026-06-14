import React, { useCallback } from 'react';
import { type MenuItem } from '../stores/menu';
import { useCartStore } from '../stores/cart';
import { useT } from '../i18n/useT';
import { thumbnailUrl } from '../utils/imageUrl';

interface Props {
  item: MenuItem;
  onSelectVariants?: (item: MenuItem) => void;
  onClick?: (item: MenuItem) => void;
}

const MenuCard = React.memo(function MenuCard({ item, onSelectVariants, onClick }: Props) {
  const t = useT();
  // Sum up all variants of this item in the cart.
  // The selector must return a primitive — returning a fresh array
  // (e.g. items.filter(...)) makes zustand v5 re-render in a loop.
  const cartQuantity = useCartStore(s =>
    s.items.reduce((acc, ci) => (ci.id === item.id ? acc + ci.quantity : acc), 0)
  );
  const isInCart = cartQuantity > 0;
  const hasVariants = item.variants && item.variants.length > 0;

  const handleDecrement = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const { items: cartItems, decrementQuantity, removeItem } = useCartStore.getState();
    const existing = cartItems.find(ci => ci.id === item.id);
    if (existing) {
      if (existing.quantity > 1) {
        decrementQuantity(existing.cartItemId);
      } else {
        removeItem(existing.cartItemId);
      }
    }
  }, [item.id]);

  const handleIncrement = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVariants && onSelectVariants) {
      onSelectVariants(item);
      return;
    }
    const { items: cartItems, addItem, incrementQuantity } = useCartStore.getState();
    const existing = cartItems.find(ci => ci.id === item.id);
    if (existing) {
      incrementQuantity(existing.cartItemId);
    } else {
      addItem({ id: item.id, title: item.title, price: item.price, imageUrl: item.imageUrl });
    }
  }, [item, hasVariants, onSelectVariants]);

  const thumb = thumbnailUrl(item.imageUrl, 400);

  return (
    <div 
      onClick={() => onClick?.(item)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '3px 4px 10px rgba(0,0,0,0.08)',
        border: '1.5px solid #94A3B8',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        backgroundColor: item.imageUrl ? '#F1F5F9' : '#1B5E3D',
      }}>
        {item.imageUrl ? (
          <img
            src={thumb}
            alt={item.title}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
              {item.title}
            </span>
          </div>
        )}
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
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          {isInCart && !hasVariants ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F1F5F9',
                borderRadius: 12,
                padding: '4px',
                height: 44,
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn-reset flex-center"
                onClick={handleDecrement}
                style={{
                  width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#0F172A',
                }}
              >
                <span className="icon-material" style={{ fontSize: 20 }}>remove</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                  {cartQuantity}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', lineHeight: 1.1, marginTop: 2 }}>
                  {item.price * cartQuantity} с
                </span>
              </div>
              <button
                className="btn-reset flex-center"
                onClick={handleIncrement}
                style={{
                  width: 36, height: 36, borderRadius: 10, backgroundColor: '#1B5E3D', color: '#FFFFFF',
                }}
              >
                <span className="icon-material" style={{ fontSize: 20 }}>add</span>
              </button>
            </div>
          ) : (
            <button
              className="btn-reset flex-center"
              onClick={handleIncrement}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 12,
                backgroundColor: '#1B5E3D',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              <span>
                {hasVariants && <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, marginRight: 2 }}>от</span>}
                {item.price} <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.8 }}>{t('som')}</span>
              </span>
              <span className="icon-material" style={{ fontSize: 20, opacity: 0.8 }}>
                {hasVariants && isInCart ? 'shopping_cart' : 'add'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default MenuCard;
