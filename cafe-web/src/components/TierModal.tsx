import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore, getTierForVisits } from '../stores/profile';

// Re-define TIERS locally since they aren't exported as an array from the store,
// or we can just mock the list for the UI.
const TIERS_LIST = [
  { name: 'Любитель', cb: 3, min: 0, max: 100, color: '#94A3B8', bg: '#F1F5F9', icon: 'local_cafe' },
  { name: 'Ценитель', cb: 5, min: 100, max: 500, color: '#F59E0B', bg: '#FEF3C7', icon: 'workspace_premium' },
  { name: 'Знаток', cb: 7, min: 500, max: 1000, color: '#3B82F6', bg: '#EFF6FF', icon: 'diamond' },
  { name: 'Гурман', cb: 10, min: 1000, max: 9999999, color: '#A855F7', bg: '#FAF5FF', icon: 'stars' },
];

interface Props {
  onClose: () => void;
}

export default function TierModal({ onClose }: Props) {
  const { visits } = useProfileStore();
  const currentTier = getTierForVisits(visits);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlay = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return createPortal(
    <div className="overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div 
        ref={sheetRef}
        className="sheet-base flex-col" style={{ overflowY: 'auto', padding: '24px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              Система лояльности
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button 
            className="btn-reset flex-center" 
            onClick={onClose}
            style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Content (Timeline) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>
          <div style={{ position: 'relative' }}>
            {/* The vertical line connecting items */}
            <div style={{
              position: 'absolute',
              left: 22, top: 16, bottom: 16,
              width: 2, backgroundColor: '#CBD5E1',
              zIndex: 0
            }} />

            {TIERS_LIST.map((tier) => {
              const isActive = currentTier.name === tier.name;
              
              return (
                <div key={tier.name} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                  {/* Icon Column */}
                  <div style={{ position: 'relative', flexShrink: 0, marginTop: 8 }}>
                    {/* Active highlight glow behind icon */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', inset: -8, borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        zIndex: -1
                      }} />
                    )}
                    <div style={{
                      width: 'clamp(44px, 11.2vw, 62px)', height: 'clamp(44px, 11.2vw, 62px)', borderRadius: '50%',
                      backgroundColor: tier.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isActive ? '0 0 0 2px #10B981' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1vw, 34px)', color: tier.color, fontVariationSettings: "'FILL' 1" }}>
                        {tier.icon}
                      </span>
                    </div>
                  </div>

                  {/* Card Column */}
                  <div style={{
                    flex: 1, backgroundColor: '#FFFFFF',
                    borderRadius: 16, padding: '12px 16px',
                    border: isActive ? '2px solid #10B981' : '1px solid #E2E8F0',
                    boxShadow: isActive ? '0 8px 24px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 800, color: '#1E293B' }}>
                        {tier.name}
                      </span>
                      <div style={{
                        padding: '4px 8px', borderRadius: 8,
                        backgroundColor: tier.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: 'clamp(13px, 3.3vw, 18px)', fontWeight: 800, color: '#FFF' }}>
                          {tier.cb}%
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 'clamp(13px, 3.3vw, 18px)', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                      {tier.max > 10000 
                        ? `Макс. кэшбэк ${tier.cb}% от ${tier.min} посещ.` 
                        : `Кэшбэк ${tier.cb}% при ${tier.min}-${tier.max} посещ.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
