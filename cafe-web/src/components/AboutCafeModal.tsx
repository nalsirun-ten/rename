import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeToClose } from '../hooks/useSwipeToClose';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useOverlayClose } from '../hooks/useOverlayClose';

interface Props {
  onClose: () => void;
}

export default function AboutCafeModal({ onClose }: Props) {
  const sheetRef = useSwipeToClose(onClose);

  useLockBodyScroll();

  const handleOverlay = useOverlayClose(onClose);

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
        {/* Header */}
        <div className="flex-between" style={{ padding: '24px 16px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              О кофейне
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button className="btn-reset flex-center" onClick={onClose} style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#64748B', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
          {/* Top Image */}
        <div style={{ width: '100%', height: 'clamp(200px, 51vw, 280px)', borderRadius: 24, marginBottom: 32, overflow: 'hidden', backgroundColor: '#E2E8F0', flexShrink: 0 }}>
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop" 
            alt="Staff"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 800, color: '#1E293B', marginBottom: 16 }}>
          О нашей кофейне
        </h2>
        
        <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
          Cafe — это уютная кофейня в самом сердце города, где каждый гость становится частью нашей кофейной семьи. 
          Мы варим кофе из отборных зёрен арабики, обжаренных с любовью и заботой. Наши бариста — настоящие мастера своего дела, 
          которые знают, как превратить обычную чашку кофе в маленькое произведение искусства. Мы верим, что хороший кофе — 
          это не просто напиток, а целая культура, объединяющая людей. Приходите к нам за настроением, оставайтесь за вкусом!
        </p>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Section 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, paddingLeft: 12, borderLeft: '4px solid #1B5E3D' }}>
              <h3 style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                📖 Наша история
              </h3>
            </div>
            <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Всё началось с мечты — создать место, где каждый глоток кофе рассказывает историю. Основанная в 2020 году, наша кофейня 
              выросла из маленького киоска в сеть уютных пространств по всему городу. Мы начинали с одной кофемашины и безграничной 
              любви к своему делу, а сегодня нас знают и любят тысячи гостей. Каждый день мы просыпаемся с мыслью о том, как сделать 
              ваш кофе ещё вкуснее, а атмосферу — ещё теплее. Это не просто бизнес, это наша страсть, которой мы делимся с вами.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, paddingLeft: 12, borderLeft: '4px solid #1B5E3D' }}>
              <h3 style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                ☕ Наш кофе
              </h3>
            </div>
            <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Мы работаем только с премиальной арабикой из Бразилии, Эфиопии и Колумбии. Каждое зерно проходит тройной контроль 
              качества: на плантации, при транспортировке и перед обжаркой. Мы обжариваем кофе малыми партиями, чтобы сохранить 
              всю глубину вкуса и аромата — от ярких цитрусовых нот до бархатистых шоколадных оттенков.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, paddingLeft: 12, borderLeft: '4px solid #1B5E3D' }}>
              <h3 style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                💚 Наша философия
              </h3>
            </div>
            <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Кофе — это больше, чем напиток. Это ритуал, который объединяет людей, дает минуты спокойствия в суете дня и становится 
              поводом для искренних разговоров. Мы создаём пространство, где комфортно каждому: студенту с ноутбуком, деловому партнёру 
              на встрече или друзьям за воскресным бранчем. Уважение к гостю, забота о качестве и внимание к деталям — вот три принципа, 
              на которых строится каждый наш день.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, paddingLeft: 12, borderLeft: '4px solid #1B5E3D' }}>
              <h3 style={{ fontSize: 'clamp(18px, 4.6vw, 26px)', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                ⭐ Почему выбирают нас
              </h3>
            </div>
            <p style={{ fontSize: 'clamp(15px, 3.8vw, 21px)', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Свежая обжарка каждую неделю, авторские напитки от чемпионов бариста, уютный интерьер с панорамными окнами и 
              бесплатный Wi-Fi. Мы помним ваше имя и любимый напиток уже со второго визита. Бонусная программа позволяет копить баллы 
              и получать подарки. А ещё у нас проходят кофейные мастер-классы, дегустации и джем-сейшены по выходным.
            </p>
          </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
