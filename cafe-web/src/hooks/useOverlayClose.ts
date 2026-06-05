import { useCallback } from 'react';
import { useHardwareBack } from './useHardwareBack';

/** Returns a click handler that closes a modal only when clicking the backdrop overlay. */
export function useOverlayClose(onClose: () => void, isActive: boolean = true) {
  useHardwareBack(onClose, isActive);
  return useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);
}
