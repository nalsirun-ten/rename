import { useModalTheme } from '../hooks/useModalTheme';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useHardwareBack } from '../hooks/useHardwareBack';
import { useBranchesStore } from '../stores/branches';
import { useReviewsStore } from '../stores/reviews';
import { useProfileStore } from '../stores/profile';

import { useT } from '../i18n/useT';
import type { TranslationKey } from '../i18n/translations';


const RATING_EMOJI: Record<number, string> = { 1: '😡', 2: '🙁', 3: '😐', 4: '🙂', 5: '😍' };
const RATING_LABEL_KEYS: Record<number, TranslationKey> = { 1: 'rating_terrible', 2: 'rating_bad', 3: 'rating_ok', 4: 'rating_good', 5: 'rating_excellent' };

function ratingColor(r: number): string {
  switch (r) { case 1: return '#EF4444'; case 2: return '#F97316'; case 3: return '#EAB308'; case 4: return '#84CC16'; case 5: return '#10B981'; default: return '#FFF'; }
}

const CATEGORIES: Array<{ id: string; nameKey: TranslationKey; image: string; borderColor: string }> = [
  { id: 'c1', nameKey: 'review_category_cafe', image: '/categories/2.png', borderColor: '#D97706' },
  { id: 'c2', nameKey: 'review_category_service', image: '/categories/5.png', borderColor: '#B45309' },
  { id: 'c3', nameKey: 'review_category_cleanliness', image: '/categories/3.png', borderColor: '#16A34A' },
  { id: 'c4', nameKey: 'review_category_atmosphere', image: '/categories/1.png', borderColor: '#F59E0B' },
  { id: 'c5', nameKey: 'review_category_coffee_taste', image: '/categories/4.png', borderColor: '#2563EB' },
];

