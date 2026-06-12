import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useBranchesStore, type FilterType } from '../stores/branches';
import BranchCard from '../components/BranchCard';
import BranchesMap from '../components/BranchesMap';
import PullToRefresh from '../components/PullToRefresh';
import { useT } from '../i18n/useT';
import type { TranslationKey } from '../i18n/translations';

const FILTERS: FilterType[] = ['Все', 'Кофейня', 'Точка на вынос'];

const FILTER_LABEL_MAP: Record<string, TranslationKey> = {
  'Все': 'branches_filter_all',
  'Кофейня': 'branches_filter_cafe',
  'Точка на вынос': 'branches_filter_takeaway',
};



export default function BranchesPage() {
  const {
    branches,
    searchQuery,
    filter,
    activeTab,
    setSearchQuery,
    setFilter,
    setActiveTab,
  } = useBranchesStore();
  const t = useT();
  const isLoading = useBranchesStore(s => s.isLoading);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    await useBranchesStore.getState().fetchBranches(true);
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

  // Swipe to map — coordinates live in refs, NOT state: touchmove fires on
  // every scroll pixel and setState there re-rendered the whole list dozens
  // of times per second while scrolling.
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const touchEndRef = useRef<{ x: number, y: number } | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(() => {
    const start = touchStartRef.current;
    const end = touchEndRef.current;
    if (!start || !end) return;
    const distanceX = start.x - end.x;
    const distanceY = Math.abs(start.y - end.y);
    // Only switch if horizontal movement is greater than vertical movement and exceeds threshold
    if (distanceX > minSwipeDistance && Math.abs(distanceX) > distanceY && useBranchesStore.getState().activeTab === 'Списком') {
      setActiveTab('Карта');
    }
  }, [setActiveTab]);

  // All 3 branches are local — filtering and search are instant, no pagination
  const filteredBranches = useMemo(() => branches.filter((b) => {
    if (filter !== 'Все' && b.type !== filter) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase()) && !b.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }), [branches, filter, searchQuery]);


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
            {t('branches_title')}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '0 12px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <button
            className="btn-reset"
            onClick={() => setActiveTab('Списком')}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottom: activeTab === 'Списком' ? '3px solid #FFF' : '3px solid transparent',
              color: activeTab === 'Списком' ? '#FFF' : 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(15px, 3.8rem, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            {t('branches_tab_list')}
          </button>
          <button
            className="btn-reset"
            onClick={() => setActiveTab('Карта')}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottom: activeTab === 'Карта' ? '3px solid #FFF' : '3px solid transparent',
              color: activeTab === 'Карта' ? '#FFF' : 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(15px, 3.8rem, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            {t('branches_tab_map')}
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {/* List Tab */}
        <div style={{
          visibility: activeTab === 'Списком' ? 'visible' : 'hidden',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: activeTab === 'Списком' ? 10 : 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <PullToRefresh onRefresh={handleRefresh}>
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                flex: 1,
                backgroundColor: '#FEF9F5',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Title & Dot */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
                <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8 }}>
                  {t('branches_our_branches')}
                </h2>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: '#22C55E',
                  boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)'
                }} />
              </div>

              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 8 }}>
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
                    placeholder={t('branches_search_placeholder')}
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
                        {t('branches_filter_label')}
                      </div>
                      {FILTERS.map((f) => (
                        <button
                          key={f}
                          className="btn-reset"
                          onClick={() => {
                            setFilter(f);
                            setIsSortOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '16px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: f !== FILTERS[FILTERS.length - 1] ? '1px solid #F1F5F9' : 'none',
                            color: '#1E293B',
                            fontSize: 'clamp(15px, 3.8rem, 21px)',
                            fontWeight: filter === f ? 700 : 500,
                            backgroundColor: filter === f ? '#F8FAFC' : 'transparent',
                          }}
                        >
                          {t(FILTER_LABEL_MAP[f])}
                          {filter === f && (
                            <span className="icon-material" style={{ color: '#10B981', fontSize: 'clamp(20px, 5.1rem, 28px)' }}>check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* List */}
              <div style={{ paddingBottom: 100 }}>
                {isLoading && filteredBranches.length === 0 ? (
                  // Skeletons — match BranchCard horizontal layout
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{
                      padding: '20px 0',
                      margin: '0 12px',
                      borderBottom: '1px solid #CBD5E1',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      {/* Top row: text left + image right */}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
                          <div className="skeleton-pulse" style={{ width: '70%', height: 22, borderRadius: 11, marginBottom: 6 }} />
                          <div className="skeleton-pulse" style={{ width: '85%', height: 18, borderRadius: 9, marginBottom: 10 }} />
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                            <div className="skeleton-pulse" style={{ width: 16, height: 16, borderRadius: 8 }} />
                            <div className="skeleton-pulse" style={{ width: '45%', height: 14, borderRadius: 7 }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="skeleton-pulse" style={{ width: 16, height: 16, borderRadius: 8 }} />
                            <div className="skeleton-pulse" style={{ width: '35%', height: 14, borderRadius: 7 }} />
                          </div>
                        </div>
                        {/* Image placeholder */}
                        <div className="skeleton-pulse" style={{
                          flexShrink: 0,
                          width: 'clamp(102px, 26rem, 146px)',
                          height: 'clamp(102px, 26rem, 146px)',
                          borderRadius: 12,
                        }} />
                      </div>
                      {/* Bottom row: badge left + button right */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <div className="skeleton-pulse" style={{
                          width: 'clamp(100px, 25rem, 140px)',
                          height: 'clamp(40px, 10.2rem, 60px)',
                          borderRadius: 22,
                        }} />
                        <div className="skeleton-pulse" style={{
                          width: 'clamp(40px, 10.2rem, 60px)',
                          height: 'clamp(40px, 10.2rem, 60px)',
                          borderRadius: 14,
                        }} />
                      </div>
                    </div>
                  ))
                ) : filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <BranchCard key={branch.id} branch={branch} />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                    <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3rem, 68px)', marginBottom: 12 }}>
                      search_off
                    </span>
                    <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500 }}>{t('branches_nothing_found')}</p>
                  </div>
                )}
              </div>
            </div>
          </PullToRefresh>
        </div>

        {/* Map Tab */}
        <div style={{
          visibility: activeTab === 'Карта' ? 'visible' : 'hidden',
          pointerEvents: activeTab === 'Карта' ? 'auto' : 'none',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: activeTab === 'Карта' ? 10 : 0,
          backgroundColor: '#E5E3DF', // Google Maps default background color
        }}>
          <BranchesMap />
        </div>
      </div>
    </div>
  );
}
