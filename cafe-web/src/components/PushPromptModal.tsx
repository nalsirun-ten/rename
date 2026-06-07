import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../i18n/useT';
import { useProfileStore } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { VAPID_KEY } from '../lib/firebase';

export default function PushPromptModal() {
  const t = useT();
  const [isVisible, setIsVisible] = useState(false);
  const { isOnboarded, isLoading } = useProfileStore();

  useEffect(() => {
    // Check if we should show the prompt
    // 1. Must be standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    
    // 2. Check if we prompted before
    let hasPrompted = localStorage.getItem('hasPromptedPush');
    
    // 3. Notification permission should be 'default' (meaning we can ask)
    // OR it is 'granted' but hasPrompted is null (meaning the token sync failed and we need a manual click to recover)
    const systemPermission = 'Notification' in window ? (Notification as any).permission : 'denied';
    const canAsk = systemPermission === 'default' || (systemPermission === 'granted' && !hasPrompted);

    // Recovery mechanism: if they got stuck (scrolled away from native prompt), hasPrompted might be 'true'
    // but the system permission is still 'default'. In this case, we clear it so they can be asked again.
    if (hasPrompted === 'true' && systemPermission === 'default') {
      hasPrompted = null;
      localStorage.removeItem('hasPromptedPush');
    }

    // Wait a bit after onboarding is complete so modals don't overlap aggressively
    if (isStandalone && !hasPrompted && canAsk && isOnboarded && !isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded, isLoading]);

  const handleClose = () => {
    localStorage.setItem('hasPromptedPush', 'declined');
    setIsVisible(false);
  };

  const handleEnable = async () => {
    try {
      await useProfileStore.getState().requestPushPermission(VAPID_KEY);
      const perm = (Notification as any).permission;
      if (perm === 'granted') {
        localStorage.setItem('hasPromptedPush', 'granted');
        localStorage.setItem('pushEnabled', 'true');
      } else if (perm === 'denied') {
        localStorage.setItem('hasPromptedPush', 'denied');
      } else {
        // perm is default - they dismissed the native prompt
        // Do not set hasPromptedPush so it will show again next time
        localStorage.removeItem('hasPromptedPush');
      }
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isVisible]);

  const handleOverlay = useOverlayClose(handleClose);
  const sheetRef = useSwipeToClose(handleClose);

  if (!isVisible) return null;

  return createPortal(
    <div className="rm-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div 
        ref={sheetRef} 
        className="rm-sheet sheet-base flex-col" 
        style={{ padding: '24px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        <div className="drag-handle" />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
             <span className="icon-material" style={{ fontSize: 40, color: '#3B82F6', fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
          </div>
          
          <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
            Включить уведомления?
          </h2>
          <p style={{ fontSize: 'clamp(15px, 3.8rem, 20px)', fontWeight: 500, color: '#64748B', lineHeight: 1.5, marginBottom: 32 }}>
            Получайте персональные предложения, скидки и уведомления о бесплатном кофе прямо на экран вашего телефона.
          </p>

          <button 
            className="btn-reset" 
            onClick={handleEnable}
            style={{ 
              width: '100%', padding: '16px', borderRadius: 16, 
              backgroundColor: '#1B5E3D', color: '#FFF', 
              fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700,
              marginBottom: 12
            }}
          >
            Включить
          </button>
          
          <button 
            className="btn-reset" 
            onClick={handleClose}
            style={{ 
              width: '100%', padding: '16px', borderRadius: 16, 
              backgroundColor: 'transparent', color: '#64748B', 
              fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700
            }}
          >
            Не сейчас
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
