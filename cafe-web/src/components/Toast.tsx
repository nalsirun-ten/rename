import { useToastStore } from '../stores/toast';

const TYPE_STYLES: Record<string, { bg: string; icon: string }> = {
  info:    { bg: '#1E293B', icon: '\uE88E' },
  success: { bg: '#10B981', icon: '\uE5CA' },
  error:   { bg: '#EF4444', icon: '\uE000' },
  notification: { bg: '#1B5E3D', icon: '\uE7F4' },
};

export default function Toast() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        left: 16,
        right: 16,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            style={{
              backgroundColor: style.bg,
              borderRadius: 16,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              animation: 'toast-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              pointerEvents: 'auto',
              cursor: 'pointer',
              maxWidth: 400,
              alignSelf: 'center',
            }}
          >
            <span
              className="icon-material"
              style={{
                fontSize: 22,
                color: '#FFF',
                flexShrink: 0,
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {style.icon}
            </span>
            <span
              style={{
                fontSize: 'clamp(14px, 3.6rem, 18px)',
                fontWeight: 600,
                color: '#FFF',
                lineHeight: 1.3,
              }}
            >
              {toast.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
