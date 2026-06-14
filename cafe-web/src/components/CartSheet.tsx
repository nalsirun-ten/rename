import React from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '../stores/cart';
import { useT } from '../i18n/useT';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { thumbnailUrl } from '../utils/imageUrl';
import CartUpsell from './CartUpsell';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartSheet = React.memo(function CartSheet({ isOpen, onClose, onCheckout }: Props) {
  const t = useT();
  const { items, removeItem, incrementQuantity, decrementQuantity, clearCart, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  useLockBodyScroll(isOpen);
  useOverlayClose(onClose, isOpen);
  const sheetRef = useSwipeToClose(onClose);
  useHardwareBack(onClose, isOpen);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="rs-sheet"
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 12px 20px' }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            {t('cart_title')}
          </h2>
          {items.length > 0 && (
            <button
              className="btn-reset"
              onClick={clearCart}
              style={{ fontSize: 13, color: '#EF4444', fontWeight: 600, padding: '4px 8px' }}
            >
              {t('cart_clear')}
            </button>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
              <span className="icon-material" style={{ fontSize: 48, marginBottom: 12 }}>shopping_bag</span>
              <p style={{ fontSize: 15, fontWeight: 500 }}>{t('cart_empty')}</p>
            </div>
          ) : (
            <>
            {items.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                {/* Image — fall back to a green name tile (same as MenuCard) when
                    the item has no image, so items without a photo render
                    consistently instead of a broken <img>. */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: item.imageUrl ? '#F1F5F9' : '#1B5E3D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.imageUrl ? (
                    <img
                      src={thumbnailUrl(item.imageUrl, 200)}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      textAlign: 'center',
                      lineHeight: 1.15,
                      padding: 3,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.title}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title} {item.variantName ? <span style={{ color: '#64748B', fontWeight: 500 }}>({item.variantName})</span> : null}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    {item.price * item.quantity} {t('som')}
                  </div>
                </div>

                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button
                    className="btn-reset flex-center"
                    onClick={() => decrementQuantity(item.cartItemId)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: '#F1F5F9',
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#64748B',
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', minWidth: 20, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    className="btn-reset flex-center"
                    onClick={() => incrementQuantity(item.cartItemId)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: '#1B5E3D',
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#FFF',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  className="btn-reset"
                  onClick={() => removeItem(item.cartItemId)}
                  style={{ padding: 4 }}
                >
                  <span className="icon-material" style={{ fontSize: 20, color: '#EF4444' }}>
                    delete_outline
                  </span>
                </button>
              </div>
            ))}
            {/* Smart add-ons at the very bottom — scrolls with the cart list */}
            <CartUpsell />
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 20px 0 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1.5px solid #94A3B8',
            boxShadow: '0 -12px 32px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#64748B' }}>{t('cart_total')}</span>
              <span style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', fontWeight: 700, color: '#1E293B' }}>
                {total} {t('som')}
              </span>
            </div>
            <button
              className="btn-reset"
              onClick={() => {
                onClose();
                onCheckout();
              }}
              style={{
                width: '100%',
                padding: '16px 24px',
                backgroundColor: '#1B5E3D',
                borderRadius: 16,
                color: '#FFF',
                fontSize: 'clamp(16px, 4rem, 22px)',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              {t('cart_order')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

export default CartSheet;
