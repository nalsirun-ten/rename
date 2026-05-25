import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import QrCode from './QrCode';
import { useProfileStore } from '../stores/profile';

interface Props {
  onClose: () => void;
}

export default function QrModal({ onClose }: Props) {
  const { points } = useProfileStore();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlay = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return createPortal(
    <div className="overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div className="sheet-base flex-col" style={{ overflowY: 'auto', padding: '24px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)', alignItems: 'center' }}>
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 20, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              Мой QR-код
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
        <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#94A3B8', textAlign: 'center', lineHeight: 1.5, marginBottom: 32 }}>
          Для начисления или списания баллов<br />покажите этот экран администратору
        </p>

        <div style={{
          backgroundColor: '#FFF',
          borderRadius: 32,
          padding: '32px 16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%',
          maxWidth: 320,
        }}>
          <QrCode data="123456" size={220} iconSize={52} color="#000000" backgroundColor="#FFFFFF" />
          
          <div style={{ height: 32 }} />
          
          <span style={{ fontSize: 'clamp(28px, 7.1vw, 40px)', fontWeight: 700, letterSpacing: 5, color: '#1E293B' }}>
            123 456
          </span>
        </div>

        <div style={{ height: 32 }} />

        <span style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700, color: '#64748B' }}>
          Баланс: {points} баллов
        </span>
      </div>
    </div>,
    document.body
  );
}
