import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
// Imported first so its beforeinstallprompt listener registers before React
// mounts — the event often fires before the install banner is rendered.
import './lib/pwaInstall';
import App from './App';
import './index.css';

// ─── Migrate stale localStorage to IndexedDB ────────────────────────
// menu + news data now live in IndexedDB (via idb-keyval).
// Remove old localStorage copies so they don't waste the 5 MB quota.
try {
  for (const key of ['cafe-menu-storage', 'cafe-news-storage', 'cafe-nav']) {
    localStorage.removeItem(key);
  }
} catch { /* ignore */ }


// ─── Prevent FOUT on Material Icons ─────────────────────────────────
// Hide icon text ("home", "store", etc.) until the icon font loads,
// then reveal instantly. Without this, raw text names flash before
// the glyphs render.
document.documentElement.classList.add('icons-loading');
document.fonts.load('1em "Material Symbols Rounded"').then(() => {
  document.documentElement.classList.remove('icons-loading');
});

// Automatically update the service worker without asking the user
const updateSW = registerSW({
  onNeedRefresh() {
    // When a new version is available, force the update immediately
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
