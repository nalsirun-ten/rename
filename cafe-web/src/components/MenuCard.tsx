import { type MenuItem, useMenuStore } from '../stores/menu';

interface Props {
  item: MenuItem;
}

export default function MenuCard({ item }: Props) {
  const toggleFavorite = useMenuStore((s) => s.toggleFavorite);

  return (
    <div style={{
      padding: '12px 0',
      margin: '0 12px',
      borderBottom: '1px solid #CBD5E1',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {/* Left: Image */}
      <div style={{
        flexShrink: 0,
        width: 'clamp(96px, 24.5vw, 140px)',
        height: 'clamp(96px, 24.5vw, 140px)',
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#E2E8F0',
      }}>
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Right: Content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        position: 'relative',
        paddingTop: 2,
        paddingBottom: 2,
      }}>
        <div style={{ paddingRight: 44 }}>
          {/* Title */}
          <h3 style={{
            fontSize: 'clamp(15px, 3.8vw, 21px)',
            fontWeight: 600,
            color: '#0F172A',
            marginBottom: 6,
            marginTop: -4,
            lineHeight: 1.2,
          }}>
            {item.title}
          </h3>
          
          {/* Description */}
          <p style={{
            fontSize: 'clamp(12px, 3.1vw, 16px)',
            fontWeight: 400,
            color: '#64748B',
            marginBottom: 8,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.description}
          </p>
        </div>

        {/* Price */}
        <div style={{ fontSize: 'clamp(15px, 3.8vw, 20px)', fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
          {item.price} <span style={{ fontSize: 'clamp(11px, 2.8vw, 14px)', fontWeight: 700, color: '#64748B', letterSpacing: 0.5 }}>сом</span>
        </div>

        {/* Favorite Button (Absolute Top Right of the right container) */}
        <button
          className="btn-reset flex-center"
          onClick={() => toggleFavorite(item.id)}
          aria-label={item.isFavorite ? "Убрать из избранного" : "В избранное"}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 'clamp(34px, 8.7vw, 48px)',
            height: 'clamp(34px, 8.7vw, 48px)',
            borderRadius: 12,
            border: item.isFavorite ? '1.5px solid #EF4444' : '1.5px solid transparent',
            backgroundColor: item.isFavorite ? '#FEF2F2' : '#EFF6FF',
            transition: 'all 0.2s',
          }}
        >
          <span style={{
            fontFamily: "'Material Icons Round'",
            fontSize: 'clamp(19px, 4.8vw, 26px)',
            color: item.isFavorite ? '#EF4444' : '#3B82F6'
          }}>
            {item.isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>
    </div>
  );
}
