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
        className="sheet-base flex-col" style={{ overflowY: 'auto', padding: '24px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
      >
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              История баллов
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          
          {/* Green Card */}
          <div style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #166534 100%)',
            borderRadius: 24,
            padding: '24px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 32,
            boxShadow: '0 12px 24px rgba(22, 101, 52, 0.2)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'clamp(13px, 3.3vw, 18px)', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Ваш баланс
              </span>
              <div style={{ height: 4 }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 'clamp(42px, 10.7vw, 60px)', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
                  {points}
                </span>
                <span style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                  баллов
                </span>
              </div>
            </div>
            
            <div style={{
              width: 'clamp(64px, 16.4vw, 90px)', height: 'clamp(64px, 16.4vw, 90px)', borderRadius: 32, backgroundColor: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="icon-material" style={{ fontSize: 'clamp(32px, 8.2vw, 45px)', color: '#166534' }}>
                account_balance_wallet
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 32 }}>
            Ваши операции
          </h3>

          {/* Empty State */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 64 }}>
            <div style={{
              width: 'clamp(96px, 24.6vw, 135px)', height: 'clamp(96px, 24.6vw, 135px)', borderRadius: 48,
              backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24
            }}>
              <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3vw, 68px)', color: '#94A3B8' }}>
                receipt_long
              </span>
            </div>
            <h4 style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>
              Операций пока нет
            </h4>
            <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>
              Здесь будет отображаться<br />история ваших баллов
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
