import { useState } from 'react';
import { useProfileStore } from '../stores/profile';
import { useLanguageStore, type Language } from '../stores/language';
import { useT } from '../i18n/useT';
import { supabase } from '../lib/supabase';

export default function OnboardingModal() {
  const t = useT();
  const { setOnboarded, updateProfile, id } = useProfileStore();
  const { language, setLanguage } = useLanguageStore();
  
  const [name, setName] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return; // Required
    setLoading(true);
    
    // Save language
    setLanguage(selectedLang);
    
    // Update profile
    await updateProfile({ name: name.trim() });
    
    // Also explicitly ensure it's saved to supabase just in case updateProfile doesn't handle full_name insert correctly for new users
    if (id) {
      await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', id);
    }
    
    setOnboarded(true);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '0 16px 32px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: '#FEF2F2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            <span className="icon-material" style={{ fontSize: 32 }}>waving_hand</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' }}>
            {t('onboarding_title')}
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
            {t('onboarding_subtitle')}
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
            {t('onboarding_name_placeholder')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onboarding_name_placeholder')}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: 16,
              fontWeight: 600,
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
            {t('onboarding_language_label')}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'ru', label: 'Русский' },
              { id: 'en', label: 'English' },
              { id: 'kg', label: 'Кыргызча' },
            ].map(l => (
              <button
                key={l.id}
                className="btn-reset"
                onClick={() => setSelectedLang(l.id as Language)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  backgroundColor: selectedLang === l.id ? '#1B5E3D' : '#F1F5F9',
                  color: selectedLang === l.id ? '#FFF' : '#64748B',
                  fontWeight: 600,
                  fontSize: 14,
                  border: selectedLang === l.id ? '1px solid #1B5E3D' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
          className="btn-reset"
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 16,
            backgroundColor: '#1B5E3D',
            color: '#FFF',
            fontSize: 16,
            fontWeight: 700,
            opacity: (!name.trim() || loading) ? 0.7 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {loading ? (
            <div style={{
              width: 20, height: 20,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : t('onboarding_save')}
        </button>
      </div>
    </div>
  );
}
