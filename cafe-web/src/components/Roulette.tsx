import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from 'react-dom';
import { useProfileStore } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import confetti from 'canvas-confetti';

// ─── Prizes with weighted probabilities ──────────────────────────────
// Equal segments on wheel (8 × 45°), but weighted random selection
// gives the correct probability distribution.
// Segments ordered so identical prizes are opposite each other (180° apart)
const PRIZES = [
  { label: "Банкрот",              short: "БАНКРОТ",  emoji: "💀", color: "#0F172A", textColor: "#FFFFFF", weight: 20 },
  { label: "Печенье в подарок",     short: "ПЕЧЕНЬЕ",  emoji: "🍪", color: "#FEF3C7", weight: 10 },
  { label: "Бесплатный сироп",     short: "СИРОП",    emoji: "🍯", color: "#E0E7FF", weight: 10 },
  { label: "Скидка 15% на десерты", short: "-15%",     emoji: "🍰", color: "#FCE7F3", weight: 15 },
  { label: "Банкрот",              short: "БАНКРОТ",  emoji: "💀", color: "#0F172A", textColor: "#FFFFFF", weight: 20 },
  { label: "Печенье в подарок",     short: "ПЕЧЕНЬЕ",  emoji: "🍪", color: "#FEF3C7", weight: 10 },
  { label: "Бесплатный сироп",     short: "СИРОП",    emoji: "🍯", color: "#E0E7FF", weight: 10 },
  { label: "Бесплатный десерт",    short: "ДЕСЕРТ",   emoji: "🧁", color: "#D1FAE5", weight: 5 },
];

// ─── Deduplicated prize info for the description cards ───────────────
const PRIZE_DESCRIPTIONS: Record<string, string> = {
  "Банкрот":              "К сожалению, в этот раз без приза. Попробуйте завтра!",
  "Печенье в подарок":    "Вкусное печенье в подарок к вашему заказу",
  "Бесплатный сироп":     "Одна порция сиропа для добавления в кофе",
  "Скидка 15% на десерты": "Скидка 15% на любой десерт из меню",
  "Бесплатный десерт":    "Любой десерт из меню — бесплатно",
};

const PRIZE_INFO: { label: string; emoji: string; description: string; color: string }[] = [];
const seen = new Set<string>();
for (const p of PRIZES) {
  if (!seen.has(p.label)) {
    seen.add(p.label);
    PRIZE_INFO.push({ label: p.label, emoji: p.emoji, description: PRIZE_DESCRIPTIONS[p.label], color: p.color });
  }
}

const NUM = PRIZES.length;
const SLICE_DEG = 360 / NUM;
const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0);

function pickWeightedIndex(): number {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return PRIZES.length - 1;
}

