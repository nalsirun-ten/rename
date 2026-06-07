import React, { useState, useEffect, useMemo } from 'react';
import { useBranchesStore } from '../stores/branches';
import { useSettingsStore } from '../stores/settings';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useT } from '../i18n/useT';
import type { TranslationKey } from '../i18n/translations';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useSwipeToClose } from '../hooks/useSwipeToClose';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const WEEKDAY_KEYS: TranslationKey[] = [
  'weekday_mon', 'weekday_tue', 'weekday_wed', 'weekday_thu',
  'weekday_fri', 'weekday_sat', 'weekday_sun',
];
const WEEKDAY_ENGLISH_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function BranchDetailModal() {
  const { branches, activeBranchId, closeBranch } = useBranchesStore();
  const { get, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const t = useT();
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const phoneFormatted = get('contact_phone') || '+7 (999) 123-45-67';
  const phoneRaw = phoneFormatted.replace(/[^\d+]/g, '');

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  // Reset states when modal changes
  useEffect(() => {
    if (activeBranchId) {
      setIsHoursExpanded(false);
      setIsRouteModalOpen(false);
      setCopied(false);
    }
  }, [activeBranchId]);

  const handleOverlay = useOverlayClose(closeBranch, !!activeBranchId);
  const sheetRef = useSwipeToClose(closeBranch);

  if (!activeBranchId) return null;

  const branch = branches.find((b) => b.id === activeBranchId);
  if (!branch) return null;

  const lat = branch.latitude || 42.8746;
  const lng = branch.longitude || 74.5698;

  const bishkekTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Bishkek" });
  const bishkekDate = new Date(bishkekTimeString);
  const todayIndex = bishkekDate.getDay() === 0 ? 6 : bishkekDate.getDay() - 1;

  const getScheduleString = (idx: number) => {
    const key = WEEKDAY_ENGLISH_KEYS[idx];
    const val = branch.weeklySchedule?.[key];
    if (val && val.trim().length > 0) return val;
    return `${branch.openTime} - ${branch.closeTime}`;
  };
  const todayScheduleString = getScheduleString(todayIndex);

  return (
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Main Bottom Sheet — auto‑sized to content, capped at 94vh */}
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{
        backgroundColor: '#FFF',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '94vh',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}>
        {/* Top Map Section */}
        <div style={{ position: 'relative', height: '42vh', width: '100%', flexShrink: 0 }}>
          {GOOGLE_MAPS_API_KEY ? (
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <Map
                defaultCenter={{ lat, lng }}
                defaultZoom={14}
                mapId="DEMO_MAP_ID"
                id="detail-map"
                colorScheme="LIGHT"
                keyboardShortcuts={false}
                disableDefaultUI={true}
                gestureHandling="greedy"
                style={{ width: '100%', height: '100%' }}
              >
                <AdvancedMarker position={{ lat, lng }}>
                  {/* Custom Tear-drop Marker */}
                  <div style={{
                    width: 48, height: 48,
                    backgroundColor: '#3b2f2f',
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    border: '2px solid #FFF',
                    position: 'relative'
                  }}>
                    <span className="icon-material" style={{ 
                      color: '#FFF', 
                      fontSize: 24,
                      transform: 'rotate(45deg)' 
                    }}>
                      local_cafe
                    </span>
                    
                    {/* Small Green Dot at the top-right of the marker */}
                    {branch.isOpen && (
                      <div style={{
                        position: 'absolute', top: -2, right: -2,
                        width: 14, height: 14, backgroundColor: '#22C55E',
                        borderRadius: '50%', border: '2px solid #FFF',
                        transform: 'rotate(45deg)'
                      }} />
                    )}
                  </div>
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#E2E8F0' }} />
          )}

          {/* Close Button Overlay */}
          <button 
            onClick={closeBranch}
            className="btn-reset flex-center"
            style={{ 
              position: 'absolute', top: 16, right: 16, 
              width: 36, height: 36, borderRadius: '50%', 
              backgroundColor: '#1E293B', color: '#FFF',
              zIndex: 10
            }}
          >
            <span className="icon-material" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Scrollable Details Section */}
        <div style={{
          flexShrink: 0, overflowY: 'auto', maxHeight: 'calc(94vh - 42vh)',
          backgroundColor: '#FFF',
          padding: '24px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)'
        }}>
          {/* Header Row: Text Info + Image */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <h2 style={{ fontSize: 'clamp(20px, 5.5rem, 26px)', fontWeight: 700, color: '#3B82F6', margin: 0, marginBottom: 8 }}>
                {branch.title}
              </h2>
              <div style={{ fontSize: 'clamp(16px, 4.2rem, 18px)', color: '#1E293B', fontWeight: 600, marginBottom: 4 }}>
                {branch.address}
              </div>
              <div style={{ fontSize: 'clamp(14px, 3.8rem, 16px)', color: '#1E293B', fontWeight: 500, marginBottom: 4 }}>
                {t('branch_city')}
              </div>
              <div style={{ fontSize: 'clamp(14px, 3.8rem, 16px)', color: '#94A3B8', fontWeight: 500 }}>
                {branch.type}
              </div>
            </div>
            
            <div style={{ 
              width: 110, height: 110, 
              borderRadius: 20, 
              backgroundColor: '#F1F5F9',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img
                src={branch.imageUrl}
                alt={branch.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>



          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '0 0 20px 0' }} />

          {/* Today's Hours (Expandable) */}
          <div 
            onClick={() => setIsHoursExpanded(!isHoursExpanded)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHoursExpanded ? 16 : 20, cursor: 'pointer' }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
              {t('branch_today')} {todayScheduleString}
            </div>
            <span className="icon-material" style={{ color: '#1E293B', transition: 'transform 0.2s', transform: isHoursExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </div>

          {isHoursExpanded && (
            <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {WEEKDAY_KEYS.map((key, idx) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, color: idx === todayIndex ? '#1E293B' : '#64748B', fontWeight: idx === todayIndex ? 700 : 500 }}>
                    {t(key)}
                  </span>
                  <span style={{ fontSize: 15, color: '#1E293B', fontWeight: 500 }}>
                    {getScheduleString(idx)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '0 0 20px 0' }} />

          {/* Phone */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>
                {phoneFormatted}
              </span>
              <button 
                className="btn-reset flex-center" 
                onClick={handleCopyPhone}
                style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: copied ? '#DCFCE7' : '#F1F5F9', transition: 'background-color 0.2s' }}
              >
                <span className="icon-material" style={{ fontSize: 16, color: copied ? '#22C55E' : '#94A3B8' }}>
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn-reset flex-center" 
                onClick={() => window.location.href = `https://wa.me/${phoneRaw.replace('+', '')}`} 
                style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#25D366', color: '#FFF' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              <button 
                className="btn-reset flex-center" 
                onClick={() => window.location.href = `tel:${phoneRaw}`} 
                style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#3B82F6', color: '#FFF' }}
              >
                <span className="icon-material" style={{ fontSize: 20 }}>call</span>
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '0 0 20px 0' }} />

          {/* Route */}
          <div 
            onClick={() => setIsRouteModalOpen(true)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
              {t('branch_route')}
            </div>
            <span className="icon-material" style={{ color: '#1E293B', fontSize: 24 }}>route</span>
          </div>
        </div>
      </div>

      {/* Nested Route Modal */}
      {isRouteModalOpen && (
        <RouteModal branch={branch} lat={lat} lng={lng} onClose={() => setIsRouteModalOpen(false)} t={t} />
      )}
    </div>
  );
}

function RouteModal({ branch, lat, lng, onClose, t }: any) {
  const handleOverlay = useOverlayClose(onClose);
  const sheetRef = useSwipeToClose(onClose);

  return (
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1010,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{
        backgroundColor: '#FFF',
        padding: '24px 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>{t('branch_build_route')}</h3>
                <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', color: '#64748B', fontWeight: 500 }}>{branch.title}</span>
              </div>
              <button 
                onClick={onClose}
                className="btn-reset flex-center"
                style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}
              >
                <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className="btn-reset" 
                onClick={() => window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <img src="/map2.png" alt="Google Maps" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700, color: '#1E293B' }}>Google Maps</span>
                </div>
                <span className="icon-material" style={{ color: '#94A3B8' }}>chevron_right</span>
              </button>
              
              <button 
                className="btn-reset" 
                onClick={() => window.location.href = `https://2gis.ru/routeSearch/rsType/car/to/${lng},${lat}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <img src="/map1.png" alt="2GIS" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
                  </div>
                  <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700, color: '#1E293B' }}>2GIS</span>
                </div>
                <span className="icon-material" style={{ color: '#94A3B8' }}>chevron_right</span>
              </button>

              <button 
                className="btn-reset" 
                onClick={() => window.location.href = `https://yandex.ru/maps/?rtext=~${lat},${lng}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <img src="/map3.png" alt="Yandex Maps" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700, color: '#1E293B' }}>Яндекс.Карты</span>
                </div>
                <span className="icon-material" style={{ color: '#94A3B8' }}>chevron_right</span>
              </button>
            </div>
      </div>
    </div>
  );
}
