import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'kg', name: 'Кыргызча', flag: '🇰🇬' },
];

export default function LanguageModal({ onClose }: Props) {
  const [selectedLang, setSelectedLang] = useState('ru'); // Russian by default

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
        backgroundColor: '#FCFBFA',
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
              Язык
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

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {LANGUAGES.map((lang, idx) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setTimeout(onClose, 200);
                }}
                className="btn-reset"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: idx === LANGUAGES.length - 1 ? 'none' : '1px solid #F1F5F9',
                }}
              >
                <div className="flex-center" style={{ width: 'clamp(32px, 8.2vw, 45px)', height: 'clamp(32px, 8.2vw, 45px)', marginRight: 16, fontSize: 'clamp(20px, 5.1vw, 28px)' }}>
                  {lang.flag}
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 600, color: isSelected ? '#1B5E3D' : '#1E293B' }}>
                  {lang.name}
                </span>
                {isSelected && (
                  <div className="flex-center" style={{ width: 'clamp(24px, 6.1vw, 34px)', height: 'clamp(24px, 6.1vw, 34px)', borderRadius: '50%', backgroundColor: '#1B5E3D' }}>
                    <span className="icon-material" style={{ fontSize: 'clamp(16px, 4vw, 22px)', color: '#FFF' }}>check</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
