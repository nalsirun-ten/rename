import { useState } from 'react';
import { useProfileStore, getNextReward } from '../stores/profile';
import QrCode from './QrCode';
import QrModal from './QrModal';
import RouletteModal from './RouletteModal';
import TierModal from './TierModal';
import { useT } from '../i18n/useT';

export default function LoyaltyCard() {
  const [showQr, setShowQr] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [showTier, setShowTier] = useState(false);

  // Narrow selectors — the whole-store subscription re-rendered the card
  // (and its QR code subtree) on every profile change.
  const visits = useProfileStore(s => s.visits);
  const loyaltyNumber = useProfileStore(s => s.loyaltyNumber);
  const t = useT();
  const nextReward = getNextReward(visits);
  const previousMilestone = nextReward.visits > 20 ? nextReward.visits - 20 : 0;
  const progressInInterval = visits - previousMilestone;
  const interval = nextReward.visits - previousMilestone;
  const progress = Math.min(progressInInterval / interval, 1);
  const remaining = nextReward.visits - visits;

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
            backgroundColor: '#1B5E3D', borderRadius: 28,
            border: '2px solid #D4A373', padding: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <QrCode data={loyaltyNumber} size={120} iconSize={0} />
        </button>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Reward Progress */}
          <div style={{ flex: 1, position: 'relative' }}>
            <button
              className="btn-reset"
              onClick={() => setShowTier(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 28, border: '2px solid #3B82F6',
                backgroundColor: '#E0F2FE',
                padding: 0, display: 'block', overflow: 'hidden',
                textAlign: 'left', cursor: 'pointer'
              }}
            >
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                width: '100%', height: '100%', padding: '12px 16px', boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 600, color: 'rgba(0,0,0,0.87)', textAlign: 'left' }}>{t('rewards_title')}</span>
                <div style={{ height: 2 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0 }}>
                    <span style={{ fontSize: 'clamp(28px, 7rem, 38px)', fontWeight: 600, color: '#000', lineHeight: 1.1 }}>{visits}</span>
                    <span style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 600, color: 'rgba(0,0,0,0.87)', paddingLeft: 4 }}>/ {nextReward.visits}</span>
                  </div>
                  <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 600, color: 'rgba(0,0,0,0.87)' }}>-{remaining}</span>
                </div>
                
                <div style={{ height: 4, width: '100%', borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden', flexShrink: 0, marginTop: 4 }}>
                  <div style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: '#3B82F6', borderRadius: 2 }} />
                </div>
              </div>
            </button>
          </div>

          <div style={{ height: 12, flexShrink: 0 }} />

          {/* Roulette Button */}
          <div style={{ flex: 1, position: 'relative' }}>
            <button
              className="btn-reset"
              onClick={() => setShowRoulette(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)',
                borderRadius: 28,
                border: '2px solid #A855F7', padding: 0, overflow: 'hidden',
                textAlign: 'left', cursor: 'pointer', display: 'block'
              }}
            >
              <div style={{
                display: 'flex', flexDirection: 'column',
                width: '100%', height: '100%', position: 'relative'
              }}>
                <img 
                  src="/wheel.webp" 
                  alt={t('fortune')} 
                  style={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%) translateY(5%)',
                    width: '95%',
                    height: 'auto',
                    objectFit: 'contain',
                    zIndex: 0
                  }} 
                />
                
                {/* Gradient Shadow Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '60%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  zIndex: 1
                }} />

                {/* Text Container */}
                <div style={{
                  position: 'absolute',
                  bottom: 6, left: 0, right: 0,
                  zIndex: 2,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <span style={{ 
                    fontSize: 'clamp(14px, 4vw, 18px)', 
                    fontWeight: 700, 
                    color: '#FFF',
                    textShadow: '0px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {t('fortune')}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {showQr && <QrModal onClose={() => setShowQr(false)} />}
      {showRoulette && <RouletteModal onClose={() => setShowRoulette(false)} />}
      {showTier && <TierModal onClose={() => setShowTier(false)} />}
    </div>
  );
}
