import { useEffect } from 'react';

// Hook kept for compatibility but no longer mutates theme-color
// to prevent the status bar from flashing white on bottom sheets.
export function useModalTheme(isOpen: boolean) {
  useEffect(() => {
    // No-op
  }, [isOpen]);
}
