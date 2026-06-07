import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';
import { useVacanciesStore } from '../stores/vacancies';

interface Props {
  onClose: () => void;
}

export default function VacanciesModal({ onClose }: Props) {
  const t = useT();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const { vacancies, fetchVacancies, isLoading } = useVacanciesStore();

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const sheetRef = useSwipeToClose(onClose);
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{ backgroundColor: '#FCFBFA', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('vacancies_title')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0EA5E9', boxShadow: '0 0 10px 2px rgba(14, 165, 233, 0.7)' }} />
          </div>
          <button 
            onClick={onClose}
            className="btn-reset flex-center"
            style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#0F172A', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Vacancies List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 16 }}>
              <span className="icon-material animate-spin" style={{ fontSize: 32 }}>autorenew</span>
            </div>
          ) : vacancies.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 16 }}>
              {t('vacancies_empty')}
            </div>
          ) : (
            vacancies.map((item, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div key={item.id} style={{ borderBottom: '1px solid #CBD5E1' }}>
                  <button
                    className="btn-reset"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '16px 0',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                      <span style={{ fontSize: 'clamp(18px, 4.5rem, 24px)', fontWeight: 700, color: '#1E293B' }}>
                        {item.title}
                      </span>
                      <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 'clamp(14px, 3.6rem, 16px)', fontWeight: 600, color: '#0EA5E9', backgroundColor: '#E0F2FE', padding: '4px 8px', borderRadius: 6 }}>
                        {item.salary}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ paddingBottom: 20, paddingTop: 4 }}>
                      <p style={{ fontSize: 'clamp(15px, 3.8rem, 18px)', color: '#64748B', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
