import { useSettingsStore } from '../stores/settings';
import ReviewModal from './ReviewModal';
import { useState } from 'react';

// ─── Inline SVG icons ───────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg style={{ width: 'clamp(32px, 8.2vw, 44px)', height: 'clamp(32px, 8.2vw, 44px)' }} viewBox="0 0 24 24" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg style={{ width: 'clamp(32px, 8.2vw, 44px)', height: 'clamp(32px, 8.2vw, 44px)' }} viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Card config ─────────────────────────────────────────────────────

interface ActionCardConfig {
  title: string;
  icon: React.ReactNode;
  gradient: [string, string];
  borderColor: string;
  onTap: () => void;
}

// ─── QuickActions ────────────────────────────────────────────────────

export default function QuickActions() {
  const get = useSettingsStore((s) => s.get);
  const [showReview, setShowReview] = useState(false);

  const openInstagram = () => {
    const url = get('instagram_url');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openWhatsApp = () => {
    const url = get('whatsapp_url');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cards: ActionCardConfig[] = [
    {
      title: 'Instagram',
      icon: <InstagramIcon />,
      gradient: ['#A144E5', '#D82B7E'],
      borderColor: '#8321AD',
      onTap: openInstagram,
    },
    {
      title: 'WhatsApp',
      icon: <WhatsAppIcon />,
      gradient: ['#25D366', '#128C7E'],
      borderColor: '#0D5E4D',
      onTap: openWhatsApp,
    },
    {
      title: 'Отзыв',
      icon: (
        <span
          className="icon-material"
          style={{
            fontSize: 'clamp(32px, 8.2vw, 44px)',
            fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            color: '#FFF',
          }}
        >
          star
        </span>
      ),
      gradient: ['#F59E0B', '#D97706'],
      borderColor: '#B45309',
      onTap: () => setShowReview(true),
    },
  ];

  return (
    <>
      <div style={{ padding: '0 16px 0 16px' }}>
        {/* ── Section title ── */}
        <h3
          style={{
            fontSize: 'clamp(16px, 4.5vw, 22px)',
            fontWeight: 800,
            letterSpacing: -0.5,
            color: '#000',
            marginBottom: 12,
            paddingLeft: 4,
          }}
        >
          Быстрые действия
        </h3>

        {/* ── Row of 3 cards ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {cards.map((card) => (
            <ActionCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      {/* ── Review Modal ── */}
      {showReview && <ReviewModal onClose={() => setShowReview(false)} />}
    </>
  );
}

// ─── ActionCard ──────────────────────────────────────────────────────
// Exact copy of Flutter _buildAppWidget:
//   AspectRatio(1) → Container(borderRadius:28, gradient, border, shadow)
//     → Padding(h:6, v:8) → Column(icon 32px + text 13px w700)

function ActionCard({ title, icon, gradient, borderColor, onTap }: ActionCardConfig) {
  return (
    <button
      className="btn-reset flex-col"
      onClick={onTap}
      style={{
        flex: 1,
        aspectRatio: '1',
        borderRadius: 36,
        background: `linear-gradient(to bottom right, ${gradient[0]}, ${gradient[1]})`,
        border: `1.5px solid ${borderColor}`,
        boxShadow: `0 4px 12px ${gradient[0]}4D`,
        padding: '8px 6px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {/* Icon — 32px, white */}
      <div className="flex-center">
        {icon}
      </div>

      {/* Label — 13px, w700, white, fits inside square */}
      <span
        style={{
          fontSize: 'clamp(13px, 3.3vw, 18px)',
          fontWeight: 700,
          color: '#FFF',
          letterSpacing: -0.3,
          textAlign: 'center',
          lineHeight: 1,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {title}
      </span>
    </button>
  );
}
