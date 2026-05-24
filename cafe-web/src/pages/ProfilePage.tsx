import { useState } from 'react';
import { useProfileStore } from '../stores/profile';
import AboutCafeModal from '../components/AboutCafeModal';

const MENU_ITEMS = [
  { icon: 'local_cafe', label: 'О кофейне', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: 'code', label: 'О разработчике', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: 'help', label: 'Вопросы и ответы', color: '#EAB308', bg: '#FEFCE8' },
  { icon: 'share', label: 'Поделиться приложением', color: '#10B981', bg: '#ECFDF5' },
  { icon: 'info', label: 'О приложении', color: '#8B5CF6', bg: '#F5F3FF' },
];

export default function ProfilePage() {
  const { name, phone } = useProfileStore();
  const [isAboutCafeOpen, setIsAboutCafeOpen] = useState(false);
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#F1F5F9', // Very light gray background
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* ─── Header ─── */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 24px 32px 24px',
      }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>
            Профиль
          </span>
        </div>

        {/* Minimalist Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div className="flex-center" style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#1B5E3D', // Brand Dark Green
            color: '#FFF',
            fontSize: 28,
            fontWeight: 800,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(27, 94, 61, 0.3)',
          }}>
            {firstLetter}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4, lineHeight: 1.2 }}>
              {name}
            </h3>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#64748B' }}>
              {phone}
            </p>
          </div>
          <button className="btn-reset flex-center" style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', flexShrink: 0, // Light Green BG
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
          }}>
            <span className="icon-material" style={{ fontSize: 20, color: '#10B981' }}>edit</span>
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{
        flex: 1,
        padding: '0 20px 100px 20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Quick Actions (Theme, Language) */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: '4px 16px',
          marginBottom: 24,
        }}>
          {/* Language */}
          <button className="btn-reset" style={{
            display: 'flex', alignItems: 'center', width: '100%', padding: '12px 0', borderBottom: '1px solid #F1F5F9'
          }}>
            <div className="flex-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', marginRight: 12 }}>
               <span style={{ fontSize: 16 }}>🇷🇺</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 500, color: '#0F172A' }}>Язык</span>
            <span style={{ fontSize: 15, color: '#64748B', marginRight: 4 }}>Русский</span>
            <span className="icon-material" style={{ fontSize: 20, color: '#CBD5E1' }}>chevron_right</span>
          </button>

          {/* Theme */}
          <button className="btn-reset" style={{
            display: 'flex', alignItems: 'center', width: '100%', padding: '12px 0'
          }}>
            <div className="flex-center" style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', marginRight: 12 }}>
               <span className="icon-material" style={{ fontSize: 18, color: '#10B981' }}>light_mode</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 500, color: '#0F172A' }}>Оформление</span>
            <span style={{ fontSize: 15, color: '#64748B', marginRight: 4 }}>Светлое</span>
            <span className="icon-material" style={{ fontSize: 20, color: '#CBD5E1' }}>chevron_right</span>
          </button>
        </div>

        {/* Menu Items - iOS Style List */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: '4px 16px',
          marginBottom: 32,
        }}>
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === 'О кофейне') {
                  setIsAboutCafeOpen(true);
                }
              }}
              className="btn-reset"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '12px 0',
                borderBottom: index === MENU_ITEMS.length - 1 ? 'none' : '1px solid #F1F5F9',
              }}
            >
              <div className="flex-center" style={{
                width: 32, height: 32, borderRadius: 8, backgroundColor: item.bg, marginRight: 12
              }}>
                <span className="icon-material" style={{ fontSize: 18, color: item.color, fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              </div>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 500, color: '#0F172A' }}>
                {item.label}
              </span>
              <span className="icon-material" style={{ fontSize: 20, color: '#CBD5E1' }}>
                chevron_right
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <button className="btn-reset" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#FFF', padding: '16px', borderRadius: 16,
            border: '1px solid #ECFDF5'
          }}>
            <span className="icon-material" style={{ fontSize: 20, color: '#10B981', marginRight: 8 }}>logout</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#10B981' }}>Выйти из аккаунта</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>
            Cafe v1.0.2
          </div>
        </div>
      </div>

      {isAboutCafeOpen && <AboutCafeModal onClose={() => setIsAboutCafeOpen(false)} />}
    </div>
  );
}
