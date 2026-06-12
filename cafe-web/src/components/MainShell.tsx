import { useNavigationStore } from '../stores/navigation';
import { useMenuStore } from '../stores/menu';
import BottomNav from './BottomNav';
import HomePage from '../pages/HomePage';
import InstallPwaBanner from './InstallPwaBanner';
import { ErrorBoundary } from './ErrorBoundary';
import { useProfileStore } from '../stores/profile';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { memo, useCallback, lazy, Suspense, useEffect, useState, startTransition } from 'react';
import type { ComponentType } from 'react';
import { BranchesPageSkeleton, MenuPageSkeleton, ProfilePageSkeleton } from './PageSkeletons';

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

// Keep modal images in DOM so iOS Safari doesn't evict decoded bitmaps
// when modals mount/unmount via createPortal.
const STATIC_IMAGES = [
  '/categories/1.webp',
  '/categories/2.webp',
  '/categories/3.webp',
  '/categories/4.webp',
  '/categories/5.webp',
];

function ImagePreloader() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
      {STATIC_IMAGES.map((src) => (
        <img key={src} src={src} alt="" decoding="async" />
      ))}
    </div>
  );
}

const TABS = [
  { id: 'home', Component: HomePage, Skeleton: null, bg: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' },
  { id: 'menu', Component: MenuPage, Skeleton: MenuPageSkeleton, bg: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' },
  { id: 'branches', Component: BranchesPage, Skeleton: BranchesPageSkeleton, bg: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' },
  { id: 'profile', Component: ProfilePage, Skeleton: ProfilePageSkeleton, bg: '#FEF9F5' },
];

// Pages receive no props, so memo makes every MainShell re-render (each tab
// switch) skip reconciling the page subtrees entirely. Without this, switching
// tabs re-rendered ALL mounted pages — the heavy home page (QR, stories, news)
// made every switch back to it feel sluggish on phones. Pages still re-render
// from their own store subscriptions.
const TabPage = memo(function TabPage({ Component }: { Component: ComponentType }) {
  return <Component />;
});

export default function MainShell() {
  // Narrow selectors — any other profile change (stamps, visits, photo…)
  // must not re-render the shell and all four mounted tab pages.
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const isLoading = useProfileStore((s) => s.isLoading);
  const storeTab = useNavigationStore((s) => s.activeTab);

  // ─── Smooth tab switching ───
  // When switching to a lazy-loaded tab, keep the OLD page visible until
  // the new one is fully loaded. No spinner, no flash, no waiting.
  const [displayTab, setDisplayTab] = useState(storeTab);

  // Mount tabs lazily on first visit, then keep them alive (scroll position,
  // state). Mounting all four upfront loaded the Maps SDK + tiles at startup
  // even if the user never opened the branches tab.
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(() => new Set([storeTab]));

  useEffect(() => {
    const unsub = useNavigationStore.subscribe((state, prevState) => {
      if (state.activeTab !== prevState.activeTab) {
        startTransition(() => {
          setDisplayTab(state.activeTab);
          setVisitedTabs((prev) =>
            prev.has(state.activeTab) ? prev : new Set(prev).add(state.activeTab)
          );
        });
      }
    });
    return unsub;
  }, []);

  const handleBackToHome = useCallback(() => {
    // If on delivery tab and inside a category, go back to categories
    const tab = useNavigationStore.getState().activeTab;
    if (tab === 2) {
      const menuState = useMenuStore.getState();
      if (menuState.categoryFilter) {
        menuState.setCategoryFilter('');
        menuState.setSearchQuery('');
        return;
      }
    }
    useNavigationStore.getState().setActiveTab(0);
  }, []);

  useHardwareBack(handleBackToHome, storeTab !== 0);

  // ─── Prefetch lazy modals and tab pages in background ───
  // Downloading the chunks ≠ mounting: pages still mount on first visit
  // (so e.g. the Maps SDK isn't initialized until the branches tab opens),
  // but the JS is already local — first tab switch doesn't wait for network.
  useEffect(() => {
    const id = setTimeout(() => {
      import('./StoryViewer');
      import('./BranchDetailModal');
      import('./OnboardingModal');
      import('./PushPromptModal');
      import('../pages/BranchesPage');
      import('../pages/MenuPage');
      import('../pages/ProfilePage');
    }, 1000); // wait 1s so initial UI paints first
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
      <div style={{ height: '100%', width: '100%', maxWidth: 430, background: TABS[displayTab].bg, position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {TABS.map(({ id, Component, Skeleton }, index) => {
            const isActive = displayTab === index;
            if (!visitedTabs.has(index)) return null;
            return (
              <div
                key={id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: isActive ? 1 : 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  // GPU-only crossfade between tabs: opacity is composited,
                  // no layout/paint work. visibility flips AFTER the fade-out
                  // (0s transition with .15s delay) so the outgoing page stays
                  // renderable during the blend, then frees compositing.
                  // visibility:hidden (not contentVisibility) keeps DOM and
                  // CSS animations alive — contentVisibility kills them on iOS.
                  visibility: isActive ? 'visible' : 'hidden',
                  transition: isActive
                    ? 'opacity .15s ease'
                    : 'opacity .15s ease, visibility 0s linear .15s',
                }}
              >
                <ErrorBoundary>
                  <Suspense fallback={Skeleton ? <Skeleton /> : null}>
                    <TabPage Component={Component} />
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

        {/* Keep static modal images in DOM so iOS Safari doesn't evict decoded bitmaps */}
        <ImagePreloader />
      </div>
    </div>
  );
}
