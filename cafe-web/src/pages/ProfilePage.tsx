import { useProfileStore } from '../stores/profile';

const MENU_ITEMS = [
  { icon: 'local_cafe', label: 'О кофейне', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: 'code', label: 'О разработчике', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: 'help', label: 'Вопросы и ответы', color: '#EAB308', bg: '#FEFCE8' },
  { icon: 'share', label: 'Поделиться приложением', color: '#10B981', bg: '#ECFDF5' },
  { icon: 'info', label: 'О приложении', color: '#8B5CF6', bg: '#F5F3FF' },
];

export default function ProfilePage() {
  const { name, phone } = useProfileStore();
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1B5E3D',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* ─── Header ─── */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 32px) 20px 32px 20px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#FFF' }}>
            Профиль
          </span>
        </div>

        {/* Profile Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left: User Card */}
          <div style={{
            backgroundColor: '#1E293B',
            borderRadius: 32,
            padding: '12px 8px',
            aspectRatio: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            {/* Avatar */}
            <div className="flex-center" style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#65A30D',
              color: '#FFF',
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 10,
            }}>
              {firstLetter}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', marginBottom: 4, textAlign: 'center', lineHeight: 1.2 }}>
              {name}
            </h3>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', textAlign: 'center' }}>
              {phone}
            </p>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
            <button className="btn-reset" style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0F172A',
              borderRadius: 32,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Emojis Background to simulate flags */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexWrap: 'wrap', gap: '4px',
                padding: '8px', fontSize: '18px', lineHeight: 1, opacity: 0.8,
                justifyContent: 'center', alignContent: 'center'
              }}>
                🇬🇧 🇺🇸 🇨🇦 🇲🇽 🇦🇺 🇪🇺 🇨🇳 🇮🇳 🇯🇵 🇰🇷 🇹🇭 🇻🇳 🇵🇭 🇮🇩 🇷🇺 🇨🇱
              </div>
              {/* Dark Overlay */}
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
              {/* Text */}
              <span style={{ position: 'relative', fontSize: 16, fontWeight: 700, color: '#FFF', zIndex: 1 }}>
                Язык
              </span>
            </button>

            {/* Icon Buttons Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%', alignItems: 'center' }}>
              <button className="btn-reset flex-center" style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: '#2563EB',
                borderRadius: '50%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                <span className="icon-material" style={{ fontSize: 28, color: '#FFF' }}>light_mode</span>
              </button>
              <button className="btn-reset flex-center" style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: '#22C55E',
                borderRadius: '50%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                <span className="icon-material" style={{ fontSize: 28, color: '#FFF' }}>edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: '24px 20px 100px 20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginRight: 8 }}>
            Настройки и помощь
          </h2>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
        </div>

        {/* Menu Items */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: 24,
          padding: '8px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: 24,
        }}>
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.label}
              className="btn-reset"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '16px 0',
                borderBottom: index === MENU_ITEMS.length - 1 ? 'none' : '1px solid #F1F5F9',
              }}
            >
              <div className="flex-center" style={{
                width: 40, height: 40, borderRadius: 12, backgroundColor: item.bg, marginRight: 16
              }}>
                <span className="icon-material" style={{ fontSize: 20, color: item.color }}>
                  {item.icon}
                </span>
              </div>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                {item.label}
              </span>
              <span className="icon-material" style={{ fontSize: 20, color: '#CBD5E1' }}>
                chevron_right
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button className="btn-reset" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#DCFCE7', padding: '16px', borderRadius: 20,
          }}>
            <span className="icon-material" style={{ fontSize: 20, color: '#16A34A', marginRight: 12 }}>
              logout
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#16A34A' }}>Выйти из аккаунта</span>
          </button>
          
          <button className="btn-reset" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#FEE2E2', padding: '16px', borderRadius: 20,
          }}>
            <span className="icon-material" style={{ fontSize: 20, color: '#DC2626', marginRight: 12 }}>
              person_remove
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#DC2626' }}>Удалить аккаунт</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8' }}>
            Условия использования · Конфиденциальность
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>
            Cafe v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
