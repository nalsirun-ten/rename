import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
}

export default function AboutDeveloperModal({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{ backgroundColor: '#FCFBFA', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('about_dev_title')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button 
            onClick={onClose}
            className="btn-reset flex-center"
            style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#0F172A', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {/* Logo & Text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div className="flex-center" style={{
            width: 'clamp(80px, 20.5rem, 112px)', height: 'clamp(80px, 20.5rem, 112px)', borderRadius: 24, backgroundColor: '#6366F1', marginBottom: 16,
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
          }}>
            <span className="icon-material" style={{ fontSize: 'clamp(40px, 10.2rem, 56px)', color: '#FFF' }}>code</span>
          </div>
          <h3 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
            {t('about_dev_heading')}
          </h3>
          <p style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 500, color: '#64748B', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>
            {t('about_dev_text')}
          </p>
        </div>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#94A3B8', marginRight: 12 }}>language</span>
              <span style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 500, color: '#64748B' }}>{t('about_dev_portfolio')}</span>
            </div>
            <a href="https://example.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 600, color: '#3B82F6', textDecoration: 'none' }}>mysite.com</a>
          </div>
          
          {/* Row 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#94A3B8', marginRight: 12 }}>send</span>
              <span style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 500, color: '#64748B' }}>Telegram</span>
            </div>
            <a href="https://t.me/example" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 600, color: '#3B82F6', textDecoration: 'none' }}>@username</a>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#94A3B8', marginRight: 12 }}>mail</span>
              <span style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 500, color: '#64748B' }}>Email</span>
            </div>
            <a href="mailto:example@example.com" style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 600, color: '#1E293B', textDecoration: 'none' }}>email@example.com</a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 'clamp(13px, 3.3rem, 18px)', fontWeight: 500, color: '#CBD5E1' }}>
          © 2024-2026 Green Chicken
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
