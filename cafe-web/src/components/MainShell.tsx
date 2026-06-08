import { useNavigationStore } from '../stores/navigation';
import BottomNav from './BottomNav';
import HomePage from '../pages/HomePage';
import InstallPwaBanner from './InstallPwaBanner';
import { ErrorBoundary } from './ErrorBoundary';
import { useProfileStore } from '../stores/profile';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useCallback, lazy, Suspense, useEffect, useState, startTransition } from 'react';

// ─── Lazy modals — loaded in background after app starts ───
// User never sees a spinner because prefetch runs before they tap anything.
const StoryViewer = lazy(() => import('./StoryViewer'));
const BranchDetailModal = lazy(() => import('./BranchDetailModal'));
const OnboardingModal = lazy(() => import('./OnboardingModal'));
const PushPromptModal = lazy(() => import('./PushPromptModal'));

// Lazy-load non-home pages — they're split into separate chunks.
// HomePage stays eager because it's the first thing the user sees.
const BranchesPage = lazy(() => import('../pages/BranchesPage'));
const MenuPage = lazy(() => import('../pages/MenuPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

function LazyFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid rgba(27,94,61,0.2)',
        borderTopColor: '#1B5E3D',
        animation: 'rm-spin 0.8s linear infinite',
      }} />
    </div>
  );
}

const TABS = [
  { id: 'home', Component: HomePage, bg: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' },
  { id: 'branches', Component: BranchesPage, bg: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' },
  { id: 'menu', Component: MenuPage, bg: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' },
  { id: 'profile', Component: ProfilePage, bg: '#FEF9F5' },
];

export default function MainShell() {
  const { isOnboarded, isLoading } = useProfileStore();
  const storeTab = useNavigationStore((s) => s.activeTab);

  // ─── Smooth tab switching ───
  // When switching to a lazy-loaded tab, keep the OLD page visible until
  // the new one is fully loaded. No spinner, no flash, no waiting.
  const [displayTab, setDisplayTab] = useState(storeTab);

  useEffect(() => {
    const unsub = useNavigationStore.subscribe((state, prevState) => {
      if (state.activeTab !== prevState.activeTab) {
        startTransition(() => setDisplayTab(state.activeTab));
      }
    });
    return unsub;
  }, []);

  // ─── Prefetch lazy modals in background ───
  useEffect(() => {
    const id = setTimeout(() => {
      import('./StoryViewer');
      import('./BranchDetailModal');
      import('./OnboardingModal');
      import('./PushPromptModal');
    }, 1000); // wait 1s so initial UI paints first
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
      <div style={{ height: '100%', width: '100%', maxWidth: 430, background: TABS[displayTab].bg, position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {TABS.map(({ id, Component }, index) => {
            const isActive = displayTab === index;
            return (
              <div
                key={id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  // content-visibility: hidden tells the browser to skip
                  // layout & paint for hidden tabs, saving CPU/GPU.
                  // The DOM stays in memory → instant switch, no blink.
                  contentVisibility: isActive ? 'visible' : 'hidden',
                }}
              >
                <ErrorBoundary>
                  <Suspense fallback={<LazyFallback />}>
                    <Component />
                  </Suspense>
                </ErrorBoundary>
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            pointerEvents: 'none',
            zIndex: 40,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
          }}
        />

        <BottomNav />
        <Suspense fallback={null}><StoryViewer /></Suspense>
        <Suspense fallback={null}><BranchDetailModal /></Suspense>

        {!isOnboarded && !isLoading && <Suspense fallback={null}><OnboardingModal /></Suspense>}
        <InstallPwaBanner activeTab={displayTab} />
        <Suspense fallback={null}><PushPromptModal /></Suspense>
      </div>
    </div>
  );
}
