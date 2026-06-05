import { createPortal } from 'react-dom';
import QrCode from './QrCode';
import { useProfileStore } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';


interface Props {
  onClose: () => void;
}

export default function QrModal({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { loyaltyNumber } = useProfileStore();
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base flex-col" style={{ overflowY: 'auto', padding: '24px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)', alignItems: 'center' }}>
        
        {/* Drag Handle */}
        <div style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 20, flexShrink: 0 }} />

        <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 30px)', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0', textAlign: 'center' }}>
          {t('qr_scan_code')}
        </h2>

        <p style={{ fontSize: 'clamp(14px, 3.6rem, 18px)', color: '#94A3B8', textAlign: 'center', lineHeight: 1.5, marginBottom: 24, maxWidth: 300, whiteSpace: 'pre-line' }}>
          {t('qr_show_admin')}
        </p>

        <div style={{
          backgroundColor: '#FFF',
          borderRadius: 'clamp(24px, 7.2rem, 34px)',
          padding: 'clamp(20px, 6.2rem, 28px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%',
          maxWidth: 'clamp(230px, 66.7rem, 310px)',
          marginBottom: 'clamp(20px, 6.2rem, 28px)'
        }}>
          <QrCode data={loyaltyNumber} size={180} iconSize={0} color="#000000" backgroundColor="#FFFFFF" />
          
          <div style={{ height: 16 }} />
          
          <span style={{ fontSize: 'clamp(24px, 6.1rem, 32px)', fontWeight: 700, letterSpacing: 5, color: '#1E293B' }}>
            {loyaltyNumber.substring(0, 3)} {loyaltyNumber.substring(3)}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
