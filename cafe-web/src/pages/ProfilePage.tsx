import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useProfileStore } from '../stores/profile';
import { supabase } from '../lib/supabase';
import EditProfileModal from '../components/EditProfileModal';
import LanguageModal from '../components/LanguageModal';
import { useT } from '../i18n/useT';
import { useToastStore } from '../stores/toast';

import { clearAuthData } from '../App';
import { useLanguageStore } from '../stores/language';
import { useNavigationStore } from '../stores/navigation';
import { useReviewsStore } from '../stores/reviews';

// ─── Lazy modals — loaded in background after ProfilePage opens ───
const AboutCafeModal = lazy(() => import('../components/AboutCafeModal'));
const AboutAppModal = lazy(() => import('../components/AboutAppModal'));
const AboutDeveloperModal = lazy(() => import('../components/AboutDeveloperModal'));
const FAQModal = lazy(() => import('../components/FAQModal'));
const VacanciesModal = lazy(() => import('../components/VacanciesModal'));
const ConfirmLogoutModal = lazy(() => import('../components/ConfirmLogoutModal'));

export default function ProfilePage() {
  // Narrow selectors — whole-store subscriptions re-render the page on any
  // profile change (stamps, visits, roulette…), not just the fields shown.
  const name = useProfileStore((s) => s.name);
  const phone = useProfileStore((s) => s.phone);
  const photo = useProfileStore((s) => s.photo);
  const loyaltyNumber = useProfileStore((s) => s.loyaltyNumber);
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const activeTab = useNavigationStore((s) => s.activeTab);
  const lastProfileRefresh = useRef(0);

  // ─── Prefetch lazy modals in background — after page opens ───
  useEffect(() => {
    import('../components/AboutCafeModal');
    import('../components/AboutAppModal');
    import('../components/AboutDeveloperModal');
    import('../components/FAQModal');
    import('../components/VacanciesModal');
    import('../components/ConfirmLogoutModal');
  }, []);

  // Refresh private data when user switches to this tab (with 30s cooldown)
  useEffect(() => {
    if (activeTab !== 3) return;
    if (Date.now() - lastProfileRefresh.current < 30_000) return;
    lastProfileRefresh.current = Date.now();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useProfileStore.getState().fetchProfile(session.user.id);
        useReviewsStore.getState().fetchLikedReviews(session.user.id);
      }
    });
  }, [activeTab]);

  const getFlag = () => {
    if (language === 'en') return '🇬🇧';
    if (language === 'kg') return '🇰🇬';
    if (language === 'ko') return '🇰🇷';
    return '🇷🇺';
  };
  const [isAboutCafeOpen, setIsAboutCafeOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAboutAppOpen, setIsAboutAppOpen] = useState(false);
  const [isAboutDeveloperOpen, setIsAboutDeveloperOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isVacanciesOpen, setIsVacanciesOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // getSession is cached/synchronous — no network call unlike getUser()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setUserEmail(session.user.email);
    });
  }, []);

  const [isSharing, setIsSharing] = useState(false);

  const handleShareApp = async () => {
    if (isSharing) return;
    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: 'Green Chicken',
          text: t('profile_share_text'),
          url: window.location.origin
        });
      } catch (error) {
        console.error('Error sharing:', error);
      } finally {
        setIsSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        useToastStore.getState().showToast(t('link_copied' as any), 'success');
      } catch {
        useToastStore.getState().showToast(t('profile_share_text'), 'info', 5000);
      }
    }
  };
  const firstLetter = name.charAt(0).toUpperCase() || '?';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1B5E3D',
      overflowY: 'auto',
      overscrollBehavior: 'none',
    }}>
      {/* ─── Header ─── */}
      <div style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 14,
        position: 'relative',
      }}>
        <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
          {t('profile_title')}
        </span>
      </div>

      {/* ─── Profile Info (Horizontal Card Component) ─── */}
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            height: 'clamp(96px, 28.7rem, 130px)',
            background: 'linear-gradient(to bottom right, #6A11CB, #2575FC)',
            border: '1px solid #000',
            borderRadius: 28,
            padding: 16
          }}
        >
          {/* 3D Robot Image */}
          <img
            src="/robot_3d.png"
            alt="Robot 3D"
            decoding="async"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              height: 'clamp(128px, 38.5rem, 175px)',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />

          {/* Avatar */}
          <div className="flex-center" style={{
            position: 'relative',
            zIndex: 2,
            width: 'clamp(68px, 20.5rem, 95px)',
            height: 'clamp(68px, 20.5rem, 95px)',
            borderRadius: '50%',
            backgroundColor: '#F59E0B',
            color: '#FFFFFF',
            fontSize: 'clamp(28px, 8.7rem, 40px)',
            fontWeight: 700,
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {photo ? (
              <img src={photo} alt={name} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              firstLetter
            )}
          </div>

          {/* Name, Phone & Level */}
          <div style={{ position: 'relative', zIndex: 2, marginLeft: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <h3 style={{
              fontSize: 'clamp(18px, 4.5rem, 22px)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 2px 0',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {name || t('profile_add_name')}
            </h3>
            <span style={{
              fontSize: 'clamp(13px, 3.3rem, 15px)',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 4
            }}>
              {phone || userEmail || t('guest')}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 2,
              opacity: 0.85
            }}>
              <span className="icon-material" style={{ fontSize: 14, color: '#FFFFFF' }}>qr_code_2</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                {loyaltyNumber ? `${loyaltyNumber.substring(0, 3)} ${loyaltyNumber.substring(3)}` : '000 000'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Two Action Cards (Edit Profile & Language) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px', marginTop: 2, marginBottom: 16 }}>
        <button 
          className="btn-reset"
          onClick={() => setIsEditProfileOpen(true)}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#22C55E',
            border: '1px solid #000',
            borderRadius: 20,
            padding: '16px 16px',
            cursor: 'pointer',
            justifyContent: 'center'
          }}
        >
          <span className="icon-material" style={{ fontSize: 'clamp(18px, 5.1rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>edit</span>
          <span style={{ fontSize: 'clamp(13px, 3.3rem, 15px)', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('edit')}</span>
        </button>

        <button 
          className="btn-reset"
          onClick={() => setIsLanguageOpen(true)}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#3B82F6',
            border: '1px solid #000',
            borderRadius: 20,
            padding: '16px 16px',
            cursor: 'pointer',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: 'clamp(15px, 4.6rem, 22px)', flexShrink: 0 }}>{getFlag()}</span>
          <span style={{ fontSize: 'clamp(13px, 3.3rem, 15px)', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('language')}</span>
        </button>
      </div>
      {/* ─── Body (Bottom White Section) ─── */}
      <div style={{
        flex: 1,
        backgroundColor: '#FEF9F5',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        boxShadow: '0 -4px 16px 2px rgba(0,0,0,0.06)',
        padding: '16px 16px 100px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Settings Block ─── */}
        <div style={{ marginBottom: 32 }}>
          {/* Title & Dot */}
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
            <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8, marginTop: 0, marginBottom: 0 }}>
              {t('profile_personal_cabinet')}
            </h2>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#22C55E',
              boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)'
            }} />
          </div>



          
          <button className="btn-reset" onClick={() => setIsAboutCafeOpen(true)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid #CBD5E1' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#3B82F6', marginRight: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#0F172A' }}>{t('profile_about_cafe')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>
          
          <button className="btn-reset" onClick={() => setIsVacanciesOpen(true)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid #CBD5E1' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#0EA5E9', marginRight: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>work</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#0F172A' }}>{t('profile_vacancies')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>

          <button className="btn-reset" onClick={() => setIsFAQOpen(true)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid #CBD5E1' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#EAB308', marginRight: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>help</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#0F172A' }}>{t('profile_faq')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>

          <button className="btn-reset" onClick={() => setIsAboutAppOpen(true)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid #CBD5E1' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#8B5CF6', marginRight: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#0F172A' }}>{t('profile_about_app')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>

          <button className="btn-reset" onClick={handleShareApp} disabled={isSharing} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid #CBD5E1', opacity: isSharing ? 0.6 : 1, cursor: isSharing ? 'default' : 'pointer' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#10B981', marginRight: 12 }}>
              {isSharing ? (
                 <div style={{ width: 'clamp(14px, 3.6rem, 20px)', height: 'clamp(14px, 3.6rem, 20px)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', animation: 'rm-spin .6s linear infinite' }} />
              ) : (
                <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>share</span>
              )}
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#0F172A' }}>{isSharing ? t('loading') : t('profile_share_app')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>

          <button className="btn-reset" onClick={() => setIsAboutDeveloperOpen(true)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: '1px solid #CBD5E1' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#6366F1', marginRight: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>code</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#0F172A' }}>{t('profile_about_dev')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>          
          <button className="btn-reset" onClick={() => setIsLogoutConfirmOpen(true)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0' }}>
            <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: '#EF4444', marginRight: 12 }}>
              <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>logout</span>
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#EF4444' }}>{t('profile_logout')}</span>
            <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 24 }}>
          <div style={{ fontSize: 'clamp(12px, 3.1rem, 14px)', fontWeight: 500, color: '#94A3B8' }}>
            Green Chicken v1.0.2
          </div>
        </div>
      </div>

      {/* Eager modals — loaded with the page, always instant */}
      {isEditProfileOpen && <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />}
      {isLanguageOpen && <LanguageModal onClose={() => setIsLanguageOpen(false)} />}

      {/* Lazy modals — background-prefetched, open instantly */}
      <Suspense fallback={null}>
        {isAboutCafeOpen && <AboutCafeModal onClose={() => setIsAboutCafeOpen(false)} />}
        {isAboutAppOpen && <AboutAppModal onClose={() => setIsAboutAppOpen(false)} />}
        {isAboutDeveloperOpen && <AboutDeveloperModal onClose={() => setIsAboutDeveloperOpen(false)} />}
        {isFAQOpen && <FAQModal onClose={() => setIsFAQOpen(false)} />}
        {isVacanciesOpen && <VacanciesModal onClose={() => setIsVacanciesOpen(false)} />}
        {isLogoutConfirmOpen && (
          <ConfirmLogoutModal
            onClose={() => setIsLogoutConfirmOpen(false)}
            onConfirm={async () => {
              await useProfileStore.getState().signOut();
              clearAuthData();
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
