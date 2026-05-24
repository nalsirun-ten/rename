interface Props {
  emoji: string;
  title: string;
}

export default function PlaceholderPage({ emoji, title }: Props) {
  return (
    <div className="flex-center" style={{ flex: 1, color: '#94A3B8', fontSize: 18 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>{emoji}</span>
        <p>{title}</p>
      </div>
    </div>
  );
}
