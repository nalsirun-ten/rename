import { useState, useCallback, useEffect } from 'react';

const RATING_EMOJI: Record<number, string> = { 1: '😡', 2: '🙁', 3: '😐', 4: '🙂', 5: '😍' };
const RATING_LABELS: Record<number, string> = { 1: 'Ужасно', 2: 'Плохо', 3: 'Нормально', 4: 'Хорошо', 5: 'Отлично' };

function ratingColor(r: number): string {
  switch (r) { case 1: return '#EF4444'; case 2: return '#F97316'; case 3: return '#EAB308'; case 4: return '#84CC16'; case 5: return '#10B981'; default: return '#FFF'; }
}

interface Props { onClose: () => void }

export default function ReviewModal({ onClose }: Props) {
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
    return (
      <div className="rm-overlay overlay-base" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="rm-sheet sheet-base flex-col" style={{ padding: '48px 32px 40px', alignItems: 'center' }}>
          <div className="flex-center" style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,.15)', animation: 'rm-success-pop .4s cubic-bezier(.34,1.56,.64,1)' }}>
            <span className="icon-material" style={{ fontSize: 56, color: '#10B981', fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', marginTop: 32, marginBottom: 12 }}>Спасибо за отзыв!</h2>
          <p style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>Ваше мнение помогает нам становиться лучше</p>
          <button className="btn-reset" onClick={onClose} style={{ marginTop: 48, width: '100%', padding: '14px 0', borderRadius: 20, backgroundColor: '#F1F5F9', color: '#1E293B', fontSize: 16, fontWeight: 700 }}>Готово</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rm-overlay overlay-base" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rm-sheet sheet-base" style={{ maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div className="drag-handle" />
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Оставить отзыв</h3>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#64748B', marginBottom: 20 }}>Поделитесь впечатлениями о нашем кафе</p>
        <p style={{ fontSize: 18, fontWeight: 800, color: rating === 0 ? '#1E293B' : ratingColor(rating), marginBottom: 12 }}>{rating === 0 ? 'Ваша оценка' : RATING_LABELS[rating]}</p>
        <div className="flex-between" style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => {
            const selected = rating === i;
            const dimmed = rating !== 0 && !selected;
            return (
              <button key={i} onClick={() => setRating(i)}
                className="btn-reset flex-center"
                style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: selected ? `${ratingColor(i)}33` : '#F1F5F9', border: selected ? `2px solid ${ratingColor(i)}` : '1px solid #E2E8F0', boxShadow: selected ? `0 5px 15px ${ratingColor(i)}4D` : 'none', fontSize: 26, lineHeight: 1, transform: selected ? 'scale(1.2)' : 'scale(1)', opacity: dimmed ? 0.3 : 1, transition: 'all .2s cubic-bezier(.34,1.56,.64,1)' }}>
                {RATING_EMOJI[i]}
              </button>
            );
          })}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Расскажите подробнее (необязательно)" rows={4}
          style={{ width: '100%', padding: 20, borderRadius: 24, backgroundColor: '#E2E8F0', border: '1px solid #000', fontSize: 15, fontFamily: "'Outfit',sans-serif", color: '#1E293B', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 20 }} />
        <button onClick={handleSubmit} disabled={rating === 0 || sending}
          className="btn-reset flex-center"
          style={{ width: '100%', padding: '14px 0', borderRadius: 20, backgroundColor: rating === 0 ? '#3D7A5C' : '#1B5E3D', color: rating === 0 ? 'rgba(255,255,255,.7)' : '#FFF', fontSize: 16, fontWeight: 700, cursor: rating === 0 ? 'default' : 'pointer', opacity: rating === 0 ? 0.7 : 1, gap: 8 }}>
          {sending && <div style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#FFF', animation: 'rm-spin .6s linear infinite' }} />}
          {sending ? 'Отправка...' : 'Отправить отзыв'}
        </button>
      </div>
    </div>
  );
}
