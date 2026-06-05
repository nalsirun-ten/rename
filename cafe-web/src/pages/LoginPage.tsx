import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CountrySelectModal, { COUNTRIES } from '../components/CountrySelectModal';
import { useT } from '../i18n/useT';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const t = useT();

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
    const fullPhone = `${selectedCountry.code}${phone.replace(/\\D/g, '')}`;
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
          </>
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
