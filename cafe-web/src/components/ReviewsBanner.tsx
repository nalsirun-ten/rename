import review3dImg from '@assets/images/review3_3d.png';
import { useT } from '../i18n/useT';

// ─── Exact copy of Flutter _ReviewsBanner in home_screen.dart ────

interface Props {
  onTap: () => void;
}

export default function ReviewsBanner({ onTap }: Props) {
  const t = useT();
  return (
    <div style={{ padding: '0 16px' }}>
      <h3
        style={{
          fontSize: 'clamp(16px, 4.5rem, 22px)',
          fontWeight: 800,
          letterSpacing: -0.5,
          color: '#000',
          marginBottom: 12,
          paddingLeft: 4,
        }}
      >
        {t('reviews_title')}
      </h3>
      <button
        className="btn-reset"
        onClick={onTap}
        style={{
          width: '100%',
          height: 'calc((min(100rem, 430px) - 56px) / 3)', // perfectly matches ActionCard height
          position: 'relative',
          background: 'linear-gradient(to bottom right, #6A11CB, #2575FC)',
          borderRadius: 36,
          border: '1.5px solid #4A0C9B',
          boxShadow: '0 4px 12px rgba(106, 17, 203, 0.25)',
          textAlign: 'left',
          overflow: 'hidden',
        }}
      >

        {/* Content absolute overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 14,
        }}>
          {/* Icon image — height is 50% of the container's dynamic height */}
          <img
            src={review3dImg}
            alt={t('reviews_title')}
            loading="lazy"
            style={{ height: '50%', width: 'auto', flexShrink: 0, objectFit: 'contain' }}
          />

          {/* Text column */}
          <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 'clamp(17px, 4.3rem, 24px)',
              fontWeight: 800,
              color: '#FFF',
              display: 'block',
              lineHeight: 1.3,
            }}
          >
            {t('reviews_title')}
          </span>
          <span
            style={{
              fontSize: 'clamp(13px, 3.3rem, 18px)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              display: 'block',
              marginTop: 2,
            }}
          >
            {t('reviews_see_all')}
          </span>
        </div>

        {/* Arrow icon */}
        <span
          className="icon-material"
          style={{
            fontSize: 'clamp(18px, 4.6rem, 26px)',
            color: 'rgba(255,255,255,0.7)',
            fontVariationSettings: "'FILL' 0",
            flexShrink: 0,
          }}
        >
          arrow_forward_ios
        </span>
        </div>
      </button>
    </div>
  );
}
