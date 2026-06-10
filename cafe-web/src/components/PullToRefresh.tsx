import { useState, useRef, useCallback, forwardRef } from 'react';
import type { ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  children: ReactNode;
}

const MAX_PULL = 120;
const THRESHOLD = 60;
const MIN_SPINNER_MS = 500;

/**
 * Pull-to-refresh that NEVER interferes with the browser's native scroll.
 *
 * React's onTouchMove is passive — the browser scrolls independently.
 * We only read touch coordinates to drive an absolutely-positioned indicator.
 * No preventDefault(), no passive:false, no native addEventListener.
 */
const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(({ onRefresh, onScroll, children }, ref) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const pullDistance = useRef(0);
  const startY = useRef(0);
  const startX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isVerticalSwipe = useRef(false);
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Expose the ref to the parent if provided, otherwise use internal
  const handleRef = useCallback((node: HTMLDivElement) => {
    internalContainerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const getScrollTop = () => internalContainerRef.current?.scrollTop ?? 0;

  // ── Animate indicator via direct DOM (no React re-render) ──
  const updateIndicator = useCallback((distance: number, snap = false) => {
    const el = indicatorRef.current;
    const icon = iconRef.current;
    if (!el) return;

    if (snap) {
      el.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      el.style.transform = 'translateY(0px)';
      el.style.opacity = '1';
    } else {
      el.style.transition = 'none';
      el.style.transform = `translateY(${distance - THRESHOLD}px)`;
      el.style.opacity = String(Math.min(distance / (THRESHOLD * 0.8), 1));
    }

    if (icon && !refreshingRef.current) {
      icon.style.transition = 'none';
      icon.style.transform = `rotate(${distance * 1.5}deg)`;
    }
  }, []);

  // ── Hide indicator (spring-back animation) ──
  const hideIndicator = useCallback(() => {
    const el = indicatorRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    el.style.transform = `translateY(-${THRESHOLD}px)`;
    el.style.opacity = '0';
  }, []);

  // ── Reset after refresh completes ──
  const resetPull = useCallback(() => {
    refreshingRef.current = false;
    setIsRefreshing(false);
    pullDistance.current = 0;
    hideIndicator();
  }, [hideIndicator]);

  // ── Touch handlers (React synthetic, passive — zero scroll interference) ──

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!internalContainerRef.current?.contains(e.target as Node)) return;
    if (getScrollTop() <= 0 && !refreshingRef.current) {
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      isHorizontalSwipe.current = false;
      isVerticalSwipe.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0 || refreshingRef.current || isHorizontalSwipe.current) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const distanceY = currentY - startY.current;
    const distanceX = Math.abs(currentX - startX.current);

    // 1. Gesture Disambiguation Phase
    if (!isVerticalSwipe.current) {
      // Wait for 10px of movement to confidently determine the user's intent
      if (distanceX > 10 || Math.abs(distanceY) > 10) {
        if (distanceX > Math.abs(distanceY)) {
          // Locked to horizontal (e.g. scrolling stories)
          isHorizontalSwipe.current = true;
          return;
        } else {
          // Locked to vertical pull
          isVerticalSwipe.current = true;
        }
      } else {
        // Not enough movement yet, ignore
        return;
      }
    }

    // 2. Active Pull Phase (only if locked to vertical)
    if (distanceY > 0 && getScrollTop() <= 0) {
      const pull = Math.min(distanceY * 0.5, MAX_PULL);
      pullDistance.current = pull;
      updateIndicator(pull, false);
    } else if (distanceY < 0) {
      startY.current = 0;
      pullDistance.current = 0;
      updateIndicator(0, false);
    }
  };

  const handleTouchEnd = () => {
    if (startY.current === 0) return;

    if (pullDistance.current >= THRESHOLD && !refreshingRef.current) {
      refreshingRef.current = true;
      setIsRefreshing(true);
      pullDistance.current = THRESHOLD;
      updateIndicator(THRESHOLD, true);

      // Wait for onRefresh to complete to prevent animation stutter during heavy state updates
      const startTime = Date.now();
      const finishRefresh = () => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_SPINNER_MS - elapsed);
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(resetPull, remainingTime);
      };

      const result = onRefresh();
      if (result instanceof Promise) {
        result.then(finishRefresh).catch(finishRefresh);
      } else {
        finishRefresh();
      }
    } else {
      pullDistance.current = 0;
      hideIndicator();
    }

    startY.current = 0;
  };

  return (
    <div
      ref={handleRef}
      onScroll={onScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflowY: 'auto',
        overscrollBehavior: 'none',
      }}
    >
      {/* Pull indicator — absolutely positioned, animated via direct DOM writes */}
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: THRESHOLD,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(-${THRESHOLD}px)`,
          opacity: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            ref={iconRef}
            className={`icon-material ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ fontSize: 24, color: '#1B5E3D' }}
          >
            refresh
          </span>
        </div>
      </div>

      {/* Content — 100% browser-native scroll, zero JS overhead */}
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
});

export default PullToRefresh;
