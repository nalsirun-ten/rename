import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useT } from '../i18n/useT';
import type { MenuItem, ProductVariant } from '../stores/menu';
import { useCartStore } from '../stores/cart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

export default function VariantSelectSheet({ isOpen, onClose, item }: Props) {
  const t = useT();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const addItem = useCartStore(s => s.addItem);
  const sheetRef = useSwipeToClose(onClose);

  // Reset selection when a new item is opened
  React.useEffect(() => {
    if (isOpen && item?.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [isOpen, item]);

  useHardwareBack(onClose, isOpen);

  if (!isOpen) return null;
  if (!item) return null;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      id: item.id,
      title: item.title,
      price: selectedVariant.price,
      imageUrl: item.imageUrl,
      variantName: selectedVariant.name,
    });
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: isOpen ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease-out forwards',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="swipe-sheet"
        style={{
          position: 'relative',
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '24px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2 }} />

        {/* Title */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, marginTop: 4 }}>
          {item.title}
        </h2>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
          Выберите вариант перед добавлением в корзину
        </p>

        {/* Variants list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {item.variants?.map((v, i) => (
            <button
              key={i}
              className="btn-reset"
              onClick={() => setSelectedVariant(v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#FFF',
                border: selectedVariant?.name === v.name ? '2px solid #1B5E3D' : '1.5px solid #E2E8F0',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>{v.name}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1B5E3D' }}>{v.price} с.</span>
            </button>
          ))}
        </div>

        {/* Action button */}
        <button
          className="btn-reset"
          onClick={handleAdd}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#1B5E3D',
            color: '#FFF',
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 600,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(27, 94, 61, 0.2)',
          }}
        >
          {t('add_to_cart')}
        </button>
      </div>
    </div>,
    document.body
  );
}
