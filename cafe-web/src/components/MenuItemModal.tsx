import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useT } from '../i18n/useT';
import type { MenuItem } from '../stores/menu';
import { useCartStore } from '../stores/cart';
import { thumbnailUrl } from '../utils/imageUrl';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSelectVariants?: (item: MenuItem) => void;
}

export default function MenuItemModal({ isOpen, onClose, item, onSelectVariants }: Props) {
  const t = useT();

  const [isDescExpanded, setIsDescExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsDescExpanded(false);
    }
  }, [isOpen, item?.id]);

  const cartQuantity = useCartStore(s =>
    s.items.reduce((acc, ci) => (item && ci.id === item.id ? acc + ci.quantity : acc), 0)
  );
  const isInCart = cartQuantity > 0;
  const hasVariants = item?.variants && item.variants.length > 0;

  useLockBodyScroll(isOpen);
  const handleOverlay = useOverlayClose(onClose, isOpen);
  const sheetRef = useSwipeToClose(onClose);
  useHardwareBack(onClose, isOpen);

  if (!isOpen || !item) return null;

  const handleDecrement = (e: React.MouseEvent) => {
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
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasVariants && onSelectVariants) {
      onClose(); // close this modal
      onSelectVariants(item); // open variants sheet
      return;
    }
    const { items: cartItems, addItem, incrementQuantity } = useCartStore.getState();
    const existing = cartItems.find(ci => ci.id === item.id);
    if (existing) {
      incrementQuantity(existing.cartItemId);
    } else {
      addItem({ id: item.id, title: item.title, price: item.price, imageUrl: item.imageUrl });
    }
  };

  const thumb = thumbnailUrl(item.imageUrl, 800);

  return createPortal(
    <div onClick={handleOverlay} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease-out forwards',
        }}
      />

      <div ref={sheetRef} className="rs-sheet" style={{
        position: 'relative',
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overscrollBehavior: 'none',
      }}>
        {/* Drag handle */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, zIndex: 12
        }} />

        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="btn-reset flex-center"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            color: '#FFFFFF',
            zIndex: 12,
          }}
        >
          <span className="icon-material" style={{ fontSize: 20 }}>close</span>
        </button>

        <div>
          {item.imageUrl ? (
            <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#F1F5F9' }}>
              <img src={thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#1B5E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
               <span style={{ fontSize: 24, fontWeight: 700, color: '#FFF', textAlign: 'center' }}>{item.title}</span>
            </div>
          )}

          <div style={{ padding: '12px 10px' }}>
            <h2 style={{ 
              fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4,
              display: isDescExpanded ? 'block' : '-webkit-box',
              WebkitLineClamp: isDescExpanded ? 'unset' : 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{item.title}</h2>
            <div style={{ position: 'relative' }}>
              <p style={{ 
                fontSize: 12, color: '#64748B', lineHeight: 1.3, whiteSpace: 'pre-wrap',
                display: isDescExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: isDescExpanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.description}
              </p>
              {item.description && (item.description.length > 95 || item.description.split('\\n').length > 2) && !isDescExpanded && (
                <button 
                  className="btn-reset"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescExpanded(true);
                  }}
                  style={{ 
                    color: '#16A34A', fontSize: 12, fontWeight: 600, marginTop: 4 
                  }}
                >
                  Прочитать полностью
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div style={{
          position: 'sticky',
          bottom: 0, left: 0, right: 0,
          backgroundColor: '#FFF',
          padding: '16px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          borderTop: '1px solid #E2E8F0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
        }}>
          {isInCart && !hasVariants ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F1F5F9',
                borderRadius: 16,
                padding: '6px',
                height: 56,
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn-reset flex-center"
                onClick={handleDecrement}
                style={{
                  width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#0F172A',
                }}
              >
                <span className="icon-material" style={{ fontSize: 24 }}>remove</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                  {cartQuantity}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', lineHeight: 1.1, marginTop: 2 }}>
                  {item.price * cartQuantity} с
                </span>
              </div>
              <button
                className="btn-reset flex-center"
                onClick={handleIncrement}
                style={{
                  width: 44, height: 44, borderRadius: 12, backgroundColor: '#1B5E3D', color: '#FFFFFF',
                }}
              >
                <span className="icon-material" style={{ fontSize: 24 }}>add</span>
              </button>
            </div>
          ) : (
            <button
              className="btn-reset flex-center"
              onClick={handleIncrement}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 16,
                backgroundColor: '#1B5E3D',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 18,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              <span>
                {hasVariants && <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8, marginRight: 2 }}>от</span>}
                {item.price} <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>{t('som')}</span>
              </span>
              <span className="icon-material" style={{ fontSize: 24, opacity: 0.8 }}>
                {hasVariants && isInCart ? 'shopping_cart' : 'add'}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
