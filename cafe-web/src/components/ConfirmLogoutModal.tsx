import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ConfirmLogoutModal({ onClose, onConfirm }: Props) {
  const t = useT();
  const [isSigningOut, setIsSigningOut] = useState(false);
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
            disabled={isSigningOut}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 16,
              backgroundColor: '#F1F5F9',
              color: '#475569',
              fontSize: 'clamp(16px, 4rem, 22px)',
              fontWeight: 600,
              opacity: isSigningOut ? 0.6 : 1,
              cursor: isSigningOut ? 'default' : 'pointer',
            }}
          >
            {t('cancel')}
          </button>
          <button 
            className="btn-reset flex-center"
            onClick={async () => {
              if (isSigningOut) return;
              setIsSigningOut(true);
              try {
                await onConfirm();
              } catch (err) {
                console.error(err);
                setIsSigningOut(false);
              }
            }}
            disabled={isSigningOut}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 16,
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: 'clamp(16px, 4rem, 22px)',
              fontWeight: 600,
              boxShadow: isSigningOut ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
              opacity: isSigningOut ? 0.8 : 1,
              cursor: isSigningOut ? 'default' : 'pointer',
              display: 'flex',
              gap: 8,
            }}
          >
            {isSigningOut && (
              <div style={{ 
                width: 'clamp(14px, 3.6rem, 20px)', 
                height: 'clamp(14px, 3.6rem, 20px)', 
                borderRadius: '50%', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: '#FFF', 
                animation: 'rm-spin .6s linear infinite' 
              }} />
            )}
            {isSigningOut ? t('loading') : t('logout_btn')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
