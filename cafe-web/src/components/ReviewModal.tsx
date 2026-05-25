import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const RATING_EMOJI: Record<number, string> = { 1: '😡', 2: '🙁', 3: '😐', 4: '🙂', 5: '😍' };
const RATING_LABELS: Record<number, string> = { 1: 'Ужасно', 2: 'Плохо', 3: 'Нормально', 4: 'Хорошо', 5: 'Отлично' };

function ratingColor(r: number): string {
  switch (r) { case 1: return '#EF4444'; case 2: return '#F97316'; case 3: return '#EAB308'; case 4: return '#84CC16'; case 5: return '#10B981'; default: return '#FFF'; }
}

const BRANCHES = [
  { id: '1', name: 'Центральный филиал', address: 'Бишкек, пр. Чуй 125', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=200&h=200' },
  { id: '2', name: 'Парк Ататюрк', address: 'Бишкек, ул. Ахунбаева 92', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=200&h=200' },
  { id: '3', name: 'Дордой Плаза', address: 'Бишкек, ул. Ибраимова 115', image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&h=200' },
  { id: '4', name: 'Южные Ворота', address: 'Бишкек, ул. Токомбаева 23/1', image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=200&h=200' },
];

const CATEGORIES = [
  { id: 'c1', name: 'Кофейня', image: '/categories/2.png', borderColor: '#D97706' },
  { id: 'c2', name: 'Обслуживание', image: '/categories/5.png', borderColor: '#B45309' },
  { id: 'c3', name: 'Чистота', image: '/categories/3.png', borderColor: '#16A34A' },
  { id: 'c4', name: 'Атмосфера', image: '/categories/1.png', borderColor: '#F59E0B' },
  { id: 'c5', name: 'Вкус кофе', image: '/categories/4.png', borderColor: '#2563EB' },
];

const STAFF = [
  { id: 's1', name: 'Алексей Иванов', role: 'Шеф-бариста', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200', borderColor: '#A16207' },
  { id: 's2', name: 'Дмитрий Козлов', role: 'Бариста-обжарщик', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200', borderColor: '#A16207' },
  { id: 's3', name: 'Анна Смирнова', role: 'Менеджер', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200', borderColor: '#A16207' },
];

type Branch = typeof BRANCHES[0];
type Category = typeof CATEGORIES[0];
type Staff = typeof STAFF[0];
type ReviewTarget = { type: 'category'; item: Category } | { type: 'staff'; item: Staff };

interface Props { onClose: () => void }

export default function ReviewModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<ReviewTarget | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (rating === 0 || sending) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false); setSent(true);
  };

  if (sent) {
    return createPortal(
      <div className="overlay-base" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 9999 }}>
        <div className="sheet-base flex-col" style={{ padding: '48px 16px 40px', alignItems: 'center' }}>
          <div className="flex-center" style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,.15)', animation: 'rm-success-pop .4s cubic-bezier(.34,1.56,.64,1)' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(56px, 14.3vw, 78px)', color: '#10B981', fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 6.6vw, 36px)', fontWeight: 800, color: '#1E293B', marginTop: 32, marginBottom: 12 }}>Спасибо за отзыв!</h2>
          <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>Ваше мнение помогает нам становиться лучше</p>
          <button className="btn-reset" onClick={onClose} style={{ marginTop: 48, width: '100%', padding: '14px 0', borderRadius: 20, backgroundColor: '#F1F5F9', color: '#1E293B', fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700 }}>Готово</button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="overlay-base" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 9999 }}>
      <div className="sheet-base" style={{ maxHeight: '55vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {step === 1 && (
          <>
            <div className="flex-between" style={{ padding: '24px 16px 16px', backgroundColor: '#FEF9F5', zIndex: 10, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
                  Выберите кофейню
                </h2>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
              </div>
              <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}>
                <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
              <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', marginBottom: 24, margin: 0, paddingTop: 4 }}>
                Какую кофейню вы хотите оценить?
              </p>
  
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {BRANCHES.map(b => (
                <button key={b.id} className="btn-reset" onClick={() => { setSelectedBranch(b); setStep(2); }}
                  style={{
                    display: 'flex', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: '12px 16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', textAlign: 'left', border: '1px solid #F1F5F9'
                  }}>
                  <img src={b.image} alt={b.name} style={{ width: 'clamp(88px, 22.5vw, 120px)', height: 'clamp(88px, 22.5vw, 120px)', borderRadius: 20, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, padding: '0 16px' }}>
                    <h4 style={{ fontSize: 'clamp(17px, 4.3vw, 24px)', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                    </h4>
                    <p style={{ fontSize: 'clamp(13px, 3.3vw, 18px)', color: '#64748B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.address}
                    </p>
                  </div>
                  <div style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: 18, backgroundColor: '#1B5E3D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="icon-material" style={{ color: '#FFF', fontSize: 'clamp(20px, 5.1vw, 28px)' }}>chevron_right</span>
                  </div>
                </button>
              ))}
            </div>
            </div>
          </>
        )}

        {step === 2 && selectedBranch && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '24px 16px 16px', backgroundColor: '#FEF9F5', zIndex: 10, flexShrink: 0 }}>
              <button className="btn-reset flex-center" onClick={() => setStep(1)} style={{ width: 'clamp(40px, 10.2vw, 56px)', height: 'clamp(40px, 10.2vw, 56px)', borderRadius: '50%', backgroundColor: '#F1F5F9', marginRight: 16, flexShrink: 0 }}>
                <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1vw, 34px)', color: '#0F172A' }}>arrow_back</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', fontWeight: 800, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedBranch.name}
                  </h2>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)', flexShrink: 0 }} />
                </div>
                <span style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', color: '#64748B', marginTop: 2 }}>Оцените кофейню</span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
              <h3 style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: '#1E293B', marginBottom: 16, paddingTop: 8 }}>Категории</h3>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, margin: '0 -16px', padding: '0 16px' }}>
              {CATEGORIES.map(c => (
                <button key={c.id} className="btn-reset" onClick={() => { setSelectedTarget({ type: 'category', item: c }); setStep(3); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'clamp(96px, 24.6vw, 135px)', flexShrink: 0 }}>
                  <img src={c.image} alt={c.name} style={{ width: 'clamp(96px, 24.6vw, 135px)', height: 'clamp(96px, 24.6vw, 135px)', borderRadius: 20, objectFit: 'cover', marginBottom: 8, border: `3px solid ${c.borderColor}`, boxShadow: `0 8px 16px ${c.borderColor}40` }} />
                  <span style={{ fontSize: 'clamp(13px, 3.3vw, 18px)', fontWeight: 700, color: '#1E293B', textAlign: 'center' }}>{c.name}</span>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: '#1E293B', marginTop: 24, marginBottom: 16 }}>Сотрудники кофейни</h3>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, margin: '0 -16px', padding: '0 16px' }}>
              {STAFF.map(s => (
                <button key={s.id} className="btn-reset" onClick={() => { setSelectedTarget({ type: 'staff', item: s }); setStep(3); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 'clamp(96px, 24.6vw, 135px)', flexShrink: 0 }}>
                  <img src={s.image} alt={s.name} style={{ width: 'clamp(96px, 24.6vw, 135px)', height: 'clamp(96px, 24.6vw, 135px)', borderRadius: 20, objectFit: 'cover', marginBottom: 10, border: `3px solid ${s.borderColor}`, boxShadow: `0 8px 16px ${s.borderColor}40` }} />
                  <span style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{s.name}</span>
                  <span style={{ fontSize: 'clamp(12px, 3.1vw, 16px)', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: 2 }}>{s.role}</span>
                </button>
              ))}
            </div>
            </div>
          </>
        )}

        {step === 3 && selectedBranch && selectedTarget && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '24px 16px 16px', backgroundColor: '#FEF9F5', zIndex: 10, flexShrink: 0 }}>
              <button className="btn-reset flex-center" onClick={() => setStep(2)} style={{ width: 'clamp(40px, 10.2vw, 56px)', height: 'clamp(40px, 10.2vw, 56px)', borderRadius: '50%', backgroundColor: '#F1F5F9', marginRight: 16, flexShrink: 0 }}>
                <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1vw, 34px)', color: '#0F172A' }}>arrow_back</span>
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', fontWeight: 800, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedTarget.item.name}
                  </h2>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)', flexShrink: 0 }} />
                </div>
                <span style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', color: '#64748B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedBranch.name}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
              <p style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: rating === 0 ? '#1E293B' : ratingColor(rating), marginBottom: 12, paddingTop: 8 }}>
              {rating === 0 ? 'Ваша оценка' : RATING_LABELS[rating]}
            </p>
            <div className="flex-between" style={{ marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((i) => {
                const selected = rating === i;
                const dimmed = rating !== 0 && !selected;
                return (
                  <button key={i} onClick={() => setRating(i)}
                    className="btn-reset flex-center"
                    style={{ 
                      width: 'clamp(54px, 13.8vw, 75px)', height: 'clamp(54px, 13.8vw, 75px)', borderRadius: '50%', 
                      backgroundColor: selected ? `${ratingColor(i)}33` : '#F1F5F9', 
                      border: selected ? `2px solid ${ratingColor(i)}` : '1px solid #E2E8F0', 
                      boxShadow: selected ? `0 5px 15px ${ratingColor(i)}4D` : 'none', 
                      fontSize: 'clamp(26px, 6.6vw, 36px)', lineHeight: 1, 
                      transform: selected ? 'scale(1.2)' : 'scale(1)', 
                      opacity: dimmed ? 0.3 : 1, 
                      transition: 'all .2s cubic-bezier(.34,1.56,.64,1)' 
                    }}>
                    {RATING_EMOJI[i]}
                  </button>
                );
              })}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Расскажите подробнее (необязательно)" rows={4}
              style={{ 
                width: '100%', padding: '20px 16px', borderRadius: 24, backgroundColor: '#F8FAFC', 
                border: '1px solid #E2E8F0', fontSize: 'clamp(15px, 3.8vw, 21px)', fontFamily: "'Outfit',sans-serif", 
                color: '#1E293B', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 24 
              }} 
            />
            <button onClick={handleSubmit} disabled={rating === 0 || sending}
              className="btn-reset flex-center"
              style={{ 
                width: '100%', padding: '14px 0', borderRadius: 20, 
                backgroundColor: rating === 0 ? '#94A3B8' : '#1B5E3D', 
                color: '#FFF', fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700, 
                cursor: rating === 0 ? 'default' : 'pointer', 
                opacity: rating === 0 ? 0.7 : 1, gap: 8 
              }}>
              {sending && <div style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#FFF', animation: 'rm-spin .6s linear infinite' }} />}
              {sending ? 'Отправка...' : 'Отправить отзыв'}
            </button>
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}
