import { useState } from 'react';
import { useNotificationStore } from '../stores/notification';
import { supabase } from '../lib/supabase';
import NotificationsSheet from './NotificationsSheet';
import { useT } from '../i18n/useT';

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const t = useT();

  return (
    <>
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
            <img
              src="/logo_new.webp"
              alt="Green Chicken"
              style={{
                height: 'clamp(40px, 10rem, 50px)',
                objectFit: 'contain',
                transform: 'translateY(-4px)',
              }}
            />
          </div>

          {/* Right: Expanded(child: Align(centerRight, child: IconButton)) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-reset flex-center"
              onClick={async () => {
                setIsSheetOpen(true);
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  useNotificationStore.getState().fetchNotifications(session.user.id);
                }
              }}
              aria-label={t('home_notifications')}
              style={{
                position: 'relative',
                padding: 'clamp(8px, 2.6rem, 14px)',
              }}
            >
              {/* Flutter: Icons.notifications_none_rounded → U+E7F5 */}
              <span className="icon-material" style={{
                fontSize: 'clamp(28px, 7.1rem, 40px)',
                color: '#FFFFFF',
              }}>
                {'\uE7F5'}
              </span>

              {/* Badge: Positioned(right:-2, top:-2) in Stack(28×28) inside 48×48 button */}
              {/* Icon starts at (10,10) in button → badge at right:48-40=8, top:10-2=8 */}
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  right: 'clamp(4px, 1.5rem, 8px)',
                  top: 'clamp(4px, 1.5rem, 8px)',
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  boxSizing: 'border-box',
                  minWidth: 'clamp(16px, 4.6rem, 24px)',
                  height: 'clamp(16px, 4.6rem, 24px)',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #1B5E3D',
                  fontSize: 'clamp(9px, 2.6rem, 14px)',
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
      
      {isSheetOpen && <NotificationsSheet onClose={() => setIsSheetOpen(false)} />}
    </>
  );
}
