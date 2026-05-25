import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    question: 'Как копить баллы?',
    answer: 'Вы получаете баллы за каждую покупку. Просто покажите ваш QR-код баристе перед оплатой заказа. 1 балл = 1 сом.',
  },
  {
    question: 'Как повысить уровень?',
    answer: 'В нашей программе лояльности 4 уровня: Любитель (кэшбек 3%, 0-100 визитов), Ценитель (5%, 100-500), Знаток (7%, 500-1000) и Гурман (10%, 1000+). Ваш уровень повышается автоматически в зависимости от количества ваших визитов в кофейню. Чем чаще вы нас посещаете, тем выше ваш кэшбек!',
  },
  {
    question: 'Как сделать заказ?',
    answer: 'В данный момент функция предварительного заказа находится в разработке. Вы можете ознакомиться с меню в приложении и сделать заказ лично в любой из наших кофеен.',
  },
  {
    question: 'Где посмотреть адреса кофеен?',
    answer: 'Все адреса, графики работы и маршруты к нашим кофейням вы можете найти в разделе "Филиалы" на главном экране.',
  },
  {
    question: 'Как оставить отзыв?',
    answer: 'Вы можете оставить отзыв на главной странице в разделе "Отзывы". Просто нажмите кнопку "Оставить отзыв" и поделитесь вашими впечатлениями.',
  },
  {
    question: 'Могу ли я удалить аккаунт?',
    answer: 'Да, вы можете удалить свой аккаунт. Для этого напишите в нашу службу поддержки через раздел "Настройки и помощь", и мы удалим ваши данные в течение 30 дней.',
  },
];

export default function FAQModal({ onClose }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <div style={{ flex: 1 }} onClick={onClose} />

      <div style={{
        backgroundColor: '#FCFBFA',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: '24px 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 5.6vw, 32px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
              Вопросы и ответы
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          <button 
            onClick={onClose}
            className="btn-reset flex-center"
            style={{ width: 'clamp(36px, 9.2vw, 50px)', height: 'clamp(36px, 9.2vw, 50px)', borderRadius: '50%', backgroundColor: '#F1F5F9' }}
          >
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#0F172A', fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* FAQ List */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4, paddingBottom: 16 }}>
          {FAQ_ITEMS.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
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
                  <span style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 600, color: '#1E293B', textAlign: 'left' }}>
                    {item.question}
                  </span>
                  <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1vw, 28px)', color: '#CBD5E1', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                {isExpanded && (
                  <div style={{ paddingBottom: 16, paddingRight: 20 }}>
                    <p style={{ fontSize: 'clamp(14px, 3.6vw, 20px)', fontWeight: 500, color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
