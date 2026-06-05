import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmLogoutModal({ onClose, onConfirm }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div 
        ref={sheetRef}
        className="rs-sheet sheet-base flex-col" 
        style={{ 
          backgroundColor: '#FCFBFA',
          padding: '24px 16px 32px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', margin: '0 0 12px 0' }}>
            {t('logout_title')}
          </h2>
          <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', color: '#64748B', margin: 0 }}>
            {t('logout_confirm')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button 
            className="btn-reset flex-center"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 16,
              backgroundColor: '#F1F5F9',
              color: '#475569',
              fontSize: 'clamp(16px, 4rem, 22px)',
              fontWeight: 600,
            }}
          >
            {t('cancel')}
          </button>
          <button 
            className="btn-reset flex-center"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 16,
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: 'clamp(16px, 4rem, 22px)',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            {t('logout_btn')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
