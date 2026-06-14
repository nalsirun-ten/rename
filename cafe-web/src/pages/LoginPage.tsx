import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useT } from '../i18n/useT';
const TELEGRAM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramSessionId, setTelegramSessionId] = useState<string | null>(null);
  const t = useT();

  const tgRef = useRef<{ channel: RealtimeChannel; timer: ReturnType<typeof setInterval>; sessionId: string } | null>(null);

  const teardownTelegram = useCallback((deleteRow: boolean) => {
    const tg = tgRef.current;
    if (!tg) return;
    tgRef.current = null;
    clearInterval(tg.timer);
    tg.channel.unsubscribe();
    if (deleteRow) {
      supabase.from('telegram_auth_requests').delete().eq('id', tg.sessionId).then(() => {});
    }
  }, []);

  useEffect(() => () => teardownTelegram(false), [teardownTelegram]);

  const completeTelegram = async (data: { phone?: string; temp_password?: string; status?: string }) => {
    if (!tgRef.current) return;
    if (data.status !== 'verified' || !data.phone || !data.temp_password) return;

    teardownTelegram(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      phone: data.phone,
      password: data.temp_password,
    });
    if (authError) setError(authError.message);
    setTelegramSessionId(null);
    setLoading(false);
  };

  const handleTelegramLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();

      const { error: insertError } = await supabase
        .from('telegram_auth_requests')
        .insert({ id: sessionId });
      if (insertError) throw insertError;

      setTelegramSessionId(sessionId);

      const channel = supabase
        .channel(`telegram_auth_${sessionId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'telegram_auth_requests', filter: `id=eq.${sessionId}` },
          (payload) => completeTelegram(payload.new as any),
        )
        .subscribe();

      const startedAt = Date.now();
      const timer = setInterval(async () => {
        if (!tgRef.current) return;
        if (Date.now() - startedAt > TELEGRAM_TIMEOUT_MS) {
          teardownTelegram(true);
          setTelegramSessionId(null);
          setLoading(false);
          setError('Время ожидания истекло. Попробуйте снова.');
          return;
        }
        const { data } = await supabase
          .from('telegram_auth_requests')
          .select('phone, temp_password, status')
          .eq('id', sessionId)
          .single();
        if (data) completeTelegram(data);
      }, 2500);

      tgRef.current = { channel, timer, sessionId };
      window.location.href = `tg://resolve?domain=MyGreenChickenBot&start=${sessionId}`;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setTelegramSessionId(null);
    }
  };

  const cancelTelegramAuth = () => {
    teardownTelegram(true);
    setTelegramSessionId(null);
    setLoading(false);
  };


  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100vh',
      maxWidth: '430px',
      margin: '0 auto',
      backgroundColor: '#1B5E3D',
      color: '#FFF',
      padding: '40px 16px',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Green Chicken App</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>{t('login_subtitle')}</p>
      </div>

      <div style={{
        backgroundColor: '#FEF9F5',
        borderRadius: 24,
        padding: '24px 16px',
        color: '#1E293B',
      }}>
        {error && (
          <div style={{ padding: 12, backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: 12, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={loading || !!telegramSessionId}
            className="btn-reset"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              backgroundColor: '#FFF',
              border: '1px solid #E2E8F0',
              color: '#1E293B',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading || telegramSessionId ? 0.7 : 1,
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 24, height: 24 }} />
            Войти через Google
          </button>

          <button
            onClick={telegramSessionId ? cancelTelegramAuth : handleTelegramLogin}
            disabled={loading && !telegramSessionId}
            className="btn-reset"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              backgroundColor: telegramSessionId ? '#ECFDF5' : '#0088cc',
              color: telegramSessionId ? '#059669' : '#FFF',
              fontSize: telegramSessionId ? 14 : 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading && !telegramSessionId ? 0.7 : 1,
              border: telegramSessionId ? '1px solid #10B981' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {telegramSessionId ? (
              <>
                <span className="icon-material" style={{ fontSize: 20, animation: 'spin 1s linear infinite' }}>refresh</span>
                Ожидаем... (Отмена)
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" fill="currentColor"/>
                </svg>
                Войти через Telegram
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
