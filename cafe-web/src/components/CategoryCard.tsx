import React from 'react';

interface Props {
  name: string;
  count: number;
  imageUrl?: string;
  onClick: () => void;
}

const hashColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 95%)`;
};

const CategoryCard = React.memo(function CategoryCard({ name, count, imageUrl, onClick }: Props) {
  return (
    <button
      className="btn-reset"
      onClick={onClick}
      style={{
        backgroundColor: hashColor(name),
        borderRadius: 16,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        minHeight: 80,
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        border: '1.5px solid #94A3B8',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        textAlign: 'left',
      }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
      }}
      onPointerUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      {/* Image Container */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={name} 
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'clamp(18px, 4.4rem, 24px)',
          fontWeight: 800,
          color: '#000000',
          lineHeight: 1.3,
          marginBottom: 4,
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 'clamp(14px, 3.8rem, 18px)',
          fontWeight: 600,
          color: '#16A34A',
        }}>
          {count} позиций
        </div>
      </div>
      
      <span className="icon-material" style={{ color: '#94A3B8', fontSize: 24 }}>
        chevron_right
      </span>
    </button>
  );
});

export default CategoryCard;
