import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSettingsStore } from '../stores/settings';
import { useEffect } from 'react';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
}

export default function InstagramModal({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { get, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  const handleGo = () => {
    const url = get('instagram_url');
    if (url) {
      if ((window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    onClose();
  };

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base flex-col" style={{ padding: '24px 16px 40px', alignItems: 'center' }}>
        <div style={{ width: 'clamp(64px, 20.5rem, 110px)', height: 'clamp(64px, 20.5rem, 110px)', borderRadius: 'clamp(20px, 6rem, 32px)', background: 'linear-gradient(to bottom right, #A144E5, #D82B7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'clamp(19px, 6rem, 32px)', boxShadow: '0 8px 16px rgba(161, 68, 229, 0.3)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: 'clamp(32px, 10.2rem, 56px)', height: 'clamp(32px, 10.2rem, 56px)' }} fill="#FFF"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
        </div>
        <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 12, textAlign: 'center' }}>{t('instagram_go')}</h2>
        <p style={{ fontSize: 'clamp(15px, 3.8rem, 18px)', color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
          {t('instagram_redirect')}
        </p>

        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button className="btn-reset" onClick={onClose} style={{ flex: 1, padding: '16px 0', borderRadius: 24, backgroundColor: '#E2E8F0', color: '#1E293B', fontSize: 'clamp(16px, 4rem, 18px)', fontWeight: 700 }}>{t('cancel')}</button>
          <button className="btn-reset" onClick={handleGo} style={{ flex: 1, padding: '16px 0', borderRadius: 24, background: 'linear-gradient(to bottom right, #A144E5, #D82B7E)', color: '#FFF', fontSize: 'clamp(16px, 4rem, 18px)', fontWeight: 700 }}>{t('instagram_go_btn')}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
