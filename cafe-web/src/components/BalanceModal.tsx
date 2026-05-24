import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore } from '../stores/profile';

interface Props {
  onClose: () => void;
}

export default function BalanceModal({ onClose }: Props) {
  const { points } = useProfileStore();
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
        className="sheet-base flex-col" style={{ overflowY: 'auto', padding: 24, paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              История баллов
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button 
            className="btn-reset flex-center" 
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#F1F5F9' }}
          >
            <span className="icon-material" style={{ fontSize: 20, color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          
          {/* Green Card */}
          <div style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #166534 100%)',
            borderRadius: 24,
            padding: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 32,
            boxShadow: '0 12px 24px rgba(22, 101, 52, 0.2)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Ваш баланс
              </span>
              <div style={{ height: 4 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
                  {points}
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                  баллов
                </span>
              </div>
            </div>
            
            <div style={{
              width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="icon-material" style={{ fontSize: 32, color: '#166534' }}>
                account_balance_wallet
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 32 }}>
            Ваши операции
          </h3>

          {/* Empty State */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 64 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24
            }}>
              <span className="icon-material" style={{ fontSize: 48, color: '#94A3B8' }}>
                receipt_long
              </span>
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
              Операций пока нет
            </h4>
            <p style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>
              Здесь будет отображаться<br />история ваших баллов
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
