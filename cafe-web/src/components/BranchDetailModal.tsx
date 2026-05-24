import React, { useState, useEffect } from 'react';
import { useBranchesStore, type Branch } from '../stores/branches';

export default function BranchDetailModal() {
  const { branches, activeBranchId, closeBranch } = useBranchesStore();
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  // Reset states when modal changes
  useEffect(() => {
    if (activeBranchId) {
      setIsHoursExpanded(false);
      setIsRouteModalOpen(false);
    }
  }, [activeBranchId]);

  if (!activeBranchId) return null;

  const branch = branches.find((b) => b.id === activeBranchId);
  if (!branch) return null;

  // The bottom sheet background overlay
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Click outside to close */}
      <div style={{ flex: 1 }} onClick={closeBranch} />

      {/* Main Bottom Sheet */}
      <div style={{
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90%',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
                {branch.title}
              </h2>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: branch.isOpen ? '#22C55E' : '#EF4444', marginRight: 6 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: branch.isOpen ? '#22C55E' : '#EF4444' }}>
                {branch.isOpen ? 'Открыто' : 'Закрыто'}
              </span>
            </div>
          </div>
          <button 
            onClick={closeBranch}
            className="btn-reset flex-center"
            style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#F1F5F9' }}
          >
            <span className="icon-material" style={{ fontSize: 20, color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Map placeholder */}
        <div style={{ 
          height: 180, 
          backgroundColor: '#E2E8F0', 
          borderRadius: 16, 
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&h=300")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {/* Map Pin */}
          <div style={{
            width: 50, height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
          }}>
            <svg width="48" height="60" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.372 0 0 5.372 0 12c0 8.5 12 18 12 18s12-9.5 12-18c0-6.628-5.372-12-12-12z" fill="#EF4444"/>
              <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: 4,
            fontSize: 12, fontWeight: 700, color: '#1E293B'
          }}>
            Яндекс Карты
          </div>
        </div>

        {/* Address */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E0F2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
            <span className="icon-material" style={{ color: '#1B5E3D', fontSize: 24 }}>location_on</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 2 }}>Адрес</div>
            <div style={{ fontSize: 16, color: '#1E293B', fontWeight: 600 }}>{branch.address}</div>
          </div>
        </div>

        {/* Working Hours */}
        <div 
          style={{ display: 'flex', flexDirection: 'column', marginBottom: 16, cursor: 'pointer' }}
          onClick={() => setIsHoursExpanded(!isHoursExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E0F2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
              <span className="icon-material" style={{ color: '#1B5E3D', fontSize: 24 }}>schedule</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 2 }}>Время работы</div>
              <div style={{ fontSize: 16, color: '#1E293B', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Сегодня: {branch.openTime} - {branch.closeTime}</span>
                <span className="icon-material" style={{ color: '#64748B', transition: 'transform 0.2s', transform: isHoursExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </div>
            </div>
          </div>
          
          {/* Expanded Hours */}
          {isHoursExpanded && (
            <div style={{ marginLeft: 56, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day, idx) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, color: idx === 0 ? '#1E293B' : '#64748B', fontWeight: idx === 0 ? 700 : 500 }}>
                    {day}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, color: '#1E293B', fontWeight: 500 }}>
                      {branch.openTime} - {branch.closeTime}
                    </span>
                    {idx === 0 && (
                      <span style={{ backgroundColor: '#E0F2E9', color: '#1B5E3D', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                        Сегодня
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phone */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E0F2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
            <span className="icon-material" style={{ color: '#1B5E3D', fontSize: 24 }}>call</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 2 }}>Телефон</div>
            <div style={{ fontSize: 16, color: '#1E293B', fontWeight: 600 }}>+996555987654</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-reset flex-center" style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#25D366', color: '#FFF' }}>
              {/* WhatsApp icon placeholder */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            <button className="btn-reset flex-center" style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#3B82F6', color: '#FFF' }}>
              <span className="icon-material" style={{ fontSize: 20 }}>call</span>
            </button>
          </div>
        </div>

        {/* Build Route Button */}
        <button 
          onClick={() => setIsRouteModalOpen(true)}
          className="btn-reset"
          style={{
            backgroundColor: '#EFF6FF',
            color: '#3B82F6',
            borderRadius: 16,
            padding: '16px',
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #3B82F6',
          }}
        >
          <span className="icon-material" style={{ marginRight: 8, fontSize: 20 }}>directions</span>
          Построить маршрут
        </button>
      </div>

      {/* Nested Route Modal */}
      {isRouteModalOpen && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1010,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <div style={{ flex: 1 }} onClick={() => setIsRouteModalOpen(false)} />
          <div style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: '24px 20px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Построить маршрут</h3>
                <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{branch.title}</span>
              </div>
              <button 
                onClick={() => setIsRouteModalOpen(false)}
                className="btn-reset flex-center"
                style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#F1F5F9' }}
              >
                <span className="icon-material" style={{ fontSize: 20, color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Google Maps */}
              <button className="btn-reset" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, marginRight: 12, backgroundColor: '#EA4335', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>G</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Google Maps</span>
                </div>
                <span className="icon-material" style={{ color: '#94A3B8' }}>chevron_right</span>
              </button>
              
              {/* 2GIS */}
              <button className="btn-reset" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, marginRight: 12, backgroundColor: '#22C55E', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>2</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>2GIS</span>
                </div>
                <span className="icon-material" style={{ color: '#94A3B8' }}>chevron_right</span>
              </button>

              {/* Yandex Maps */}
              <button className="btn-reset" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', borderRadius: 16, border: '1px solid #E2E8F0', backgroundColor: '#FFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, marginRight: 12, backgroundColor: '#EF4444', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>Я</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Яндекс.Карты</span>
                </div>
                <span className="icon-material" style={{ color: '#94A3B8' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
