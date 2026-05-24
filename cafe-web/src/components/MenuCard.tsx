import { type MenuItem, useMenuStore } from '../stores/menu';

interface Props {
  item: MenuItem;
}

export default function MenuCard({ item }: Props) {
  const toggleFavorite = useMenuStore((s) => s.toggleFavorite);

  return (
    <div style={{
      padding: '12px 0',
      margin: '0 20px',
      borderBottom: '1px solid #CBD5E1',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {/* Left: Image */}
      <div style={{
        flexShrink: 0,
        width: 104,
        height: 104,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 16,
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
            fontSize: 16,
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
            fontSize: 13,
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
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
          {item.price} <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5 }}>сом</span>
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
            width: 36,
            height: 36,
            borderRadius: 12,
            border: item.isFavorite ? '1.5px solid #EF4444' : '1.5px solid transparent',
            backgroundColor: item.isFavorite ? '#FEF2F2' : '#EFF6FF',
            transition: 'all 0.2s',
          }}
        >
          <span style={{
            fontFamily: "'Material Icons Round'",
            fontSize: 20,
            color: item.isFavorite ? '#EF4444' : '#3B82F6'
          }}>
            {item.isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>
    </div>
  );
}
