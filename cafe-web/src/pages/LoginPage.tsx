import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import CountrySelectModal from '../components/CountrySelectModal';
import type { Country } from '../components/CountrySelectModal';
import { useT } from '../i18n/useT';
import QrCode from '../components/QrCode';

const TELEGRAM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [telegramSessionId, setTelegramSessionId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>({ code: '+996', flag: '🇰🇬', name: '', format: 'XXX XXX XXX' });
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const t = useT();

  // ─── Telegram auth: single owner of all teardown ───
  // Holds the live channel + poll timer + session id for the current attempt.
  // Both the realtime subscription and the poll fallback funnel through
  // completeTelegram(), which tears EVERYTHING down exactly once — fixing the
  // leak where a successful realtime login left the 2s poll running forever
  // (the persistent browser loading bar) and the dangling DB row.
  const tgRef = useRef<{ channel: RealtimeChannel; timer: ReturnType<typeof setInterval>; sessionId: string } | null>(null);

  const teardownTelegram = useCallback((deleteRow: boolean) => {
    const tg = tgRef.current;
    if (!tg) return;
    tgRef.current = null;
    clearInterval(tg.timer);
    tg.channel.unsubscribe();
    if (deleteRow) {
      // Don't leave abandoned rows behind (cancel / timeout / sign-in done)
      supabase.from('telegram_auth_requests').delete().eq('id', tg.sessionId).then(() => {});
    }
  }, []);

  // Safety net: tear down if the user leaves the login screen mid-attempt
  useEffect(() => () => teardownTelegram(false), [teardownTelegram]);

  useEffect(() => {
    if (token.length === 6 && otpSent && !loading && !error) {
      handleVerifyOtp();
    }
  }, [token, otpSent, loading, error]);

  const handleOtpChange = (index: number, val: string) => {
    setError(null);
    const char = val.replace(/\D/g, '').slice(-1);
    const newTokenArray = token.padEnd(6, ' ').split('');
    newTokenArray[index] = char || ' ';
    
    const newToken = newTokenArray.join('').trimEnd();
    setToken(newToken);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!token[index] || token[index] === ' ') {
        if (index > 0) {
          e.preventDefault();
          const newTokenArray = token.padEnd(6, ' ').split('');
          newTokenArray[index - 1] = ' ';
          setToken(newTokenArray.join('').trimEnd());
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        const newTokenArray = token.padEnd(6, ' ').split('');
        newTokenArray[index] = ' ';
        setToken(newTokenArray.join('').trimEnd());
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setToken(pasted);
      if (pasted.length < 6) {
        inputRefs.current[pasted.length]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const format = selectedCountry.format || 'XXX XXX XXX';
    
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < format.length; i++) {
      if (digitIndex >= digits.length) break;
      
      if (format[i] === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }
    
    setPhone(formatted);
  };

  // Runs once when the bot reports a verified request — guarded so the
  // realtime event and the poll fallback can't both sign in.
  const completeTelegram = async (data: { phone?: string; temp_password?: string; status?: string }) => {
    if (!tgRef.current) return; // already handled / torn down
    if (data.status !== 'verified' || !data.phone || !data.temp_password) return;

    teardownTelegram(true); // stop polling + realtime, delete the row — BEFORE the await
    const { error: authError } = await supabase.auth.signInWithPassword({
      phone: data.phone,
      password: data.temp_password,
    });
    if (authError) setError(authError.message);
    setTelegramSessionId(null);
    setLoading(false);
    // On success the auth listener swaps to the app; this component unmounts.
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

      // Primary: realtime push the instant the bot verifies
      const channel = supabase
        .channel(`telegram_auth_${sessionId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'telegram_auth_requests', filter: `id=eq.${sessionId}` },
          (payload) => completeTelegram(payload.new as any),
        )
        .subscribe();

      // Fallback: slow poll in case the realtime socket drops. Self-limiting
      // via the timeout below — never runs unbounded.
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

  const handlePhoneLogin = async (channel: 'sms' | 'whatsapp') => {
    setLoading(true);
    setError(null);
    const fullPhone = `${selectedCountry.code}${phone.replace(/\D/g, '')}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      options: { channel }
    });
    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    const fullPhone = `${selectedCountry.code}${phone.replace(/\D/g, '')}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token,
      type: 'sms',
    });
    if (error) {
      setError(error.message);
    }
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

        {!otpSent ? (
          telegramSessionId ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>Вход через Telegram</h3>
                <p style={{ fontSize: 14, color: '#64748B' }}>Перейдите в Telegram, нажмите "Запустить" и поделитесь контактом.</p>
              </div>

              {/* QR Code for Desktop */}
              {typeof window !== 'undefined' && window.innerWidth > 640 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <QrCode data={`https://t.me/MyGreenChickenBot?start=${telegramSessionId}`} size={160} iconSize={0} color="#000000" backgroundColor="#FFFFFF" />
                  </div>
                  <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Отсканируйте камерой телефона</p>
                </div>
              )}

              {/* Deep link for Mobile */}
              {typeof window !== 'undefined' && window.innerWidth <= 640 && (
                <a 
                  href={`https://t.me/MyGreenChickenBot?start=${telegramSessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: '#0088cc',
                    color: '#FFF',
                    fontSize: 16,
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                  </svg>
                  Открыть Telegram
                </a>
              )}

              <div style={{ display: 'flex', alignItems: 'center', color: '#059669', backgroundColor: '#ECFDF5', padding: '8px 16px', borderRadius: '8px', fontSize: 14 }}>
                <span className="icon-material" style={{ fontSize: 16, marginRight: 8, animation: 'spin 1s linear infinite' }}>refresh</span>
                <span>Ожидаем подтверждения...</span>
              </div>

              <button onClick={cancelTelegramAuth} style={{ fontSize: 14, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
                Отмена
              </button>
            </div>
          ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>
                {t('login_phone_label')}
              </label>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12, lineHeight: 1.4, marginTop: 0 }}>
                {t('login_phone_hint')}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <button
                  className="btn-reset"
                  onClick={() => setIsCountryModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 12px',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F1F5F9',
                    fontSize: 16,
                    fontWeight: 600,
                    height: 56,
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ fontSize: 24, marginRight: 8 }}>{selectedCountry.flag}</span>
                  <span style={{ color: '#1E293B', marginRight: 4 }}>{selectedCountry.code}</span>
                  <span className="icon-material" style={{ fontSize: 20, color: '#94A3B8' }}>
                    expand_more
                  </span>
                </button>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={selectedCountry.format ? selectedCountry.format.replace(/X/g, '0') : '000 000 000'}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '16px',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 600,
                    outline: 'none',
                    height: 56,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => handlePhoneLogin('whatsapp')}
              disabled={loading || phone.replace(/\D/g, '').length < (selectedCountry.format?.replace(/[^X]/g, '').length || 9)}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#25D366',
                color: '#FFF',
                fontSize: 16,
                fontWeight: 700,
                opacity: (loading || phone.replace(/\D/g, '').length < (selectedCountry.format?.replace(/[^X]/g, '').length || 9)) ? 0.7 : 1,
                marginBottom: 16,
              }}
            >
              {t('login_get_code_whatsapp')}
            </button>

            <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #E2E8F0' }}></div>
              <span style={{ position: 'relative', backgroundColor: '#FEF9F5', padding: '0 12px', color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>ИЛИ</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
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
                opacity: loading ? 0.7 : 1,
                marginBottom: 16,
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 24, height: 24 }} />
              Войти через Google
            </button>

            <button
              onClick={handleTelegramLogin}
              disabled={loading}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#0088cc',
                color: '#FFF',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" fill="currentColor"/>
              </svg>
              Войти через Telegram
            </button>
          </>
          )
        ) : (
          <>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B', margin: '0 0 12px 0' }}>{t('login_otp_title') || 'Введите код'}</h2>
              <p style={{ fontSize: 15, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                {t('login_otp_subtitle_whatsapp')}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 32
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={token[i] && token[i] !== ' ' ? token[i] : ''}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  style={{
                    width: 45,
                    height: 56,
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    fontSize: 24,
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                    color: '#1E293B'
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || token.length < 6}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#1B5E3D',
                color: '#FFF',
                fontSize: 16,
                fontWeight: 700,
                opacity: (loading || token.length < 6) ? 0.7 : 1,
                marginBottom: 16,
                display: loading ? 'flex' : 'block',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {loading ? (
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : t('login_confirm')}
            </button>
            <button
              onClick={() => setOtpSent(false)}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                color: '#64748B',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {t('login_change_number')}
            </button>
          </>
        )}
      </div>

      {isCountryModalOpen && (
        <CountrySelectModal
          onClose={() => setIsCountryModalOpen(false)}
          onSelect={(country) => {
            setSelectedCountry(country);
            setPhone(''); // Clear phone when changing country
          }}
          selectedCode={selectedCountry.code}
        />
      )}
    </div>
  );
}
