
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useModalTheme } from '../hooks/useModalTheme';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  { icon: '📖', titleKey: 'about_cafe_section_story', contentKey: 'about_cafe_story_text' },
  { icon: '☕', titleKey: 'about_cafe_section_coffee', contentKey: 'about_cafe_coffee_text' },
  { icon: '💚', titleKey: 'about_cafe_section_philosophy', contentKey: 'about_cafe_philosophy_text' },
  { icon: '⭐', titleKey: 'about_cafe_section_why', contentKey: 'about_cafe_why_text' },
] as const;

export default function AboutCafeModal({ onClose }: Props) {
  useModalTheme(true);
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);

  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div
        ref={sheetRef}
        className="rs-sheet sheet-base flex-col"
        style={{
          maxHeight: '85vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('about_cafe_title')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#0F172A', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          <div style={{ width: '100%', height: 'clamp(200px, 51rem, 280px)', borderRadius: 24, marginBottom: 32, overflow: 'hidden', backgroundColor: '#E2E8F0', flexShrink: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"
              alt="Staff"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h2 style={{ fontSize: 'clamp(24px, 6rem, 32px)', fontWeight: 800, color: '#1E293B', marginBottom: 16 }}>
            {t('about_cafe_heading')}
          </h2>

          <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
            {t('about_cafe_text')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {SECTIONS.map((section, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, paddingLeft: 12, borderLeft: '4px solid #1B5E3D' }}>
                  <h3 style={{ fontSize: 'clamp(18px, 4.6rem, 26px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {section.icon} {t(section.titleKey).replace(/^[^ ]+ /, '')}
                  </h3>
                </div>
                <p style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  {t(section.contentKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
