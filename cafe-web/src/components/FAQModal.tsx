import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';
import { useT } from '../i18n/useT';

interface Props {
  onClose: () => void;
}

const FAQ_KEYS = [
  { q: 'faq_q1', a: 'faq_a1' },
  { q: 'faq_q2', a: 'faq_a2' },
  { q: 'faq_q3', a: 'faq_a3' },
  { q: 'faq_q4', a: 'faq_a4' },
  { q: 'faq_q5', a: 'faq_a5' },
  { q: 'faq_q6', a: 'faq_a6' },
] as const;

export default function FAQModal({ onClose }: Props) {
  const t = useT();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sheetRef = useSwipeToClose(onClose);
  useLockBodyScroll();
  const handleOverlay = useOverlayClose(onClose);

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={handleOverlay} style={{ zIndex: 9999 }}>
      <div ref={sheetRef} className="rs-sheet sheet-base" style={{ backgroundColor: '#FCFBFA', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              {t('faq_title')}
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

        {/* FAQ List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {FAQ_KEYS.map((keys, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div key={keys.q} style={{ borderBottom: '1px solid #CBD5E1' }}>
                <button
                  className="btn-reset"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                  }}
                >
                  <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 600, color: '#1E293B', textAlign: 'left' }}>
                    {t(keys.q)}
                  </span>
                  <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                {isExpanded && (
                  <div style={{ paddingBottom: 16, paddingRight: 20 }}>
                    <p style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', fontWeight: 500, color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                      {t(keys.a)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
