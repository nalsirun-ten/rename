import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../i18n/useT';
import { getInstallPrompt, promptInstall, subscribeInstallPrompt } from '../lib/pwaInstall';

type View = 'none' | 'android' | 'ios';

export default function InstallPwaBanner({ activeTab }: { activeTab?: number }) {
  const t = useT();
  const [view, setView] = useState<View>('none');
  const [hasPrompt, setHasPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa_banner_dismissed') === 'true');

  // iOS needs the `muted` DOM *property* (not just the attribute) for inline
  // autoplay — set it via a callback ref so the demo video plays silently.
  const setVideoRef = (el: HTMLVideoElement | null) => {
    if (el) { el.muted = true; el.defaultMuted = true; }
  };

  useEffect(() => {
    // Already installed as PWA → never show
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Best-effort: this browser already installed the app → don't nag again.
    try {
      if (localStorage.getItem('pwa_installed') === 'true') return;
    } catch { /* ignore */ }

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    // "Add to Home Screen" only exists in REAL mobile Safari. Real Safari carries
    // both a "Version/" and a "Safari" token; in-app WebViews (Instagram, Telegram,
    // etc.) and other iOS browsers (Chrome=CriOS, Firefox=FxiOS…) do not.
    const isRealSafari = /safari/i.test(ua) && /version\//i.test(ua)
      && !/crios|fxios|edgios|opios|gsa\//i.test(ua);

    if (isIos) {
      // Per request: the iOS install onboarding shows ONLY on iPhone + Safari,
      // because that's the only place the manual flow actually works.
      if (!isRealSafari) return;
      setView('ios');
      const tm = setTimeout(() => setVisible(true), 700); // small delay for polish
      return () => clearTimeout(tm);
    }

    // Android / desktop: top bar with the native install button (captured globally).
    setView('android');
    setVisible(true);
    setHasPrompt(!!getInstallPrompt());
    return subscribeInstallPrompt(() => setHasPrompt(!!getInstallPrompt()));
  }, []);

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (activeTab !== 0 || dismissed || !visible || view === 'none') return null;

  // ─────────────────────────── iPhone + Safari: full onboarding ───────────────
  if (view === 'ios') {
    const steps: { icon: string; text: string }[] = [
      { icon: 'ios_share', text: t('pwa_ios_onb_step1') },
      { icon: 'add_to_home_screen', text: t('pwa_ios_onb_step2') },
      { icon: 'check_circle', text: t('pwa_ios_onb_step3') },
    ];

    return createPortal(
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        <style>{`@keyframes gcArrowBounce{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(10px);opacity:1}}`}</style>

        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: '28px 22px 24px 22px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            position: 'relative',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Close */}
          <button
            className="btn-reset"
            onClick={handleDismiss}
            aria-label={t('close')}
            style={{
              position: 'absolute', top: 14, right: 14, width: 32, height: 32,
              borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="icon-material" style={{ fontSize: 20 }}>close</span>
          </button>

          {/* App icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <img
              src="/icons/icon-192x192.png"
              alt="Green Chicken"
              style={{ width: 76, height: 76, borderRadius: 20, boxShadow: '0 8px 20px rgba(27,94,61,0.28)' }}
            />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', textAlign: 'center', margin: '0 0 8px 0' }}>
            {t('pwa_ios_onb_title')}
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 1.5, margin: '0 0 22px 0' }}>
            {t('pwa_ios_onb_subtitle')}
          </p>

          {/* Hero: a short looping demo video of the install flow. Falls back to
              the written steps if the file is missing or fails to load. */}
          {!videoFailed ? (
            <div style={{ borderRadius: 18, overflow: 'hidden', backgroundColor: '#000', marginBottom: 22 }}>
              <video
                ref={setVideoRef}
                src="/onboarding/ios_install.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setVideoFailed(true)}
                style={{ width: '100%', maxHeight: 'min(46vh, 380px)', objectFit: 'contain', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    backgroundColor: '#ECFDF3', color: '#16A34A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}>
                    <span className="icon-material" style={{ fontSize: 24 }}>{s.icon}</span>
                    <div style={{
                      position: 'absolute', top: -6, left: -6, width: 20, height: 20, borderRadius: '50%',
                      backgroundColor: '#1B5E3D', color: '#FFF', fontSize: 11, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', lineHeight: 1.35 }}>{s.text}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-reset"
            onClick={handleDismiss}
            style={{
              width: '100%', padding: 16, borderRadius: 16,
              backgroundColor: '#1B5E3D', color: '#FFF', fontSize: 16, fontWeight: 700,
            }}
          >
            {t('pwa_ios_onb_cta')}
          </button>
        </div>

        {/* Animated pointer to Safari's Share button in the bottom toolbar */}
        <div style={{
          position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          pointerEvents: 'none', color: '#FFFFFF',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {t('pwa_ios_onb_share_hint')}
          </span>
          <span className="icon-material" style={{ fontSize: 30, animation: 'gcArrowBounce 1.2s ease-in-out infinite', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            keyboard_double_arrow_down
          </span>
        </div>
      </div>,
      document.body
    );
  }

  // ─────────────────────────── Android / desktop: top bar ─────────────────────
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
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
            {hasPrompt ? t('pwa_android_instruction') : t('pwa_install_via_menu')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {hasPrompt && (
          <button
            className="btn-reset"
            onClick={handleInstall}
            style={{
              backgroundColor: '#FFF',
              color: '#1B5E3D',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('pwa_install')}
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