export default function Roulette() {
  const { lastRouletteSpin, recordRouletteSpin, activePrize } = useProfileStore();
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef(0);

  // Defer heavy SVG rendering to avoid blocking the sheet slide-up animation's first frame.
  // The skeleton placeholder preserves correct height → no layout shift → smooth animation.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  }, []);

  const spinWheel = () => {
    if (spinning || !wheelRef.current || alreadySpun) return;

    setSpinning(true);
    setWonPrize(null);

    const prizeIndex = pickWeightedIndex();
    const randomOffset = 3 + Math.random() * (SLICE_DEG - 6);
    const targetDelta = 2880 + (360 - prizeIndex * SLICE_DEG) - randomOffset;
    const newRotation = rotationRef.current + targetDelta;

    const anim = wheelRef.current.animate(
      [
        { transform: `rotate(${rotationRef.current}deg)` },
        { transform: `rotate(${newRotation}deg)` },
      ],
      {
        duration: 5000,
        easing: 'cubic-bezier(0.02, 0.80, 0.10, 1.00)',
        fill: 'forwards',
      }
    );

    rotationRef.current = newRotation;

    anim.onfinish = () => {
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
      }
    };

    setTimeout(async () => {
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
      }
      setSpinning(false);
      const prize = PRIZES[prizeIndex].label;
      setWonPrize(prize);

      if (prize !== 'Банкрот') {
        import('canvas-confetti').then(({ default: confetti }) => {
          const dur = 3000;
          const end = Date.now() + dur;
          const frame = () => {
            confetti({ particleCount: 7, angle: 60, spread: 65, origin: { x: 0, y: 0.6 }, colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FFFFFF'] });
            confetti({ particleCount: 7, angle: 120, spread: 65, origin: { x: 1, y: 0.6 }, colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FFFFFF'] });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
        });
      }

      await recordRouletteSpin(prize);
    }, 5500);
  };

  const hasSpunToday = () => {
    if (!lastRouletteSpin) return false;
    const lastDate = new Date(lastRouletteSpin);
    const today = new Date();
    return lastDate.toDateString() === today.toDateString();
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    if (!hasSpunToday()) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRouletteSpin]);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const prizeExpiryMs = 60 * 60 * 1000; // 1 hour
  const getPrizeTimeLeft = () => {
    if (!lastRouletteSpin || !activePrize || activePrize === 'Банкрот') return 0;
    const spinDate = new Date(lastRouletteSpin).getTime();
    const now = Date.now();
    const elapsed = now - spinDate;
    return Math.max(0, prizeExpiryMs - elapsed);
  };

  const [prizeTimeLeft, setPrizeTimeLeft] = useState(getPrizeTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setPrizeTimeLeft(getPrizeTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRouletteSpin, activePrize]);

  const formatPrizeCountdown = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isPrizeActive = prizeTimeLeft > 0;

  const alreadySpun = hasSpunToday();

  const SIZE = 370;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  
  const R_border_outer = 162;
  const R_border_inner = 150;
  const R_border_center = (R_border_outer + R_border_inner) / 2;
  const R = 150;
  const R_text = 112;

  // ─── Build equal SVG segments ──────────────────────────────────────
  const segments = useMemo(() => PRIZES.map((item, i) => {
    const startAngle = i * SLICE_DEG - 90;
    const endAngle = (i + 1) * SLICE_DEG - 90;
    
    const startRad = startAngle * (Math.PI / 180);
    const endRad = endAngle * (Math.PI / 180);

    const x1 = CX + R * Math.cos(startRad);
    const y1 = CY + R * Math.sin(startRad);
    const x2 = CX + R * Math.cos(endRad);
    const y2 = CY + R * Math.sin(endRad);
    const largeArc = SLICE_DEG > 180 ? 1 : 0;

    const midAngle = i * SLICE_DEG + SLICE_DEG / 2;

    return (
      <g key={i}>
        <path
          d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={item.color}
          stroke="none"
        />
        <g transform={`rotate(${midAngle} ${CX} ${CY})`}>
          <text
            x={CX}
            y={CY - 112}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="26"
          >
            {item.emoji}
          </text>
          <text
            x={CX}
            y={CY - 78}
            textAnchor="middle"
            dominantBaseline="central"
            fill={item.textColor || "#1E293B"}
            fontSize="8.5"
            fontWeight="800"
            fontFamily="'Outfit', sans-serif"
            style={{ letterSpacing: '0.6px' }}
          >
            {item.short.toUpperCase()}
          </text>
        </g>
        <line
          x1={CX} y1={CY} x2={x1} y2={y1}
          stroke="#F59E0B"
          strokeWidth="1"
          opacity="0.8"
        />
      </g>
    );
  }), []);

  const borderLights = useMemo(() => Array.from({ length: 24 }).map((_, idx) => {
    const angle = idx * 15;
    const rad = angle * (Math.PI / 180);
    const lx = CX + R_border_center * Math.cos(rad);
    const ly = CY + R_border_center * Math.sin(rad);
    return (
      <circle
        key={idx}
        cx={lx}
        cy={ly}
        r={2.5}
        fill="url(#goldLightGradient)"
      />
    );
  }), []);

  // Skeleton placeholder — preserves layout height while heavy SVG rasterizes on GPU layer.
  // This prevents the first animation frame from being blocked by SVG parsing/painting.
  if (!mounted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 8px', width: '100%' }}>
        <div style={{ width: 410, height: 410, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #1E3A5F, #0F2B4C, #0A1A33)', opacity: 0.6 }} />
        <div style={{ height: 16 }} />
        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 340 }}>
          <div style={{ flex: 1, height: 52, borderRadius: 16, background: '#E2E8F0', opacity: 0.4 }} />
          <div style={{ flex: 1, height: 52, borderRadius: 16, background: '#1E293B', opacity: 0.4 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 8px', justifyContent: 'flex-start',
      overflowX: 'hidden', width: '100%',
      position: 'relative'
    }}>

      {/* Wheel Assembly */}
      <div
        style={{
          position: 'relative',
          width: SIZE + 40,
          height: SIZE + 40,
          marginBottom: 4,
        }}
      >
        {/* Static Dark Blue Backing Circle */}
        <svg
          width={SIZE + 40}
          height={SIZE + 40}
          viewBox={`0 0 ${SIZE + 40} ${SIZE + 40}`}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
        >
          <defs>
            <radialGradient id="backingBlueGradient" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="50%" stopColor="#0F2B4C" />
              <stop offset="100%" stopColor="#0A1A33" />
            </radialGradient>
            <radialGradient id="backingRingShadow" cx="50%" cy="50%" r="50%">
              <stop offset="92%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
            </radialGradient>
          </defs>
          <circle cx={SIZE / 2 + 20} cy={SIZE / 2 + 20} r={R_border_outer + 14} fill="url(#backingBlueGradient)" />
          <circle cx={SIZE / 2 + 20} cy={SIZE / 2 + 20} r={R_border_outer + 14} fill="url(#backingRingShadow)" />
          <circle cx={SIZE / 2 + 20} cy={SIZE / 2 + 20} r={R_border_outer + 14} fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
          <path
            d={`M ${SIZE / 2 + 20 - (R_border_outer + 12) * 0.707} ${SIZE / 2 + 20 - (R_border_outer + 12) * 0.707}
                A ${R_border_outer + 12} ${R_border_outer + 12} 0 0 1
                ${SIZE / 2 + 20 + (R_border_outer + 12) * 0.707} ${SIZE / 2 + 20 - (R_border_outer + 12) * 0.707}`}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round"
          />
        </svg>

        {/* Rotating Wheel */}
        <svg
          ref={wheelRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ willChange: 'transform', position: 'absolute', top: 20, left: 20, zIndex: 5 }}
        >
          <defs>
            <linearGradient id="segmentShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
            </linearGradient>
            <radialGradient id="goldLightGradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FFEA7D" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </radialGradient>
          </defs>

          <clipPath id="wheelClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <g clipPath="url(#wheelClip)">
            {segments}
          </g>

          <circle cx={CX} cy={CY} r={R_border_center} fill="none" stroke="#1E3A5F" strokeWidth={R_border_outer - R_border_inner} />
          <circle cx={CX} cy={CY} r={R_border_outer} fill="none" stroke="#1E40AF" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={R_border_inner} fill="none" stroke="#1E40AF" strokeWidth="1" />

          {borderLights}
        </svg>

        {/* Static Overlay: Arrow + Bezel */}
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            position: 'absolute', top: 20, left: 20, zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="arrowGoldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="arrowInnerGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE88A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <circle cx={CX} cy={CY} r={R_border_outer} fill="none" stroke="#1E40AF" strokeWidth="1.5" opacity="0.3" />

          <g>
            <path
              d={`M ${CX - 12} 12 L ${CX + 12} 12 L ${CX + 6} 36 L ${CX} 40 L ${CX - 6} 36 Z`}
              fill="url(#arrowGoldGradient)" stroke="#8B6914" strokeWidth="1.2"
            />
            <path
              d={`M ${CX - 8} 14 L ${CX + 8} 14 L ${CX + 4} 34 L ${CX} 37 L ${CX - 4} 34 Z`}
              fill="url(#arrowInnerGold)"
            />
            <path
              d={`M ${CX} 28 L ${CX + 2} 36 L ${CX} 39.5 L ${CX - 2} 36 Z`}
              fill="#FFFFFF" opacity="0.85"
            />
            <circle cx={CX} cy={12} r={3} fill="#FFE88A" stroke="#8B6914" strokeWidth="0.8" />
          </g>
        </svg>

        {/* Center Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            spinWheel();
          }}
          disabled={spinning || alreadySpun}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 100, height: 100, borderRadius: '50%',
            background: (spinning || alreadySpun)
              ? 'radial-gradient(circle at 35% 35%, #475569, #334155)'
              : 'radial-gradient(circle at 35% 35%, #1E3A5F, #0A1A33)',
            border: (spinning || alreadySpun) ? '3px solid #64748B' : '3px solid #F59E0B',
            boxShadow: (spinning || alreadySpun)
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 8px 24px rgba(30,58,95,0.5), 0 0 0 4px rgba(245,158,11,0.15), inset 0 2px 4px rgba(255,255,255,0.15)',
            cursor: (spinning || alreadySpun) ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 20, touchAction: 'manipulation', transform: 'translate(-50%, -50%)',
            WebkitTapHighlightColor: 'transparent', outline: 'none', padding: 0,
          }}
        >
          {alreadySpun ? (
            <>
              <span style={{
                fontSize: 16, fontWeight: 900, color: '#F59E0B',
                fontFamily: "'Courier New', monospace", letterSpacing: '0.5px',
                textAlign: 'center', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.3)', lineHeight: 1,
              }}>
                {formatCountdown(timeLeft)}
              </span>
              <span style={{
                fontSize: 7, fontWeight: 700, color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2,
              }}>
                до сброса
              </span>
            </>
          ) : (
            <>
              <span style={{
                fontSize: 11, fontWeight: 800,
                color: spinning ? '#94A3B8' : '#FFD700',
                letterSpacing: '1px', textTransform: 'uppercase',
                textAlign: 'center', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}>
                {spinning ? 'КРУТИМ' : 'КРУТИТЬ'}
              </span>
              {!spinning && <span style={{ fontSize: 11, marginTop: 4 }}>🎰</span>}
            </>
          )}
        </button>
      </div>

      {/* Prizes Modal */}
      {showPrizesModal && <PrizesModal onClose={() => setShowPrizesModal(false)} />}

      {/* Prize Result */}
      {wonPrize && (
        <div style={{
          background: wonPrize === 'Банкрот' ? '#0F172A' : '#15803D',
          border: wonPrize === 'Банкрот' ? '2px solid #EF4444' : '2px solid #22C55E',
          padding: '16px 24px', borderRadius: 20, marginBottom: 20,
          textAlign: 'center', animation: 'stamps-modal-slide-up 0.4s ease-out',
          width: '100%', maxWidth: 320, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: wonPrize === 'Банкрот' ? '#EF4444' : '#22C55E', marginBottom: 4 }}>
            {wonPrize === 'Банкрот' ? '😞 Банкрот!' : '🎉 Поздравляем!'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF' }}>
            {wonPrize === 'Банкрот' ? 'Повезёт в следующий раз' : `Вы выиграли ${wonPrize}`}
          </div>
          {wonPrize !== 'Банкрот' && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              Покажите экран баристе для получения приза
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 340, marginTop: 4 }}>
        <button
          onClick={() => setShowPrizesModal(true)}
          className="btn-reset"
          style={{ flex: 1, padding: '14px 16px', borderRadius: 16, backgroundColor: '#E2E8F0', color: '#1E293B', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span className="icon-material" style={{ fontSize: 20 }}>info</span>
          Условия
        </button>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="btn-reset"
          style={{ flex: 1, padding: '14px 16px', borderRadius: 16, backgroundColor: '#1E293B', color: '#FFFFFF', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span className="icon-material" style={{ fontSize: 20 }}>history</span>
          Мои выигрыши
        </button>
      </div>

      {/* History Modal */}
      {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} isPrizeActive={isPrizeActive} activePrize={activePrize} prizeTimeLeft={prizeTimeLeft} formatPrizeCountdown={formatPrizeCountdown} />}

    </div>
  );
}

// ─── Module-level sub-components with swipe-to-close ─────────────────
// Extracted outside Roulette to prevent re-creation on every parent re-render

function PrizesModal({ onClose }: { onClose: () => void }) {
  const sheetRef = useSwipeToClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={onClose} style={{ zIndex: 99999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{ display: 'flex', flexDirection: 'column', height: '70vh', backgroundColor: '#F9FAFC' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 16px 16px', flexShrink: 0 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#1E293B' }}>Что можно выиграть?</h3>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
            <span className="icon-material" style={{ fontSize: 24, color: '#64748B' }}>close</span>
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 24px', animation: 'stamps-modal-fade-in 0.2s ease-out' }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Правила игры</h4>
            <ul style={{ paddingLeft: 20, margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Вы можете крутить Фортуну 1 раз в сутки.</li>
              <li>Для получения приза необходимо совершить любой заказ в кофейне (забрать приз без покупки нельзя).</li>
              <li>Выигрыш действителен ровно <strong>1 час</strong> после прокрутки барабана.</li>
              <li>Покажите таймер баристе до истечения времени.</li>
              <li>Призы не суммируются с другими акциями и скидками.</li>
            </ul>
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Призы</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {PRIZE_INFO.map((info) => (
              <div
                key={info.label}
                style={{
                  display: 'flex', flexDirection: 'column',
                  background: info.color,
                  borderRadius: 20,
                  padding: '16px 14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: info.label === 'Банкрот' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  backgroundColor: info.label === 'Банкрот' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: info.label === 'Банкрот' ? 'inset 0 1px 2px rgba(255,255,255,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: info.label === 'Банкрот' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
                }}>
                  <span style={{ fontSize: 24 }}>{info.emoji}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    fontSize: 14, fontWeight: 800,
                    color: info.label === 'Банкрот' ? '#FFFFFF' : '#1E293B',
                    marginBottom: 6, lineHeight: 1.2
                  }}>
                    {info.label}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: info.label === 'Банкрот' ? '#94A3B8' : '#64748B',
                    lineHeight: 1.35, fontWeight: 500
                  }}>
                    {info.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function HistoryModal({ onClose, isPrizeActive, activePrize, prizeTimeLeft, formatPrizeCountdown }: {
  onClose: () => void;
  isPrizeActive: boolean;
  activePrize: string | null;
  prizeTimeLeft: number;
  formatPrizeCountdown: (ms: number) => string;
}) {
  const sheetRef = useSwipeToClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={onClose} style={{ zIndex: 99999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 16px 16px', flexShrink: 0 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#1E293B' }}>Мои выигрыши</h3>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
            <span className="icon-material" style={{ fontSize: 24, color: '#64748B' }}>close</span>
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 24px' }}>
          {isPrizeActive ? (
            <div style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: 20, padding: 20, color: '#FFF',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0
              }}>
                {PRIZE_INFO.find(p => p.label === activePrize)?.emoji || '🎁'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800, opacity: 0.9, marginBottom: 4 }}>
                  Активный приз
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>
                  {activePrize}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>
                  <span className="icon-material" style={{ fontSize: 16, marginRight: 6 }}>schedule</span>
                  Истекает через: {formatPrizeCountdown(prizeTimeLeft)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '40px 20px', backgroundColor: '#F8FAFC', borderRadius: 20,
              border: '2px dashed #E2E8F0'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>😢</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                У вас пока нет выигрышей
              </div>
              <div style={{ fontSize: 14, color: '#94A3B8' }}>
                Крутите колесо Фортуны каждый день, чтобы получать классные призы!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
