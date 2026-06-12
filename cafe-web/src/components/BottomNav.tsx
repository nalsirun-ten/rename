import { memo } from 'react';
import { useNavigationStore } from '../stores/navigation';
import BottomNavIcon from './BottomNavIcon';
import { useT } from '../i18n/useT';

const TAB_KEYS = ['nav_home', 'nav_menu', 'nav_branches', 'nav_profile'] as const;
const TAB_ICONS = ['local_cafe', 'delivery_dining', 'store', 'person'] as const;

// 🔁 Exact copy of Flutter MainShell._buildBottomNav + _buildNavTab
// Structure:
//   SafeArea
//    → Padding(bottom:8, left:16, right:16)
//      → Align(bottomCenter, width: fill)
//        → ClipRRect(radius:32) → BackdropFilter(blur:16)
//          → Container(bg:#1E293B@85%, border:white@10%, shadow)
//            → Padding(h:8, v:8)
//              → Row(spaceBetween)
//                → NavTab × 4

export default memo(function BottomNav() {
  const { activeTab, setActiveTab } = useNavigationStore();
  const t = useT();

  return (
    <div
      style={{
        // ── SafeArea + Padding(bottom:8, left:16, right:16) ──
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // Safe area for notched phones (env variable)
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex',
        // ── Align(bottomCenter) ──
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          // ── ClipRRect + BackdropFilter + Container ──
          width: '100%',
          borderRadius: 32,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(30, 41, 59, 0.94)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          // ── Inner Padding(h:8, v:8) ──
          padding: '8px 8px',
          // ── Row(spaceBetween) ──
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
        }}
      >
        {TAB_ICONS.map((icon, index) => {
          const isActive = activeTab === index;
          return (
            <button
              key={icon}
              className="btn-reset flex-center"
              onClick={() => setActiveTab(index)}
              aria-label={t(TAB_KEYS[index])}
              aria-selected={isActive}
              style={{
                gap: isActive ? 8 : 0,
                padding: '12px 14px',
                borderRadius: 100,
                // Scoped transitions — `all` animated every inherited prop and
                // forced extra style recalcs right when the tab content swaps.
                transition: 'background 200ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1), gap 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                minWidth: 'clamp(48px, 12.3rem, 68px)',
                minHeight: 'clamp(48px, 12.3rem, 68px)',
                background: isActive ? '#3B82F6' : 'transparent',
                boxShadow: isActive
                  ? '0 4px 12px rgba(59, 130, 246, 0.40)'
                  : 'none',
              }}
            >
              {/* Icon(size:24) */}
              <BottomNavIcon
                name={icon}
                filled={isActive}
                color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
              />

              {/* AnimatedSize → SizedBox(width: isActive ? null : 0) → Padding(left:8) → Text */}
              <span
                style={{
                  fontSize: 'clamp(14px, 3.6rem, 20px)',
                  fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  color: isActive ? '#FFFFFF' : 'transparent',
                  whiteSpace: 'nowrap',
                  transition: 'max-width 300ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                  maxWidth: isActive ? 'clamp(80px, 20.5rem, 120px)' : 0,
                  opacity: isActive ? 1 : 0,
                  overflow: 'hidden',
                  paddingLeft: isActive ? 0 : 0,
                }}
              >
                {t(TAB_KEYS[index])}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
