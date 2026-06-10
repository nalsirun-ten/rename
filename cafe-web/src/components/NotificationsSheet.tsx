import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotificationStore } from '../stores/notification';
import { useProfileStore } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';


interface Props {
  onClose: () => void;
}


export default function NotificationsSheet({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { notifications, markAsRead, fetchMoreNotifications, isLoadingMore } = useNotificationStore();
  const { id: profileId } = useProfileStore();
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useLockBodyScroll();
  const handleOverlayClick = useOverlayClose(onClose);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && profileId) {
      fetchMoreNotifications(profileId);
    }
  };

  return createPortal(
    <div
      className="rs-overlay overlay-base"
      onClick={handleOverlayClick}
      style={{ zIndex: 9999 }}
    >
      <div
        ref={sheetRef}
        className="rs-sheet flex-col"
        style={{
          width: '100%', maxWidth: 430,
          height: '75vh',
          backgroundColor: '#F8F9FB',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div className="flex-between" style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('home_notifications')}
            </h2>
            {notifications.filter(n => n.is_active).length > 0 && (
              <div style={{ padding: '2px 8px', backgroundColor: '#EF4444', borderRadius: 12, color: '#FFF', fontSize: 'clamp(11px, 2.8rem, 15px)', fontWeight: 700, flexShrink: 0 }}>
                {notifications.filter(n => n.is_active).length}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button
                className="btn-reset flex-center"
                onClick={() => {
                  useNotificationStore.getState().markAllAsRead();
                }}
                disabled={notifications.filter(n => n.is_active).length === 0}
                style={{
                  width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%',
                  backgroundColor: notifications.filter(n => n.is_active).length > 0 ? '#EFF6FF' : '#F1F5F9',
                  flexShrink: 0,
                  opacity: notifications.filter(n => n.is_active).length > 0 ? 1 : 0.6,
                }}
              >
                <span className="icon-material" style={{
                  fontSize: 'clamp(20px, 5.1rem, 28px)', 
                  color: notifications.filter(n => n.is_active).length > 0 ? '#3B82F6' : '#94A3B8',
                  fontVariationSettings: "'FILL' 0",
                }}>
                  done_all
                </span>
              </button>
            <button
              className="btn-reset flex-center"
              onClick={onClose}
              style={{
                width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%',
                backgroundColor: '#E2E8F0',
                flexShrink: 0,
              }}
            >
              <span className="icon-material" style={{
                fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B',
                fontVariationSettings: "'FILL' 0",
              }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }} onScroll={handleScroll}>
          {notifications.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '40px 0', gap: 12,
            }}>
              <span className="icon-material" style={{
                fontSize: 'clamp(52px, 13.3rem, 73px)', color: '#CBD5E1',
              }}>
                notifications_off
              </span>
              <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600, color: '#94A3B8' }}>
                {t('home_no_notifications')}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((notif) => {
              let dateStr = '';
              try {
                  dateStr = new Date(notif.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch {
                  // ignore
                }
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.is_active) markAsRead(notif.id);
                    }}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      backgroundColor: notif.is_active ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: 24,
                      border: notif.is_active ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                      boxShadow: notif.is_active ? '0 6px 12px -2px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15)' : '0 4px 8px -2px rgba(0, 0, 0, 0.18)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Header: Icon + Title + Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 'clamp(44px, 11.2rem, 60px)', height: 'clamp(44px, 11.2rem, 60px)', borderRadius: '50%',
                            background: '#1B5E3D',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          <span
                            className="icon-material"
                            style={{
                              fontSize: 'clamp(22px, 5.6rem, 30px)',
                              color: '#FFF',
                              fontVariationSettings: notif.is_active ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            {notif.is_active ? 'notifications_active' : 'notifications'}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <h3 style={{ 
                              fontSize: 'clamp(15px, 3.8rem, 21px)', 
                              fontWeight: notif.is_active ? 800 : 700, 
                              color: '#1E293B', 
                              margin: 0,
                              lineHeight: 1.2
                            }}>
                              {notif.title}
                            </h3>
                            {notif.is_active && (
                              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444', flexShrink: 0, marginTop: 4 }} />
                            )}
                          </div>
                          <span style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 500, color: '#94A3B8', display: 'block', marginTop: 4 }}>
                            {dateStr}
                          </span>
                        </div>
                      </div>

                      {/* Body: Image + Message */}
                      <div style={{ display: 'flex', gap: 12 }}>
                        {notif.image_url && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); setExpandedImage(notif.image_url!); }}
                            style={{ flexShrink: 0, position: 'relative' }}
                          >
                            <img 
                              src={notif.image_url} 
                              alt="Notification" 
                              style={{
                                width: 'clamp(96px, 24.5rem, 140px)', 
                                height: 'clamp(96px, 24.5rem, 140px)', 
                                borderRadius: 16,
                                objectFit: 'cover',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              }} 
                            />
                            <div className="flex-center" style={{
                              position: 'absolute', bottom: 8, right: 8,
                              backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: 4
                            }}>
                              <span className="icon-material" style={{ fontSize: 16, color: '#FFF' }}>zoom_in</span>
                            </div>
                          </div>
                        )}
                        <p style={{
                          flex: 1,
                          fontSize: 'clamp(14px, 3.6rem, 20px)', color: notif.is_active ? '#334155' : '#64748B', lineHeight: 1.4,
                          margin: 0,
                        }}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isLoadingMore && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 32px' }}>
                  <span className="icon-material animate-spin" style={{ color: '#94A3B8', fontSize: 32 }}>autorenew</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Image Overlay */}
      {expandedImage && (
        <div 
          onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
        >
          <img 
            src={expandedImage} 
            alt="Expanded notification" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 16 }} 
          />
          <button 
            className="btn-reset flex-center"
            onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
            style={{
              position: 'absolute', top: 32, right: 24,
              width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)'
            }}
          >
            <span className="icon-material" style={{ fontSize: 28, color: '#FFF' }}>close</span>
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
