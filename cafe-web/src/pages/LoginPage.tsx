import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(error.message + ' (Возможно, анонимный вход не включен в Supabase)');
    }
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

  const handlePhoneLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
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
    const { error } = await supabase.auth.verifyOtp({
      phone,
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
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Cafe App</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>Войдите, чтобы сохранять избранное и получать бонусы</p>
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
          <>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#F1F5F9',
                color: '#1E293B',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 24, height: 24, marginRight: 12 }} />
              Войти через Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              <span style={{ padding: '0 12px', color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>ИЛИ</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
                Номер телефона (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 555 123 456"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: 16,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={handlePhoneLogin}
              disabled={loading || phone.length < 9}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#1B5E3D',
                color: '#FFF',
                fontSize: 16,
                fontWeight: 700,
                opacity: (loading || phone.length < 9) ? 0.7 : 1,
                marginBottom: 16,
              }}
            >
              Получить код
            </button>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn-reset"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: 16,
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
              }}
            >
              Войти как демо
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
                Код из SMS/WhatsApp
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: 4,
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
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
              }}
            >
              Подтвердить
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
              Изменить номер
            </button>
          </>
        )}
      </div>
    </div>
  );
}
