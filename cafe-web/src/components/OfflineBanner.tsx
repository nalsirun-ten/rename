import { useState, useEffect, useCallback } from 'react';
import { useT } from '../i18n/useT';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const t = useT();

  const handleOnline = useCallback(() => setIsOffline(false), []);
  const handleOffline = useCallback(() => setIsOffline(true), []);

  useEffect(() => {
    if (!navigator.onLine) setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#EF4444',
        color: '#FFF',
        textAlign: 'center',
        padding: '8px 16px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        fontSize: 'clamp(13px, 3.3rem, 16px)',
        fontWeight: 600,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <span
        className="icon-material"
        style={{ fontSize: 'clamp(14px, 3.6rem, 18px)', marginRight: 6, verticalAlign: 'middle' }}
      >
        wifi_off
      </span>
      {t('offline')}
    </div>
  );
}
