import { useState, useRef, useEffect } from 'react';
import { useMenuStore } from '../stores/menu';
import MenuCard from '../components/MenuCard';

const SORT_OPTIONS = [
  'Без сортировки',
  'Сначала Авторские напитки',
  'Сначала Выпечка',
  'Сначала Десерты',
  'Сначала Кофе'
];

export default function MenuPage() {
  const { items, searchQuery, activeTab, sortBy, setSearchQuery, setActiveTab, setSortBy } = useMenuStore();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredItems.sort((a, b) => {
    // 1. Favorites always on top
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    // 2. Category sorting if active
    if (sortBy !== 'Без сортировки') {
      const categoryName = sortBy.replace('Сначала ', '');
      if (a.category === categoryName && b.category !== categoryName) return -1;
      if (a.category !== categoryName && b.category === categoryName) return 1;
    }
    
    return 0;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: '#1B5E3D',
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* ─── Header ─── */}
      <div style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 32px)',
        paddingBottom: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#1B5E3D',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', fontWeight: 700, color: '#FFF' }}>
            Меню
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
              fontSize: 'clamp(15px, 3.8vw, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            Меню
          </button>
          <button
            className="btn-reset"
            onClick={() => setActiveTab('Бизнес ланч')}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottom: activeTab === 'Бизнес ланч' ? '3px solid #FFF' : '3px solid transparent',
              color: activeTab === 'Бизнес ланч' ? '#FFF' : 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(15px, 3.8vw, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            Бизнес ланч
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{
        flex: 1,
        backgroundColor: '#FEF9F5',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        {activeTab === 'Меню' ? (
          <>
            {/* Title & Dot */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 12px 16px 12px' }}>
              <h2 style={{ fontSize: 'clamp(18px, 4.8vw, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8 }}>
                Наше меню
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
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', marginBottom: 16 }}>
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
                <span className="icon-material" style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', color: '#000000', marginRight: 10 }}>
                  search
                </span>
                <input
                  className="black-placeholder"
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 'clamp(16px, 4vw, 22px)',
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
                    backgroundColor: '#1E293B', // Dark blue/gray as in screenshot
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(30,41,59,0.2)',
                  }}
                >
                  <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1vw, 34px)', color: '#FFF' }}>
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
                    <div style={{ padding: '16px 12px 8px 12px', fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>
                      Сортировка
                    </div>
                    {SORT_OPTIONS.map((option) => (
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
                          padding: '16px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: option !== SORT_OPTIONS[SORT_OPTIONS.length - 1] ? '1px solid #F1F5F9' : 'none',
                          color: '#1E293B',
                          fontSize: 'clamp(15px, 3.8vw, 21px)',
                          fontWeight: sortBy === option ? 700 : 500,
                          backgroundColor: sortBy === option ? '#F8FAFC' : 'transparent',
                        }}
                      >
                        {option}
                        {sortBy === option && (
                          <span className="icon-material" style={{ color: '#10B981', fontSize: 'clamp(20px, 5.1vw, 28px)' }}>check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{ paddingBottom: 100 }}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 12px', color: '#94A3B8' }}>
                  <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3vw, 68px)', marginBottom: 12 }}>
                    search_off
                  </span>
                  <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 500 }}>Товары не найдены</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, padding: '40px 12px', flexDirection: 'column', color: '#94A3B8' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3vw, 68px)', marginBottom: 16 }}>restaurant</span>
            <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 600 }}>Бизнес ланчи в разработке</p>
          </div>
        )}
      </div>
    </div>
  );
}