const STAFF = [
  { id: 's1', name: 'Алексей Иванов', role: 'Шеф-бариста', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200', borderColor: '#A16207' },
  { id: 's2', name: 'Дмитрий Козлов', role: 'Бариста-обжарщик', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200', borderColor: '#A16207' },
  { id: 's3', name: 'Анна Смирнова', role: 'Менеджер', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200', borderColor: '#A16207' },
];

type Branch = ReturnType<typeof useBranchesStore.getState>['branches'][0];
type Category = typeof CATEGORIES[0];
type Staff = typeof STAFF[0];
type ReviewTarget = { type: 'category'; item: Category } | { type: 'staff'; item: Staff };

interface Props { onClose: () => void }

export default function ReviewModal({ onClose }: Props) {
  useModalTheme(true);
  const t = useT();
  const sheetRef = useSwipeToClose(onClose);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<ReviewTarget | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  
  const branches = useBranchesStore(state => state.branches);
  const { addReview } = useReviewsStore();
  const { id: userId, name, photo } = useProfileStore();

  useLockBodyScroll();
  
  // Hardware back button support for nested steps
  useHardwareBack(onClose, true); // Base modal close
  useHardwareBack(() => setStep(1), step >= 2); // Pops Step 2 -> 1
  useHardwareBack(() => setStep(2), step >= 3); // Pops Step 3 -> 2
  
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (rating === 0 || sending || !selectedBranch || !selectedTarget) return;
    setSending(true);
    
    // Prefix text with category or staff if selected
    let finalPrefix = '';
    if (selectedTarget.type === 'category') {
      finalPrefix = `[${t(selectedTarget.item.nameKey)}] `;
    } else if (selectedTarget.type === 'staff') {
      finalPrefix = `[Сотрудник: ${selectedTarget.item.name}] `;
    }
    const finalText = finalPrefix + comment.trim();
    
    try {
      await addReview({
        rating,
        text: finalText,
        branch_id: selectedBranch.id,
        user_id: userId || undefined,
        guest_name: userId ? undefined : (name || 'Гость'),
        guest_avatar: userId ? undefined : (photo || undefined),
      });
      setSent(true);
    } catch (err) {
      console.error('Failed to post review', err);
      setSubmitError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return createPortal(
      <div className="rs-overlay overlay-base" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 9999 }}>
        <div ref={sheetRef} className="rs-sheet sheet-base flex-col" style={{ padding: '48px 16px 40px', alignItems: 'center' }}>
          <div className="flex-center" style={{ width: 'clamp(80px, 25.6rem, 130px)', height: 'clamp(80px, 25.6rem, 130px)', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,.15)', animation: 'rm-success-pop .4s cubic-bezier(.34,1.56,.64,1)' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(56px, 14.3rem, 78px)', color: '#10B981', fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 6.6rem, 36px)', fontWeight: 800, color: '#1E293B', marginTop: 32, marginBottom: 12 }}>{t('review_thanks')}</h2>
          <p style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>{t('review_helps_us')}</p>
          <button className="btn-reset" onClick={onClose} style={{ marginTop: 48, width: '100%', padding: '14px 0', borderRadius: 20, backgroundColor: '#E2E8F0', color: '#1E293B', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700 }}>{t('done')}</button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="rs-overlay overlay-base" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 9999 }}>
      <style>{`
        .review-sheet-transition {
          transition: max-height 0.3s ease;
        }
      `}</style>
      <div ref={sheetRef} className="rs-sheet sheet-base review-sheet-transition" style={{ maxHeight: step === 1 ? '60vh' : '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {step === 1 && (
          <>
            <div style={{ padding: '16px 16px 8px', backgroundColor: '#FEF9F5', zIndex: 10, flexShrink: 0 }}>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8, textTransform: 'uppercase' }}>
                    {t('review_choose_branch')}
                  </h2>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
                </div>
                <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2rem, 50px)', height: 'clamp(36px, 9.2rem, 50px)', borderRadius: '50%', backgroundColor: '#E2E8F0' }}>
                  <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
                </button>
              </div>
              <p style={{ fontSize: 'clamp(15px, 3.8rem, 21px)', color: '#64748B', margin: '8px 0 0 0' }}>
                {t('review_which_branch')}
              </p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {branches.length === 0 && <div style={{textAlign: 'center', padding: '20px', color: '#94A3B8'}}>Нет доступных филиалов</div>}
              {branches.map(b => (
                <button key={b.id} className="btn-reset" onClick={() => { setSelectedBranch(b); setStep(2); }}
                  style={{
                    display: 'flex', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 28, padding: '16px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)', textAlign: 'left', border: 'none', gap: 16
                  }}>
                  <img src={b.imageUrl} alt={b.title} loading="lazy" style={{ width: 'clamp(64px, 16.4rem, 80px)', height: 'clamp(64px, 16.4rem, 80px)', borderRadius: 20, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h4 style={{ fontSize: 'clamp(17px, 4.3rem, 22px)', fontWeight: 800, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.title}
                    </h4>
                    <p style={{ fontSize: 'clamp(13px, 3.3rem, 16px)', color: '#64748B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.address}
                    </p>
                  </div>
                  <div style={{ width: 'clamp(36px, 9.2rem, 48px)', height: 'clamp(36px, 9.2rem, 48px)', borderRadius: '50%', backgroundColor: '#1B5E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(27,94,61,0.2)' }}>
                    <span className="icon-material" style={{ color: '#FFF', fontSize: 'clamp(20px, 5.1rem, 28px)' }}>chevron_right</span>
                  </div>
                </button>
              ))}
            </div>
            </div>
          </>
        )}

        {step === 2 && selectedBranch && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', backgroundColor: '#FEF9F5', zIndex: 10, flexShrink: 0 }}>
              <button className="btn-reset flex-center" onClick={() => setStep(1)} style={{ width: 'clamp(40px, 10.2rem, 56px)', height: 'clamp(40px, 10.2rem, 56px)', borderRadius: '50%', backgroundColor: '#F1F5F9', marginRight: 16, flexShrink: 0 }}>
                <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1rem, 34px)', color: '#0F172A' }}>arrow_back</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedBranch.title}
                  </h2>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)', flexShrink: 0 }} />
                </div>
                <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', color: '#64748B', marginTop: 2 }}>{t('review_rate_cafe')}</span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
              <h3 style={{ fontSize: 'clamp(18px, 4.6rem, 26px)', fontWeight: 800, color: '#1E293B', marginBottom: 16, paddingTop: 8 }}>{t('review_categories')}</h3>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', overscrollBehaviorX: 'contain', paddingBottom: 8, margin: '0 -16px', padding: '0 16px' }}>
              {CATEGORIES.map(c => (
                <button key={c.id} className="btn-reset" onClick={() => { setSelectedTarget({ type: 'category', item: c }); setStep(3); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'clamp(80px, 20rem, 110px)', flexShrink: 0 }}>
                  <img src={c.image} alt={t(c.nameKey)} loading="lazy" style={{ width: 'clamp(80px, 20rem, 110px)', height: 'clamp(80px, 20rem, 110px)', borderRadius: 20, objectFit: 'cover', marginBottom: 8, border: `3px solid ${c.borderColor}`, boxShadow: `0 8px 16px ${c.borderColor}40` }} />
                  <span style={{ fontSize: 'clamp(12px, 3.1rem, 16px)', fontWeight: 700, color: '#1E293B', textAlign: 'center' }}>{t(c.nameKey)}</span>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 'clamp(18px, 4.6rem, 26px)', fontWeight: 800, color: '#1E293B', marginTop: 24, marginBottom: 16 }}>{t('review_staff')}</h3>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, margin: '0 -16px', padding: '0 16px' }}>
              {STAFF.map(s => (
                <button key={s.id} className="btn-reset" onClick={() => { setSelectedTarget({ type: 'staff', item: s }); setStep(3); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 'clamp(80px, 20rem, 110px)', flexShrink: 0 }}>
                  <img src={s.image} alt={s.name} loading="lazy" style={{ width: 'clamp(80px, 20rem, 110px)', height: 'clamp(80px, 20rem, 110px)', borderRadius: 20, objectFit: 'cover', marginBottom: 10, border: `3px solid ${s.borderColor}`, boxShadow: `0 8px 16px ${s.borderColor}40` }} />
                  <span style={{ fontSize: 'clamp(13px, 3.3rem, 18px)', fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{s.name}</span>
                  <span style={{ fontSize: 'clamp(11px, 2.8rem, 14px)', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: 2 }}>{s.role}</span>
                </button>
              ))}
            </div>
            </div>
          </>
        )}

        {step === 3 && selectedBranch && selectedTarget && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', backgroundColor: '#FEF9F5', zIndex: 10, flexShrink: 0 }}>
              <button className="btn-reset flex-center" onClick={() => setStep(2)} style={{ width: 'clamp(40px, 10.2rem, 56px)', height: 'clamp(40px, 10.2rem, 56px)', borderRadius: '50%', backgroundColor: '#F1F5F9', marginRight: 16, flexShrink: 0 }}>
                <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1rem, 34px)', color: '#0F172A' }}>arrow_back</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 800, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedTarget.type === 'category' ? t(selectedTarget.item.nameKey) : selectedTarget.item.name}
                  </h2>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)', flexShrink: 0 }} />
                </div>
                <span style={{ fontSize: 'clamp(14px, 3.6rem, 20px)', color: '#64748B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedBranch.title}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
              <p style={{ fontSize: 'clamp(18px, 4.6rem, 26px)', fontWeight: 800, color: rating === 0 ? '#1E293B' : ratingColor(rating), marginBottom: 12, paddingTop: 8 }}>
              {rating === 0 ? t('review_your_rating') : t(RATING_LABEL_KEYS[rating])}
            </p>
            <div className="flex-between" style={{ marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((i) => {
                const selected = rating === i;
                const dimmed = rating !== 0 && !selected;
                return (
                  <button key={i} onClick={() => setRating(i)}
                    className="btn-reset flex-center"
                    style={{ 
                      width: 'clamp(46px, 12rem, 64px)', height: 'clamp(46px, 12rem, 64px)', borderRadius: '50%', 
                      backgroundColor: selected ? `${ratingColor(i)}33` : '#F1F5F9', 
                      border: selected ? `2px solid ${ratingColor(i)}` : '1px solid #E2E8F0', 
                      boxShadow: selected ? `0 5px 15px ${ratingColor(i)}4D` : 'none', 
                      fontSize: 'clamp(22px, 5.6rem, 32px)', lineHeight: 1, 
                      transform: selected ? 'scale(1.2)' : 'scale(1)', 
                      opacity: dimmed ? 0.3 : 1, 
                      transition: 'all .2s cubic-bezier(.34,1.56,.64,1)' 
                    }}>
                    {RATING_EMOJI[i]}
                  </button>
                );
              })}
            </div>
            {submitError && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 14,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span className="icon-material" style={{ fontSize: 20, color: '#EF4444' }}>error</span>
                <span style={{ fontSize: 'clamp(13px, 3.3rem, 16px)', color: '#DC2626', fontWeight: 600, flex: 1 }}>
                  {t('error_general')}
                </span>
              </div>
            )}
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('review_comment_placeholder')} rows={4}
              style={{ 
                width: '100%', padding: '20px 16px', borderRadius: 24, backgroundColor: '#F8FAFC', 
                border: '1px solid #E2E8F0', fontSize: 'clamp(15px, 3.8rem, 21px)', fontFamily: "'Outfit',sans-serif", 
                color: '#1E293B', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 24 
              }} 
            />
            <button onClick={handleSubmit} disabled={rating === 0 || sending}
              className="btn-reset flex-center"
              style={{ 
                width: '100%', padding: '14px 0', borderRadius: 20, 
                backgroundColor: rating === 0 ? '#94A3B8' : '#1B5E3D', 
                color: '#FFF', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 700, 
                cursor: rating === 0 ? 'default' : 'pointer', 
                opacity: rating === 0 ? 0.7 : 1, gap: 8 
              }}>
              {sending && <div style={{ width: 'clamp(16px, 5.1rem, 28px)', height: 'clamp(16px, 5.1rem, 28px)', borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#FFF', animation: 'rm-spin .6s linear infinite' }} />}
              {sending ? t('review_sending') : t('review_submit')}
            </button>
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}
