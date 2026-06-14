// Early, global capture of the Android "Add to home screen" prompt.
//
// Chrome fires `beforeinstallprompt` shortly after load — frequently BEFORE
// React has mounted. A listener added inside a component effect can miss it
// entirely, which left the install button stuck on a "..." placeholder.
// Registering at module load (this file is imported first in main.tsx) makes
// sure the event is always caught, and components subscribe to read it.

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Stop Chrome's own mini-infobar; we surface our own banner instead.
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    // Breadcrumb for this browser — useful if we ever want to stop nagging a
    // user who already installed from here. Safe no-op otherwise.
    try { localStorage.setItem('pwa_installed', 'true'); } catch { /* ignore */ }
    emit();
  });
}

/** The captured install event, or null if it hasn't fired / isn't available. */
export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

/** Show the native install dialog. Returns the outcome (or 'unavailable'). */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // A prompt can only be used once.
  deferredPrompt = null;
  emit();
  return outcome;
}

/** Subscribe to availability changes; returns an unsubscribe function. */
export function subscribeInstallPrompt(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
