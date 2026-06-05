import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProfileStore } from '../stores/profile';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';
import { compressImage } from '../utils/imageCompression';


interface Props {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: Props) {
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const { name, photo, updateProfile } = useProfileStore();
  const [editName, setEditName] = useState(name);
  const [editPhoto, setEditPhoto] = useState<string | null>(photo || null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress avatar to 320px max, and convert to lightweight WebP
        const compressedFile = await compressImage(file, 320, 0.85);
        setEditPhotoFile(compressedFile);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setEditPhoto(event.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editName.trim().length > 0) {
      setIsSaving(true);
      const updates: any = { name: editName.trim() };
      if (editPhoto === null) {
        updates.photo = null;
      }
      await updateProfile(updates, editPhotoFile);
      setIsSaving(false);
      onClose();
    }
  };

  const firstLetter = editName.charAt(0).toUpperCase() || '?';

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div 
        ref={sheetRef}
        className="rs-sheet sheet-base flex-col" 
        style={{ 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex-between" style={{ padding: '32px 16px 16px', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {t('edit')}
          </h2>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}>
        {/* Photo Upload */}
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                width: 'clamp(100px, 25.6rem, 140px)', 
                height: 'clamp(100px, 25.6rem, 140px)', 
                borderRadius: '50%', 
                backgroundColor: '#1B5E3D',
                boxShadow: '0 4px 12px rgba(27, 94, 61, 0.3)',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {editPhoto ? (
                <img src={editPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 'clamp(40px, 10.2rem, 56px)', fontWeight: 800, color: '#FFF' }}>{firstLetter}</span>
              )}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0, height: '30%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                <span className="icon-material" style={{ color: '#FFF', fontSize: 'clamp(18px, 4.6rem, 26px)' }}>photo_camera</span>
              </div>
            </div>
            
            {editPhoto && (
              <button
                type="button"
                className="btn-reset flex-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditPhoto(null);
                  setEditPhotoFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  zIndex: 20
                }}
              >
                <span className="icon-material" style={{ color: '#FFF', fontSize: 18 }}>delete</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <span style={{ marginTop: 12, fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 500, color: '#64748B' }}>
            {t('edit_photo')}
          </span>
        </div>

        {/* Name Input */}
        <div style={{ marginBottom: 40 }}>
          <label style={{ display: 'block', fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
            {t('edit_your_name')}
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
              fontSize: 'clamp(16px, 4rem, 22px)',
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
          disabled={editName.trim().length === 0 || isSaving}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 16,
            backgroundColor: (editName.trim().length === 0 || isSaving) ? '#CBD5E1' : '#1B5E3D',
            color: '#FFF',
            fontSize: 'clamp(16px, 4rem, 22px)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {isSaving ? <span className="icon-material animate-spin">autorenew</span> : null}
          {isSaving ? t('loading') : t('save_changes')}
        </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
