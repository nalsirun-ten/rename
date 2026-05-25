import { useBranchesStore, type FilterType } from '../stores/branches';
import BranchCard from '../components/BranchCard';

const FILTERS: FilterType[] = ['Все', 'Кофейня', 'Точка на вынос'];

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

  const filteredBranches = branches.filter((b) => {
    if (filter !== 'Все' && b.type !== filter) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase()) && !b.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (a.isSaved && !b.isSaved) return -1;
    if (!a.isSaved && b.isSaved) return 1;
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
            Филиалы
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
              fontSize: 'clamp(15px, 3.8vw, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            Списком
          </button>
          <button
            className="btn-reset"
            onClick={() => setActiveTab('Карта')}
            style={{
              flex: 1,
              paddingBottom: 10,
              borderBottom: activeTab === 'Карта' ? '3px solid #FFF' : '3px solid transparent',
              color: activeTab === 'Карта' ? '#FFF' : 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(15px, 3.8vw, 21px)',
              fontWeight: 700,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            Карта
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
        {activeTab === 'Списком' ? (
          <>
            {/* Title & Dot */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 12px 16px 12px' }}>
              <h2 style={{ fontSize: 'clamp(18px, 4.8vw, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8 }}>
                Наши филиалы
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
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', marginBottom: 16 }}>
              <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: '0 12px',
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
                  placeholder="Найти кофейню..."
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
              <button
                className="btn-reset flex-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#1B5E3D',
                  flexShrink: 0,
                }}
              >
                <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1vw, 34px)', color: '#FFF' }}>
                  search
                </span>
              </button>
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              padding: '0 12px',
              overflowX: 'auto',
              marginBottom: 16,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {FILTERS.map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    className="btn-reset"
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 18,
                      backgroundColor: isActive ? '#1B5E3D' : '#F1F5F9',
                      color: isActive ? '#FFF' : '#64748B',
                      fontSize: 'clamp(13px, 3.3vw, 18px)',
                      fontWeight: 600,
                      marginRight: 10,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div style={{ paddingBottom: 100 }}>
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 12px', color: '#94A3B8' }}>
                  <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3vw, 68px)', marginBottom: 12 }}>
                    search_off
                  </span>
                  <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 500 }}>Ничего не найдено</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, padding: '40px 12px', flexDirection: 'column', color: '#94A3B8' }}>
             <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3vw, 68px)', marginBottom: 16 }}>map</span>
             <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 600 }}>Карта в разработке</p>
          </div>
        )}
      </div>
    </div>
  );
}
