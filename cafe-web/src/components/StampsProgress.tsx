import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore } from '../stores/profile';
import coffeeCup3d from '@assets/images/coffee_cup_3d.png';
import giftCup3d from '@assets/images/gift_cup_3d.png';
import { useT } from '../i18n/useT';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSwipeToClose } from '../hooks/useSwipeToClose';

// ─── Constants ──────────────────────────────────────────────────────
const TOTAL = 8;
const COLS = 4;
const ROWS = Math.ceil(TOTAL / COLS);

// ─── StampItem ──────────────────────────────────────────────────────

function StampItem({
  index,
  isFilled,
  isNext,
  isGift,
}: {
  index: number;
  isFilled: boolean;
  isNext: boolean;
  isGift: boolean;
}) {
  const assetPath = isGift ? giftCup3d : coffeeCup3d;
  const dark = isGift ? '#3B82F6' : '#2C303A';

  if (isFilled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 auto', padding: '0 2px', width: `${100 / COLS}%`, maxWidth: 72 }}>
        <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            borderRadius: '50%', backgroundColor: dark,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: isGift ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
          }} className="flex-center">
            <img src={assetPath} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
          </div>
          {(!isGift || isFilled) && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
            }}>
              <span className="icon-material" style={{
                fontSize: 'clamp(38px, 9.7rem, 52px)',
                color: '#34D399',
                fontWeight: 900,
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}>
                check
              </span>
            </div>
          )}
        </div>
        <span style={{ fontSize: 'clamp(10px, 2.5rem, 14px)', fontWeight: 800, color: '#FFF', lineHeight: 1, marginTop: 3 }}>
          {index + 1}
        </span>
      </div>
    );
  }

  if (isNext) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 auto', padding: '0 2px', width: `${100 / COLS}%`, maxWidth: 72 }}>
        <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
          {!isGift && (
            <svg
              viewBox="0 0 100 100"
              style={{
                position: 'absolute', inset: -5, width: 'calc(100% + 10px)', height: 'calc(100% + 10px)',
                animation: 'spin-dashed 6s linear infinite', zIndex: 1, pointerEvents: 'none',
                willChange: 'transform', transformOrigin: '50% 50%',
              }}
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 15.1327" strokeLinecap="round" />
            </svg>
          )}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            borderRadius: '50%', backgroundColor: dark,
            border: '1.5px solid rgba(255,255,255,0.4)',
            boxShadow: isGift ? '0 0 20px rgba(59, 130, 246, 0.9)' : 'none',
            animation: isGift ? 'pulse-gift 1.5s infinite' : 'none',
          }} className="flex-center">
            <img src={assetPath} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain', opacity: 1 }} />
          </div>
          <style>
            {`
              @keyframes pulse-gift {
                0% { transform: scale(1); box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); }
                50% { transform: scale(1.08); box-shadow: 0 0 25px rgba(59, 130, 246, 1); }
                100% { transform: scale(1); box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); }
              }
            `}
          </style>
        </div>
        <span style={{ fontSize: 'clamp(10px, 2.5rem, 14px)', fontWeight: 800, color: '#FFF', lineHeight: 1, marginTop: 3 }}>
          {index + 1}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 auto', padding: '0 2px', width: `${100 / COLS}%`, maxWidth: 72 }}>
      <div style={{ width: '100%', aspectRatio: '1' }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          backgroundColor: dark,
          border: '1px solid rgba(255,255,255,0.15)',
        }} className="flex-center">
          <img src={assetPath} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain', opacity: 1 }} />
        </div>
      </div>
      <span style={{ fontSize: 'clamp(10px, 2.5rem, 14px)', fontWeight: 800, color: '#FFF', lineHeight: 1, marginTop: 3 }}>
        {index + 1}
      </span>
    </div>
  );
}

// ─── Info Modal ─────────────────────────────────────────────────────

const INFO_RULE_KEYS = [
  'stamps_rule_1',
  'stamps_rule_2',
  'stamps_rule_3',
  'stamps_rule_4',
] as const;

function StampsInfoModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);
  const sheetRef = useSwipeToClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base flex-col" style={{ padding: '24px 16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>{t('stamps_how_it_works')}</h3>
        <p style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 500, color: '#64748B', lineHeight: 1.6, marginBottom: 20 }}>
          {t('stamps_desc')}
        </p>
        {INFO_RULE_KEYS.map((key, i) => (
          <div key={key} style={{ display: 'flex', marginBottom: i < INFO_RULE_KEYS.length - 1 ? 12 : 0 }}>
            <div className="flex-center" style={{
              width: 28, height: 28, borderRadius: '50%', backgroundColor: '#F97316',
              flexShrink: 0, marginTop: 2,
            }}>
              <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 800, color: '#FFF' }}>{i + 1}</span>
            </div>
            <div style={{ width: 12, flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 500, color: '#1E293B', lineHeight: 1.45, flex: 1 }}>
              {t(key)}
            </span>
          </div>
        ))}
        <button className="btn-reset" onClick={onClose} style={{
          marginTop: 24, width: '100%', padding: '14px 0', borderRadius: 16,
          backgroundColor: '#1B5E3D', color: '#FFF', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700,
        }}>
          {t('understand')}
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── StampsProgress ─────────────────────────────────────────────────

export default function StampsProgress() {
  const { stamps } = useProfileStore();
  const filled = Math.min(stamps, TOTAL);
  const isComplete = filled >= TOTAL;
  const [showInfo, setShowInfo] = useState(false);
  const t = useT();

  return (
    <>
      <div style={{ paddingBottom: 16 }}>
        <div style={{ padding: '0 16px' }}>
          <h3 style={{
            fontSize: 'clamp(16px, 4.5rem, 22px)',
            fontWeight: 800,
            color: '#000', marginBottom: 12,
          }}>
            {t('stamps_title')}
          </h3>
        </div>

        <div style={{ padding: '0 16px' }}>
          <button
            className="btn-reset"
            onClick={() => setTimeout(() => setShowInfo(true), 10)}
            style={{
              position: 'relative', width: '100%', height: 'clamp(264px, 67.6rem, 360px)',
              textAlign: 'left', overflow: 'visible',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 36,
              background: 'linear-gradient(135deg, #1B5E3D 0%, #123F29 100%)',
              border: '3.5px solid #123F29',
              boxShadow: '0 6px 12px rgba(26,18,11,0.12)',
            }} />

            <div style={{
              position: 'relative', zIndex: 1,
              padding: '24px 16px', height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                width: '100%', maxWidth: 'clamp(324px, 83rem, 440px)',
                display: 'flex', flexDirection: 'column',
                height: '100%',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  {Array.from({ length: ROWS }, (_, row) => (
                    <div key={row} style={{ display: 'flex', justifyContent: 'center', gap: 12, width: '100%' }}>
                      {Array.from({ length: COLS }, (_, col) => {
                        const idx = row * COLS + col;
                        if (idx >= TOTAL) return <div key={idx} />;
                        const isFilled = idx < filled || (isComplete && idx === TOTAL - 1);
                        const isNext = idx === filled && !isComplete;
                        const isGift = idx === TOTAL - 1;
                        return (
                          <StampItem
                            key={idx}
                            index={idx}
                            isFilled={isFilled}
                            isNext={isNext}
                            isGift={isGift}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <span style={{ fontSize: 'clamp(13px, 3.3rem, 18px)', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                      {filled >= TOTAL - 1 ? t('stamps_hooray') : t('stamps_collected', { collected: filled, total: TOTAL - 1 })}
                    </span>
                    <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 800, color: filled >= TOTAL - 1 ? '#FFD700' : '#FFF' }}>
                      {filled >= TOTAL - 1 ? '100%' : t('stamps_remaining', { remaining: TOTAL - 1 - filled })}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${filled >= TOTAL - 1 ? 100 : (filled / (TOTAL - 1)) * 100}%`,
                      height: '100%',
                      backgroundColor: filled >= TOTAL - 1 ? '#FFD700' : '#34D399',
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                      boxShadow: isComplete ? '0 0 8px rgba(255,215,0,0.5)' : 'none',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showInfo && <StampsInfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
}
