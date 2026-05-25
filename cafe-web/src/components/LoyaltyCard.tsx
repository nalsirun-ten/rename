import { useState } from 'react';
import { useProfileStore, getTierForVisits, getNextTierForVisits } from '../stores/profile';
import QrCode from './QrCode';
import QrModal from './QrModal';
import BalanceModal from './BalanceModal';
import TierModal from './TierModal';

export default function LoyaltyCard() {
  const [showQr, setShowQr] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showTier, setShowTier] = useState(false);

  const { points, visits, loyaltyNumber } = useProfileStore();
  const currentTier = getTierForVisits(visits);
  const nextTier = getNextTierForVisits(visits);
  const progress = nextTier ? Math.min(visits / nextTier.min, 1) : 1;
  const remaining = nextTier ? nextTier.min - visits : 0;

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* QR bento */}
        <button
          className="btn-reset"
          onClick={() => setShowQr(true)}
          style={{
            boxSizing: 'border-box',
            aspectRatio: '0.94',
            backgroundColor: '#1B5E3D', borderRadius: 36,
            border: '2px solid #D4A373', padding: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <QrCode data={loyaltyNumber} size={120} iconSize={28} />
        </button>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Balance */}
          <button
            className="btn-reset"
            onClick={() => setShowBalance(true)}
            style={{
              flex: 1, minHeight: 0, backgroundColor: '#E0F2FE', borderRadius: 36,
              border: '2px solid #3B82F6', padding: '12px 16px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              textAlign: 'left', cursor: 'pointer', width: '100%'
            }}
          >
            <span style={{ fontSize: 'clamp(12px, 3.1vw, 16px)', fontWeight: 600, color: 'rgba(0,0,0,0.87)' }}>Ваш баланс</span>
            <div style={{ height: 2 }} />
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 'clamp(36px, 9.2vw, 50px)', fontWeight: 500, color: '#000', lineHeight: 1.1 }}>{points}</span>
              <div style={{ width: 4 }} />
              <span style={{ fontSize: 'clamp(12px, 3.1vw, 16px)', fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>баллов</span>
            </div>
          </button>

          <div style={{ height: 12, flexShrink: 0 }} />

          {/* Tier */}
          <button
            className="btn-reset"
            onClick={() => setShowTier(true)}
            style={{
              flex: 1, minHeight: 0, borderRadius: 36, border: '2px solid #7C3AED',
              background: 'linear-gradient(135deg, #A855F7 0%, #4C1D95 100%)',
              padding: '12px 16px', display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', overflow: 'hidden',
              textAlign: 'left', cursor: 'pointer', width: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
                <span style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 600, color: '#FFF', lineHeight: 1 }}>{visits}</span>
                {nextTier && <span style={{ fontSize: 'clamp(12px, 3.1vw, 16px)', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{' / '}{nextTier.min}</span>}
              </div>
              {nextTier && <span style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 600, color: '#FFF', paddingLeft: 8 }}>-{remaining}</span>}
            </div>
            
            <div style={{ height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: '#FFF', borderRadius: 4 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 800, color: '#FFF', flex: 1 }}>{currentTier.name}</span>
              <span style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 800, color: '#FFF' }}>{currentTier.cb}%</span>
            </div>
          </button>
        </div>
      </div>
      
      {showQr && <QrModal onClose={() => setShowQr(false)} />}
      {showBalance && <BalanceModal onClose={() => setShowBalance(false)} />}
      {showTier && <TierModal onClose={() => setShowTier(false)} />}
    </div>
  );
}
