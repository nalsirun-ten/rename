import { useState, useCallback, useEffect } from 'react';
import { useProfileStore } from '../stores/profile';
import coffeeCup3d from '@assets/images/coffee_cup_3d.png';
import giftCup3d from '@assets/images/gift_cup_3d.png';

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
  const gold = '#FFD700';
  const dark = '#2C303A';

  // ─── FILLED: dark circle + image + checkmark overlay ───
  if (isFilled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 auto', padding: '0 2px', width: `${100 / COLS}%`, maxWidth: 72 }}>
        <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            borderRadius: '50%', backgroundColor: dark,
            border: '1px solid rgba(255,255,255,0.15)'
          }} className="flex-center">
            <img src={assetPath} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
          </div>
          {/* Checkmark overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%'
          }}>
            <span className="icon-material" style={{ 
              fontSize: 38, 
              color: '#34D399', 
              fontWeight: 900,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              check
            </span>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#FFF', lineHeight: 1, marginTop: 3 }}>
          {index + 1}
        </span>
      </div>
    );
  }

  // ─── NEXT: spinning dashed ring + sparkle glow + dark circle + image ───
  if (isNext) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 auto', padding: '0 2px', width: `${100 / COLS}%`, maxWidth: 72 }}>
        <div style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
          {/* Spinning dashed ring (Replaces Lottie) */}
          <svg style={{ 
            position: 'absolute', inset: -5, width: 'calc(100% + 10px)', height: 'calc(100% + 10px)', 
            animation: 'spin-dashed 6s linear infinite', zIndex: 1, pointerEvents: 'none' 
          }}>
            <circle cx="50%" cy="50%" r="calc(50% - 2px)" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeDasharray="10 8" strokeLinecap="round" />
          </svg>

          {/* Inner token */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            borderRadius: '50%', backgroundColor: dark,
            border: '1.5px solid rgba(255,255,255,0.4)'
          }} className="flex-center">
            <img src={assetPath} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain', opacity: 1 }} />
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#FFF', lineHeight: 1, marginTop: 3 }}>
          {index + 1}
        </span>
      </div>
    );
  }

  // ─── UNFILLED: dark circle + faint border + image at 0.35 opacity ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 auto', padding: '0 2px', width: `${100 / COLS}%`, maxWidth: 72 }}>
      <div style={{ width: '100%', aspectRatio: '1' }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          backgroundColor: dark,
          border: '1px solid rgba(255,255,255,0.15)'
        }} className="flex-center">
          <img src={assetPath} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain', opacity: 1 }} />
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: '#FFF', lineHeight: 1, marginTop: 3 }}>
        {index + 1}
      </span>
    </div>
  );
}

// ─── Info Modal ─────────────────────────────────────────────────────

const INFO_RULES = [
  'Совершайте покупки в нашем кафе и получайте отметки за каждый визит.',
  'Соберите 8 отметок и получите любой кофе бесплатно.',
  'Отметки сохраняются в вашем профиле и не сгорают.',
  'Вы можете отслеживать свой прогресс на главном экране.',
];

function StampsInfoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleOverlay = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div className="stamps-modal-overlay overlay-base" onClick={handleOverlay}>
      <div className="stamps-modal-sheet sheet-base" style={{ maxHeight: '90vh', overflowY: 'auto', borderTopLeftRadius: 24, borderTopRightRadius: 24, border: '1px solid #E2E8F0', padding: 24 }}>
        <div className="drag-handle" />
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>Как это работает</h3>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#64748B', lineHeight: 1.6, marginBottom: 20 }}>
          Мы ценим каждого гостя! Совершайте покупки и получайте любимый кофе в подарок.
        </p>
        {INFO_RULES.map((rule, i) => (
          <div key={i} style={{ display: 'flex', marginBottom: i < INFO_RULES.length - 1 ? 12 : 0 }}>
            <div className="flex-center" style={{
              width: 28, height: 28, borderRadius: '50%', backgroundColor: '#F97316',
              flexShrink: 0, marginTop: 2,
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#FFF' }}>{i + 1}</span>
            </div>
            <div style={{ width: 12, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1E293B', lineHeight: 1.45, flex: 1 }}>
              {rule}
            </span>
          </div>
        ))}
        <button className="btn-reset" onClick={onClose} style={{
          marginTop: 24, width: '100%', padding: '14px 0', borderRadius: 16,
          backgroundColor: '#1B5E3D', color: '#FFF', fontSize: 16, fontWeight: 700,
        }}>
          Понятно
        </button>
      </div>
    </div>
  );
}

// ─── StampsProgress ─────────────────────────────────────────────────

export default function StampsProgress() {
  const { visits } = useProfileStore();
  const filled = Math.min(visits % TOTAL, TOTAL);
  const isComplete = filled >= TOTAL;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {/* ── Flutter: Padding(bottom:16) → Column ── */}
      <div style={{ paddingBottom: 16 }}>
        {/* ── Title: Padding(horizontal:20) → Text fontSize:19 w800 ── */}
        <div style={{ padding: '0 20px' }}>
          <h3 style={{
            fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
            color: '#000', marginBottom: 12,
          }}>
            Кофе за наш счёт
          </h3>
        </div>

        {/* ── Card: Padding(horizontal:16) → Stack ── */}
        <div style={{ padding: '0 16px' }}>
          <button
            className="btn-reset"
            onClick={() => setShowInfo(true)}
            style={{
              position: 'relative', width: '100%', height: 264,
              textAlign: 'left', overflow: 'visible',
            }}
          >
            {/* Card background (rounded rectangle, border) */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 36,
              background: 'linear-gradient(135deg, #1B5E3D 0%, #123F29 100%)',
              border: '3.5px solid #123F29',
              boxShadow: '0 6px 12px rgba(26,18,11,0.12)',
            }} />

            {/* Content layer — grid of stamps and progress bar */}
            <div style={{
              position: 'relative', zIndex: 1,
              padding: '24px 20px', height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Inner wrapper to keep progress bar and grid perfectly aligned on the sides */}
              <div style={{
                width: '100%', maxWidth: 324,
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

                {/* ── Progress Bar ── */}
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                      {isComplete ? 'Ура! Подарок ваш!' : `Собрано ${filled} из ${TOTAL}`}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: isComplete ? '#FFD700' : '#FFF' }}>
                      {isComplete ? '100%' : `Осталось ${TOTAL - filled}`}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${isComplete ? 100 : (filled / TOTAL) * 100}%`, 
                      height: '100%', 
                      backgroundColor: isComplete ? '#FFD700' : '#34D399', 
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                      boxShadow: isComplete ? '0 0 8px rgba(255,215,0,0.5)' : 'none'
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
