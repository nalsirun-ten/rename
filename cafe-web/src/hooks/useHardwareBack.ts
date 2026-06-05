import { useEffect, useRef, useId } from 'react';

const modalStack: string[] = [];
let pendingBacks = 0;

window.addEventListener('popstate', (e: PopStateEvent) => {
  if (pendingBacks > 0) {
    pendingBacks--;
    (e as any)._ignoredByApp = true;
  }
});

const isIOS = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export function useHardwareBack(onClose: () => void, isActive: boolean = true) {
  const isPoppedRef = useRef(false);
  const id = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Disable on iOS: iOS has no hardware back button, and pushing history
    // enables Safari's edge-swipe-to-go-back gesture, which breaks horizontal carousels.
    if (!isActive || isIOS()) return;

    let timeoutId: number | null = null;
    let isMounted = true;

    const attemptPush = () => {
      if (!isMounted) return;
      if (pendingBacks > 0) {
        timeoutId = window.setTimeout(attemptPush, 50);
        return;
      }
      
      isPoppedRef.current = false;
      modalStack.push(id);
      const safeId = id.replace(/[^a-zA-Z0-9]/g, '');
      window.history.pushState({ modalId: id }, '', window.location.pathname + window.location.search + '#modal-' + safeId);
    };

    attemptPush();

    const handlePopState = (e: PopStateEvent) => {
      if ((e as any)._ignoredByApp) return;

      // Only the top-most modal should close when hardware back is pressed
      if (modalStack[modalStack.length - 1] === id) {
        isPoppedRef.current = true;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      
      window.removeEventListener('popstate', handlePopState);
      const idx = modalStack.indexOf(id);
      let wasPushed = false;
      if (idx !== -1) {
        modalStack.splice(idx, 1);
        wasPushed = true;
      }
      
      // If we pushed state, and it wasn't popped by the user pressing back, we must clean it up
      if (wasPushed && !isPoppedRef.current) {
        pendingBacks++;
        window.history.back();
        // Failsafe in case popstate never fires (e.g. rapid unmounts)
        setTimeout(() => {
          if (pendingBacks > 0) pendingBacks--;
        }, 400);
      }
    };
  }, [id, isActive]);
}
