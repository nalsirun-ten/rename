import { useEffect } from 'react';

/** Locks body scroll while a modal is open. Replaces duplicated useEffect in 15+ modals. */
export function useLockBodyScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [enabled]);
}
