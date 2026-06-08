import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useMenuStore } from '../stores/menu';
import MenuCard from '../components/MenuCard';
import PullToRefresh from '../components/PullToRefresh';
import { useT } from '../i18n/useT';
import type { TranslationKey } from '../i18n/translations';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function MenuPage() {
  const { items, categories, searchQuery, activeTab, sortBy, setSearchQuery, setActiveTab, setSortBy, fetchMoreMenuItems, page } = useMenuStore();
  const sortOptions = useMemo(() => ['', ...categories], [categories]);
  const t = useT();
  const isLoading = useMenuStore(s => s.isLoading);
  const isLoadingMore = useMenuStore(s => s.isLoadingMore);
  const hasMore = useMenuStore(s => s.hasMore);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    await useMenuStore.getState().fetchMenuItems(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  // Swipe logic
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);

    // Only switch tabs if horizontal movement is dominant (not a vertical scroll)
    if (Math.abs(distanceX) < minSwipeDistance || distanceY > Math.abs(distanceX)) return;

    if (distanceX > 0 && activeTab === 'Меню') {
      setActiveTab('Бизнес ланч');
    } else if (distanceX < 0 && activeTab === 'Бизнес ланч') {
      setActiveTab('Меню');
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      fetchMoreMenuItems();
    }
  }, [fetchMoreMenuItems]);

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Only sort by category filter — NO favorite sorting to avoid jumps on pagination
    if (sortBy !== '') {
      filtered.sort((a, b) => {
        if (a.category === sortBy && b.category !== sortBy) return -1;
        if (a.category !== sortBy && b.category === sortBy) return 1;
        return 0;
      });
    }

    return filtered;
  }, [items, searchQuery, sortBy]);

  // Only show items up to the current page (8 per page).
  // Pagination works correctly even when IndexedDB cache holds extra items.
  const VISIBLE_COUNT = page * 8;
  const visibleItems = filteredItems.slice(0, VISIBLE_COUNT);

  const virtualizer = useVirtualizer({
    count: visibleItems.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 140, // Approximate height of MenuCard including margins
    overscan: 5,
  });

  return (
      <div
        style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)',
      }}>
      {/* ─── Header ─── */}
      <div style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#1B5E3D',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
            {t('menu_title')}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '0 12px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <button
            className="btn-reset"
            onClick={() => setActiveTab('Меню')}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottom: activeTab === 'Меню' ? '3px solid #FFF' : '3px solid transparent',
              color: activeTab === 'Меню' ? '#FFF' : 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(15px, 3.8rem, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            {t('nav_menu')}
          </button>
          <button
            className="btn-reset"
            onClick={() => setActiveTab('Бизнес ланч')}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottom: activeTab === 'Бизнес ланч' ? '3px solid #FFF' : '3px solid transparent',
              color: activeTab === 'Бизнес ланч' ? '#FFF' : 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(15px, 3.8rem, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            {t('menu_tab_business_lunch')}
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <PullToRefresh ref={scrollContainerRef} onRefresh={handleRefresh} onScroll={handleScroll}>
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
          }}>
        {/* Menu Tab */}
        <div style={{ display: activeTab === 'Меню' ? 'block' : 'none' }}>
          <>
            {/* Title & Dot */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
              <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8 }}>
                {t('menu_our_menu')}
              </h2>
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#22C55E',
                boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)'
              }} />
            </div>

            {/* Search Bar & Filter Button */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 16 }}>
              <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: '0 16px',
                height: 48,
                border: '1.5px solid #94A3B8',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                marginRight: 12,
              }}>
                <span className="icon-material" style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', color: '#000000', marginRight: 10 }}>
                  search
                </span>
                <input
                  className="black-placeholder"
                  type="text"
                  placeholder={t('menu_search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 'clamp(16px, 4rem, 22px)',
                    fontWeight: 500,
                    color: '#000000',
                  }}
                />
              </div>
              <div style={{ position: 'relative' }} ref={sortRef}>
                <button
                  className="btn-reset flex-center"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#1E293B',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(30,41,59,0.2)',
                  }}
                >
                  <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1rem, 34px)', color: '#FFF' }}>
                    tune
                  </span>
                </button>

                {isSortOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 56,
                    right: 0,
                    width: 280,
                    backgroundColor: '#FFF',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ padding: '16px 16px 8px 16px', fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>
                      {t('menu_sort_label')}
                    </div>
                    {sortOptions.map((option, index) => {
                      const label = option === '' ? t('menu_sort_none') : option;

                      return (
                        <button
                          key={option}
                          className="btn-reset"
                          onClick={() => {
                            setSortBy(option);
                            setIsSortOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '16px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: index !== sortOptions.length - 1 ? '1px solid #F1F5F9' : 'none',
                            color: '#1E293B',
                            fontSize: 'clamp(15px, 3.8rem, 21px)',
                            fontWeight: sortBy === option ? 700 : 500,
                            backgroundColor: sortBy === option ? '#F8FAFC' : 'transparent',
                          }}
                        >
                          {label}
                          {sortBy === option && (
                            <span className="icon-material" style={{ color: '#10B981', fontSize: 'clamp(20px, 5.1rem, 28px)' }}>check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{ paddingBottom: 100 }}>
              {isLoading && filteredItems.length === 0 ? (
                // Skeletons — match MenuCard layout exactly
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{
                    padding: '12px 0',
                    margin: '0 12px',
                    borderBottom: '1px solid #64748B',
                    display: 'flex',
                    alignItems: 'stretch',
                  }}>
                    {/* Image placeholder */}
                    <div className="skeleton-pulse" style={{
                      flexShrink: 0,
                      width: 'clamp(96px, 24.5rem, 140px)',
                      height: 'clamp(96px, 24.5rem, 140px)',
                      borderRadius: 12,
                      marginRight: 16,
                    }} />
                    {/* Text content */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', paddingTop: 2, paddingBottom: 2, paddingRight: 44 }}>
                      <div className="skeleton-pulse" style={{ width: '80%', height: 20, borderRadius: 10, marginBottom: 8 }} />
                      <div className="skeleton-pulse" style={{ width: '100%', height: 15, borderRadius: 7, marginBottom: 4 }} />
                      <div className="skeleton-pulse" style={{ width: '60%', height: 15, borderRadius: 7, marginBottom: 'auto' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="skeleton-pulse" style={{ width: 60, height: 24, borderRadius: 12 }} />
                        <div className="skeleton-pulse" style={{ width: 36, height: 36, borderRadius: 12 }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredItems.length > 0 ? (
                <>
                  <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const item = visibleItems[virtualItem.index];
                      return (
                        <div
                          key={virtualItem.key}
                          data-index={virtualItem.index}
                          ref={virtualizer.measureElement}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <MenuCard item={item} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0 24px 0', gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid rgba(27, 94, 61, 0.2)', borderTopColor: '#1B5E3D', animation: 'rm-spin .6s linear infinite' }} />
                      <span style={{ fontSize: 'clamp(14px, 3.6rem, 18px)', color: '#94A3B8', fontWeight: 500 }}>{t('loading')}</span>
                    </div>
                  )}
                  {!hasMore && visibleItems.length >= 8 && (
                    <div style={{ textAlign: 'center', padding: '16px 0 24px 0', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                      {t('menu_all_loaded')}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                  <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3rem, 68px)', marginBottom: 12 }}>
                    search_off
                  </span>
                  <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500 }}>{t('menu_not_found')}</p>
                </div>
              )}
            </div>
          </>
        </div>

        {/* Business Lunch Tab */}
        <div 
          className="flex-center" 
          style={{ 
            display: activeTab === 'Бизнес ланч' ? 'flex' : 'none',
            flex: 1, 
            padding: '40px 16px', 
            flexDirection: 'column', 
            color: '#94A3B8' 
          }}
        >
          <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3rem, 68px)', marginBottom: 16 }}>restaurant</span>
          <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600 }}>{t('menu_business_lunch_dev')}</p>
        </div>
      </div>
      </PullToRefresh>
      </div>
    </div>
  );
}
