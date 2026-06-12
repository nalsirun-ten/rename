import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';

export interface Country {
  code: string;
  flag: string;
  name: string;
  format: string; // e.g. "XXX XXX XXX"
}

interface Props {
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCode?: string;
}

export default function CountrySelectModal({ onSelect, onClose }: Props) {
  const t = useT();

  const COUNTRIES: Country[] = [
    { code: '+996', flag: '🇰🇬', name: t('country_kg'), format: 'XXX XXX XXX' },
    { code: '+7', flag: '🇰🇿', name: t('country_kz'), format: '(XXX) XXX-XX-XX' },
    { code: '+7', flag: '🇷🇺', name: t('country_ru'), format: '(XXX) XXX-XX-XX' },
    { code: '+998', flag: '🇺🇿', name: t('country_uz'), format: 'XX XXX-XX-XX' },
    { code: '+994', flag: '🇦🇿', name: t('country_az'), format: 'XX XXX-XX-XX' },
    { code: '+374', flag: '🇦🇲', name: t('country_am'), format: 'XX XXX-XXX' },
    { code: '+375', flag: '🇧🇾', name: t('country_by'), format: 'XX XXX-XX-XX' },
    { code: '+1', flag: '🇺🇸', name: t('country_us'), format: '(XXX) XXX-XXXX' },
    { code: '+44', flag: '🇬🇧', name: t('country_gb'), format: 'XXXX XXXXXX' },
    { code: '+971', flag: '🇦🇪', name: t('country_ae'), format: 'XX XXX XXXX' },
  ];

  const sheetRef = useSwipeToClose(onClose);
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div 
        ref={sheetRef}
        className="rs-sheet sheet-base flex-col" 
        style={{ 
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)'
        }}
      >
        <div className="flex-between" style={{ padding: '24px 16px 16px', flexShrink: 0 }}>
          <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {t('country_select_title')}
          </h2>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
          {COUNTRIES.map((country, idx) => (
            <button
              key={`${country.code}-${country.name}`}
              className="btn-reset"
              onClick={() => {
                onSelect(country);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '16px 0',
                borderBottom: idx === COUNTRIES.length - 1 ? 'none' : '1px solid #F1F5F9',
                backgroundColor: 'transparent',
              }}
            >
              <span style={{ fontSize: 'clamp(24px, 6.1rem, 32px)', marginRight: 16 }}>{country.flag}</span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600, color: '#1E293B' }}>
                {country.name}
              </span>
              <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700, color: '#94A3B8' }}>
                {country.code}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
