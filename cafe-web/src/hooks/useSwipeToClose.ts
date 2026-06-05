import { useRef, useEffect, useCallback } from 'react';

const CLOSE_THRESHOLD = 100; // px to trigger close
const ANIM_DURATION = 300;   // ms — must match CSS transition

const APPEAR_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const APPEAR_DURATION = '0.35s';

export function useSwipeToClose(onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontalScroll = useRef(false);
  const isClosing = useRef(false); // block touches during close animation
  const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable callback ref — avoids rebinding event listeners on every render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const cleanup = useCallback(() => {
    const el = sheetRef.current;
    if (!el) return;
    isDragging.current = false;
    isHorizontalScroll.current = false;
    el.style.transition = `transform ${APPEAR_DURATION} ${APPEAR_EASING}`;
  }, []);

  const performClose = useCallback(() => {
    const el = sheetRef.current;
    if (!el || isClosing.current) return;
    isClosing.current = true;
    isDragging.current = false;

    el.style.transition = `transform ${ANIM_DURATION}ms ${APPEAR_EASING}`;
    el.style.transform = 'translateY(100%)';

    closingTimer.current = setTimeout(() => {
      onCloseRef.current();
      isClosing.current = false;
      closingTimer.current = null;
    }, ANIM_DURATION);
  }, []);

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Ignore touches during close animation
      if (isClosing.current) return;

      const target = e.target as HTMLElement;
      const scrollableParent = target.closest(
        '[style*="overflow-y: auto"], [style*="overflowY: auto"], [style*="overflow-y: scroll"], [style*="overflowY: scroll"], .overflow-y-auto'
      );

      if (scrollableParent && scrollableParent.scrollTop > 0) return;
      if (el.scrollTop > 0) return;

      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
      isDragging.current = true;
      isHorizontalScroll.current = false;
      el.style.transition = 'none';
      el.style.animation = 'none';
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      if (isHorizontalScroll.current) return;

      const currentX = e.touches[0].clientX;
      currentY.current = e.touches[0].clientY;

      const deltaX = currentX - startX.current;
      const deltaY = currentY.current - startY.current;

      // On first significant movement, check direction
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          isHorizontalScroll.current = true;
          isDragging.current = false;
          el.style.transition = `transform ${APPEAR_DURATION} ${APPEAR_EASING}`;
          el.style.transform = 'translateY(0)';
          return;
        }
      }

      if (deltaY > 0) {
        if (e.cancelable) e.preventDefault();
        el.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (isClosing.current) return;
      if (!isDragging.current) return;
      isDragging.current = false;

      const deltaY = currentY.current - startY.current;

      if (deltaY > CLOSE_THRESHOLD) {
        performClose();
      } else {
        el.style.transition = `transform ${APPEAR_DURATION} ${APPEAR_EASING}`;
        el.style.transform = 'translateY(0)';
        // We do NOT restore el.style.animation = '' here because the CSS appear animation 
        // has already finished anyway, and we don't want to re-trigger it.
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      // Clean up closing timer
      if (closingTimer.current) {
        clearTimeout(closingTimer.current);
        closingTimer.current = null;
      }
      isClosing.current = false;
    };
  }, [performClose]); // stable — onClose changes don't cause rebind

  return sheetRef;
}
