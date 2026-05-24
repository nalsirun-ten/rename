import review3dImg from '@assets/images/review3_3d.png';

// ─── Exact copy of Flutter _ReviewsBanner in home_screen.dart ────

interface Props {
  onTap: () => void;
}

export default function ReviewsBanner({ onTap }: Props) {
  return (
    <div style={{ padding: '0 16px' }}>
      <h3
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: -0.5,
          color: '#000',
          marginBottom: 12,
          paddingLeft: 4,
        }}
      >
        Отзывы
      </h3>
      <button
        className="btn-reset"
        onClick={onTap}
        style={{
          width: '100%',
          padding: '28px 20px',
          background: 'linear-gradient(to bottom right, #6A11CB, #2575FC)',
          borderRadius: 36,
          border: '1.5px solid #4A0C9B',
          boxShadow: '0 4px 12px rgba(106, 17, 203, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textAlign: 'left',
        }}
      >
        {/* Icon image — natural aspect ratio, height matches button padding */}
        <img
          src={review3dImg}
          alt="Отзывы"
          style={{ height: 56, width: 'auto', flexShrink: 0, objectFit: 'contain' }}
        />

        {/* Text column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: '#FFF',
              display: 'block',
              lineHeight: 1.3,
            }}
          >
            Отзывы
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              display: 'block',
              marginTop: 2,
            }}
          >
            Смотреть все
          </span>
        </div>

        {/* Arrow icon */}
        <span
          className="icon-material"
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.7)',
            fontVariationSettings: "'FILL' 0",
            flexShrink: 0,
          }}
        >
          arrow_forward_ios
        </span>
      </button>
    </div>
  );
}
