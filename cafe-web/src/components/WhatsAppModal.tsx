import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSettingsStore } from '../stores/settings';
import { useBranchesStore } from '../stores/branches';
import { useEffect } from 'react';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
}

export default function WhatsAppModal({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { get, fetchSettings } = useSettingsStore();
  const { branches, fetchBranches } = useBranchesStore();

  useEffect(() => {
    fetchSettings();
    fetchBranches();
  }, [fetchSettings, fetchBranches]);

  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  const handleGo = () => {
    const url = get('whatsapp_url');
    if (url) {
      if ((window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    onClose();
  };

  const handleBranchGo = (phone: string | undefined | null) => {
    if (!phone) return;
    const url = `https://wa.me/${phone.replace('+', '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base flex-col" style={{ backgroundColor: '#F9FAFC', padding: '0', maxHeight: '55vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="28" height="28" fill="#FFF"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 28px)', fontWeight: 600, color: '#1E293B', margin: 0 }}>WhatsApp</h2>
          </div>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
          {/* Main WhatsApp */}
          <button className="btn-reset" onClick={handleGo} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FEF9F5', borderRadius: 24, padding: 20, border: '2px solid transparent', width: '100%', marginBottom: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h4 style={{ fontSize: 'clamp(17px, 4.3rem, 20px)', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' }}>{t('whatsapp_support')}</h4>
              <p style={{ fontSize: 'clamp(14px, 3.6rem, 16px)', color: '#64748B', margin: 0 }}>{t('whatsapp_contact_main')}</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="icon-material" style={{ color: '#FFF', fontSize: 24 }}>chevron_right</span>
            </div>
          </button>

          <h3 style={{ fontSize: 'clamp(16px, 4rem, 18px)', fontWeight: 700, color: '#64748B', marginBottom: 12, paddingLeft: 8 }}>{t('whatsapp_contact_branch')}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {branches.map(b => (
              <button key={b.id} className="btn-reset" onClick={() => handleBranchGo('+79991234567' /* DB doesn't have per-branch phone right now, could use a fallback or add it */)} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FEF9F5', borderRadius: 24, padding: 16, border: '2px solid transparent', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', width: '100%' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: 'clamp(16px, 4rem, 18px)', fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>{b.title}</h4>
                  <p style={{ fontSize: 'clamp(13px, 3.3rem, 15px)', color: '#64748B', margin: 0 }}>{b.address}</p>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="icon-material" style={{ color: '#64748B', fontSize: 20 }}>chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
