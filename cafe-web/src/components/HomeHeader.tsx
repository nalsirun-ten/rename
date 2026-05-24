import { useNotificationStore } from '../stores/notification';

// ─── Literal translation of Flutter HomeHeader, line by line ───
//
// Flutter:                    React:
// ───────────────────────     ──────────────────────
// EdgeInsets.only(           padding: '0 8px 4px 16px'
//   left:16, right:8,
//   bottom:4)
// Row(spaceBetween)          display:flex, justifyContent:space-between
// Expanded+SizedBox          <div style={{flex:1}} />
// Flexible+FittedBox+Text    <div style={{flex:1, display:flex, justifyContent:center}}>
//                              <span>Grand Hotel 30px white</span>
//                            </div>
// Expanded+Align(centerRight) <div style={{flex:1, display:flex, justifyContent:flex-end}}>
// IconButton(icon:Stack(...)) <button style={{position:relative}}>
//                              bell 28px
//                              badge (if count>0)
//                            </button>

export default function HomeHeader() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <div style={{
      padding: '12px 8px 4px 16px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: '#1B5E3D',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left: Expanded(child: SizedBox()) */}
        <div style={{ flex: 1 }} />

        {/* Center: Flexible(child: FittedBox(scaleDown, child: Text)) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{
            fontFamily: "'Grand Hotel'",
            fontSize: 30,
            color: '#FFFFFF',
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            Cafe
          </span>
        </div>

        {/* Right: Expanded(child: Align(centerRight, child: IconButton)) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-reset flex-center"
            onClick={() => {}}
            aria-label="Уведомления"
            style={{
              position: 'relative',
              padding: 10,
            }}
          >
            {/* Flutter: Icons.notifications_none_rounded → U+E7F5 in Material Icons Round */}
            <span className="icon-material" style={{
              fontFamily: "'Material Icons Round'",
              fontSize: 28,
              color: '#FFFFFF',
            }}>
              {'\uE7F5'}
            </span>

            {/* Badge: Positioned(right:-2, top:-2) in Stack(28×28) inside 48×48 button */}
            {/* Icon starts at (10,10) in button → badge at right:48-40=8, top:10-2=8 */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                right: 6,
                top: 6,
                backgroundColor: '#EF4444',
                borderRadius: 10,
                boxSizing: 'border-box',
                minWidth: 18,
                height: 18,
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #1B5E3D',
                fontSize: 10,
                fontWeight: 700,
                color: '#FFF',
                lineHeight: 1,
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
