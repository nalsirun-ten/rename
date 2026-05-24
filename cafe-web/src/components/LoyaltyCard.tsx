import { useProfileStore, getTierForVisits, getNextTierForVisits } from '../stores/profile';
import QrCode from './QrCode';

export default function LoyaltyCard() {
  const { points, visits, loyaltyNumber } = useProfileStore();
  const currentTier = getTierForVisits(visits);
  const nextTier = getNextTierForVisits(visits);
  const progress = nextTier ? Math.min(visits / nextTier.min, 1) : 1;
  const remaining = nextTier ? nextTier.min - visits : 0;

  let tierColor = '#E67E22'; // Iron/Bronze
  if (currentTier.nameKey === 'tier_gold') tierColor = '#F1C40F';
  if (currentTier.nameKey === 'tier_sapphire') tierColor = '#3498DB';
  if (currentTier.nameKey === 'tier_diamond') tierColor = '#9B59B6';

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* QR bento */}
        <div style={{
          boxSizing: 'border-box',
          aspectRatio: '0.94',
          backgroundColor: '#1B5E3D', borderRadius: 36,
          border: '2px solid #D4A373', padding: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <QrCode data={loyaltyNumber} size={120} iconSize={28} />
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Balance */}
          <div style={{
            flex: 1, minHeight: 0, backgroundColor: '#E0F2FE', borderRadius: 36,
            border: '2px solid #3B82F6', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.87)' }}>Ваш баланс</span>
            <div style={{ height: 2 }} />
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 36, fontWeight: 500, color: '#000', lineHeight: 1.1 }}>{points}</span>
              <div style={{ width: 4 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}>баллов</span>
            </div>
          </div>

          <div style={{ height: 12, flexShrink: 0 }} />

          {/* Tier */}
          <div style={{
            flex: 1, minHeight: 0, borderRadius: 36, border: '2px solid #7C3AED',
            background: 'linear-gradient(135deg, #A855F7 0%, #4C1D95 100%)',
            padding: '12px 16px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#FFF', lineHeight: 1 }}>{visits}</span>
                {nextTier && <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{' / '}{nextTier.min}</span>}
              </div>
              {nextTier && <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF', paddingLeft: 8 }}>-{remaining}</span>}
            </div>
            
            <div style={{ height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: '#FFF', borderRadius: 4 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#FFF', flex: 1 }}>{currentTier.name}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#FFF' }}>{currentTier.cb}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
