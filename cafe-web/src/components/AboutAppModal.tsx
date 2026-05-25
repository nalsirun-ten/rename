import React from 'react';

interface Props {
  onClose: () => void;
}

export default function AboutAppModal({ onClose }: Props) {
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
      <div style={{ flex: 1 }} onClick={onClose} />

      <div style={{
        backgroundColor: '#FCFBFA', // Slightly warm white from screenshot
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 16px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              О приложении
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button 
            onClick={onClose}
            className="btn-reset flex-center"
            style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#0F172A', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {/* Logo & Text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div className="flex-center" style={{
            width: 'clamp(80px, 20.5vw, 112px)', height: 'clamp(80px, 20.5vw, 112px)', borderRadius: 24, backgroundColor: '#1B5E3D', marginBottom: 16,
            boxShadow: '0 8px 16px rgba(27, 94, 61, 0.2)'
          }}>
            <span className="icon-material" style={{ fontSize: 'clamp(40px, 10.2vw, 56px)', color: '#FFF' }}>local_cafe</span>
          </div>
          <h3 style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
            Cafe
          </h3>
          <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 500, color: '#64748B', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>
            Приложение Cafe создано для любителей кофе. Мы собрали в одном приложении всё для вашего комфорта: бонусы, меню, адреса кофеен и многое другое.
          </p>
        </div>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#94A3B8', marginRight: 12 }}>phone_iphone</span>
              <span style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 500, color: '#64748B' }}>Модель устройства</span>
            </div>
            <span style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 600, color: '#1E293B' }}>Android</span>
          </div>
          
          {/* Row 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#94A3B8', marginRight: 12 }}>system_update</span>
              <span style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 500, color: '#64748B' }}>Версия OS</span>
            </div>
            <span style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 600, color: '#1E293B' }}>16.V816.0.5.0.WGRMIXM</span>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#94A3B8', marginRight: 12, fontVariationSettings: "'FILL' 0" }}>info</span>
              <span style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 500, color: '#64748B' }}>Версия</span>
            </div>
            <span style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', fontWeight: 600, color: '#1E293B' }}>1.0.0 (1)</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 'clamp(13px, 3.3vw, 18px)', fontWeight: 500, color: '#CBD5E1' }}>
          © 2024-2026 Cafe
        </div>
        </div>
      </div>
    </div>
  );
}
