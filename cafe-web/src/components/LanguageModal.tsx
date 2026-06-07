import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useLanguageStore, type Language } from '../stores/language';
import { useT } from '../i18n/useT';
import { loadLanguage } from '../i18n/translations';

interface Props {
  onClose: () => void;
}

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'ru', flag: '🇷🇺' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'kg', flag: '🇰🇬' },
];

const LANG_NAMES: Record<Language, string> = {
  ru: 'Русский',
  en: 'English',
  kg: 'Кыргызча',
};

export default function LanguageModal({ onClose }: Props) {
  const selectedLang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useT();

  const sheetRef = useSwipeToClose(onClose);
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
            <div ref={sheetRef} className="rs-sheet sheet-base" style={{ backgroundColor: '#FCFBFA', display: 'flex', flexDirection: 'column', maxHeight: '90%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('language')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button
            onClick={onClose}
            className="btn-reset flex-center"
            style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#0F172A', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {LANGUAGES.map((lang, idx) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={async () => {
                  await loadLanguage(lang.code);
                  setLanguage(lang.code);
                  setTimeout(onClose, 200);
                }}
                className="btn-reset"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: idx === LANGUAGES.length - 1 ? 'none' : '1px solid #CBD5E1',
                }}
              >
                <div className="flex-center" style={{ width: 'clamp(32px, 8.2rem, 45px)', height: 'clamp(32px, 8.2rem, 45px)', marginRight: 16, fontSize: 'clamp(20px, 5.1rem, 28px)' }}>
                  {lang.flag}
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600, color: isSelected ? '#1B5E3D' : '#1E293B' }}>
                  {LANG_NAMES[lang.code]}
                </span>
                {isSelected && (
                  <div className="flex-center" style={{ width: 'clamp(24px, 6.1rem, 34px)', height: 'clamp(24px, 6.1rem, 34px)', borderRadius: '50%', backgroundColor: '#1B5E3D' }}>
                    <span className="icon-material" style={{ fontSize: 'clamp(16px, 4rem, 22px)', color: '#FFF' }}>check</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
