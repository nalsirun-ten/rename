// ─── Exact Flutter icon names via Material Symbols Rounded font ───
// Flutter inactive → Material Symbols FILL=0 (outlined)
// Flutter active   → Material Symbols FILL=1 (filled)
//
// Tab 0: Icons.home_outlined / Icons.home           → "home"
// Tab 1: Icons.store_outlined / Icons.store          → "store"
// Tab 2: Icons.info_outline   / Icons.info           → "info"
// Tab 3: Icons.person_outline / Icons.person         → "person"

interface Props {
  name: 'home' | 'store' | 'info' | 'person';
  filled?: boolean;
  color?: string;
}

import { memo } from 'react';

const BottomNavIcon = memo(function BottomNavIcon({ name, filled, color = '#FFFFFF' }: Props) {
  return (
    <span
      className="icon-material"
      style={{
        fontFamily: "'Material Symbols Rounded'",
        fontSize: 'clamp(24px, 6rem, 32px)',
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        lineHeight: 1,
        display: 'inline-block',
        color,
      }}
    >
      {name}
    </span>
  );
});

export default BottomNavIcon;
