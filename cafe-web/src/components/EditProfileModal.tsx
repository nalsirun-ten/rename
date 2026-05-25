import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore } from '../stores/profile';

interface Props {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: Props) {
  const { name, photo, updateProfile } = useProfileStore();
  const [editName, setEditName] = useState(name);
  const [editPhoto, setEditPhoto] = useState<string | null>(photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlay = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editName.trim().length > 0) {
      updateProfile({ name: editName.trim(), photo: editPhoto });
      onClose();
    }
  };

  const firstLetter = editName.charAt(0).toUpperCase() || '?';

  return createPortal(
    <div className="overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div 
        ref={sheetRef}
        className="sheet-base flex-col" 
        style={{ 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex-between" style={{ padding: '32px 16px 16px', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Редактировать
          </h2>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
        {/* Photo Upload */}
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: 32 }}>
          <div 
            style={{ 
              position: 'relative', 
              width: 'clamp(100px, 25.6vw, 140px)', 
              height: 'clamp(100px, 25.6vw, 140px)', 
              borderRadius: '50%', 
              backgroundColor: '#1B5E3D',
              boxShadow: '0 4px 12px rgba(27, 94, 61, 0.3)',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {editPhoto ? (
              <img src={editPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 'clamp(40px, 10.2vw, 56px)', fontWeight: 800, color: '#FFF' }}>{firstLetter}</span>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0, height: '30%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <span className="icon-material" style={{ color: '#FFF', fontSize: 'clamp(18px, 4.6vw, 26px)' }}>photo_camera</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <span style={{ marginTop: 12, fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 500, color: '#64748B' }}>
            Изменить фото
          </span>
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: 40 }}>
          <label style={{ display: 'block', fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
            Ваше имя
          </label>
          <input 
            type="text" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: 'clamp(16px, 4vw, 22px)',
              fontWeight: 600,
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Save Button */}
        <button 
          className="btn-reset" 
          onClick={handleSave}
          disabled={editName.trim().length === 0}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 16,
            backgroundColor: editName.trim().length === 0 ? '#CBD5E1' : '#1B5E3D',
            color: '#FFF',
            fontSize: 'clamp(16px, 4vw, 22px)',
            fontWeight: 700,
            transition: 'background-color 0.2s'
          }}
        >
          Сохранить
        </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
