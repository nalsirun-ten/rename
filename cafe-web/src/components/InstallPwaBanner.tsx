import React, { useEffect, useState } from 'react';
import { useT } from '../i18n/useT';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPwaBanner({ activeTab }: { activeTab?: number }) {
  const t = useT();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_banner_dismissed') === 'true');

  useEffect(() => {
    // Already installed as PWA → never show
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Opened in browser → always show the banner
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIosPrompt(isIos);
    setIsVisible(true);

    // Android: also listen for native install prompt to enable the button
    if (!isIos) {
      const onPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };
      window.addEventListener('beforeinstallprompt', onPrompt);
      return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Only on home tab, not dismissed, and visible
  if (activeTab !== 0 || !isVisible || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 'env(safe-area-inset-top, 0px)',
      left: 0,
      right: 0,
      maxWidth: 430,
      margin: '0 auto',
      backgroundColor: '#1B5E3D',
      color: '#FFF',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 99999,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <img
          src="/icons/icon-192x192.png"
          alt="App Icon"
          loading="lazy"
          style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Green Chicken</span>
          {isIosPrompt ? (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>
              {t('pwa_ios_tap')} <span className="icon-material" style={{ fontSize: 14, verticalAlign: 'middle', margin: '0 2px' }}>ios_share</span> <b>{t('pwa_ios_add')}</b>
            </span>
          ) : (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {t('pwa_android_instruction')}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {!isIosPrompt && (
          <button
            className="btn-reset"
            onClick={handleInstall}
            disabled={!deferredPrompt}
            style={{
              backgroundColor: deferredPrompt ? '#FFF' : 'rgba(255,255,255,0.4)',
              color: '#1B5E3D',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: deferredPrompt ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
            }}
          >
            {deferredPrompt ? t('pwa_install') : '...'}
          </button>
        )}
        <button
          className="btn-reset"
          onClick={handleDismiss}
          style={{ color: '#FFF', padding: 4 }}
          aria-label={t('close')}
        >
          <span className="icon-material" style={{ fontSize: 22 }}>close</span>
        </button>
      </div>
    </div>
  );
}
