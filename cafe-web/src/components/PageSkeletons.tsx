import { useT } from '../i18n/useT';
import { useLanguageStore } from '../stores/language';

// Loading screens shown while a lazy tab chunk loads (first visit).
// The stable chrome (backgrounds, headers, titles, search bars, action
// buttons) is rendered for real — copied 1:1 from the pages' markup —
// and only the data areas pulse as placeholders.

const GREEN = '#1B5E3D';

function Block({ w, h, r = 8, bg, style }: { w: number | string; h: number; r?: number; bg?: string; style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton-pulse"
      style={{ width: w, height: h, borderRadius: r, ...(bg ? { backgroundColor: bg } : {}), ...style }}
    />
  );
}

/** Menu (Доставка): real header + search, pulsing category rows */
export function MenuPageSkeleton() {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' }}>
      {/* Header — same markup as MenuPage */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', paddingBottom: 16, backgroundColor: GREEN }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, padding: '0 16px' }}>
          <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
            {t('menu_title')}
          </span>
        </div>
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, padding: '0 16px', height: 44, border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="icon-material" style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', marginRight: 8 }}>search</span>
            <span style={{ fontSize: 'clamp(14px, 3.6rem, 18px)', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
              {t('menu_search_placeholder')}
            </span>
          </div>
        </div>
      </div>
      {/* Body — same as MenuPage categories view, data pulsing */}
      <div style={{ flex: 1, backgroundColor: '#FFFFFF', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
            {t('menu_categories_title')}
          </h2>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 12px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Block key={i} w="100%" h={100} r={16} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Branches: real header + tabs + search, pulsing branch cards */
export function BranchesPageSkeleton() {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' }}>
      {/* Header — same markup as BranchesPage */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', paddingBottom: 16, backgroundColor: GREEN }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
            {t('branches_title')}
          </span>
        </div>
        <div style={{ display: 'flex', margin: '0 12px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ flex: 1, paddingBottom: 10, borderBottom: '3px solid #FFF', color: '#FFF', fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 700, textAlign: 'center' }}>
            {t('branches_tab_list')}
          </div>
          <div style={{ flex: 1, paddingBottom: 10, borderBottom: '3px solid transparent', color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(15px, 3.8rem, 21px)', fontWeight: 700, textAlign: 'center' }}>
            {t('branches_tab_map')}
          </div>
        </div>
      </div>
      {/* Body — same as BranchesPage list view, data pulsing */}
      <div style={{ flex: 1, backgroundColor: '#FEF9F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
            {t('branches_our_branches')}
          </h2>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: '0 16px', height: 48, border: '1.5px solid #94A3B8' }}>
            <span className="icon-material" style={{ fontSize: 20, color: '#94A3B8', marginRight: 8 }}>search</span>
          </div>
        </div>
        <div style={{ padding: '8px 16px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Block w="60%" h={18} r={9} />
                <Block w="85%" h={16} r={8} />
                <Block w="50%" h={13} r={6} />
                <Block w={90} h={26} r={13} style={{ marginTop: 8 }} />
              </div>
              <Block w={110} h={110} r={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Profile: real title, gradient card with robot, action buttons and white body — pulsing data */
export function ProfilePageSkeleton() {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const flag = language === 'en' ? '🇬🇧' : language === 'kg' ? '🇰🇬' : language === 'ko' ? '🇰🇷' : '🇷🇺';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: GREEN }}>
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
          {t('profile_title')}
        </span>
      </div>
      {/* Profile info card — real gradient + robot, pulsing avatar/name */}
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 'clamp(96px, 28.7rem, 130px)', background: 'linear-gradient(to bottom right, #6A11CB, #2575FC)', border: '1px solid #000', borderRadius: 28, padding: 16, overflow: 'visible' }}>
          <img src="/robot_3d.png" alt="" style={{ position: 'absolute', right: 0, bottom: 0, height: 'clamp(128px, 38.5rem, 175px)', objectFit: 'contain', pointerEvents: 'none', zIndex: 10 }} />
          <Block w="clamp(68px, 20.5rem, 95px)" h={80} r={999} bg="rgba(255,255,255,0.25)" style={{ flexShrink: 0, aspectRatio: '1 / 1', height: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 14 }}>
            <Block w={120} h={18} r={9} bg="rgba(255,255,255,0.3)" />
            <Block w={90} h={14} r={7} bg="rgba(255,255,255,0.2)" />
          </div>
        </div>
      </div>
      {/* Two action cards — same markup as ProfilePage (Edit & Language) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px', marginTop: 2, marginBottom: 16 }}>
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, background: '#22C55E', border: '1px solid #000', borderRadius: 20, padding: '16px 16px', justifyContent: 'center' }}>
          <span className="icon-material" style={{ fontSize: 'clamp(18px, 5.1rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>edit</span>
          <span style={{ fontSize: 'clamp(13px, 3.3rem, 15px)', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('edit')}</span>
        </div>
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, background: '#3B82F6', border: '1px solid #000', borderRadius: 20, padding: '16px 16px', justifyContent: 'center' }}>
          <span style={{ fontSize: 'clamp(15px, 4.6rem, 22px)', flexShrink: 0 }}>{flag}</span>
          <span style={{ fontSize: 'clamp(13px, 3.3rem, 15px)', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('language')}</span>
        </div>
      </div>
      {/* Bottom white section — same radius/shadow as ProfilePage, pulsing rows */}
      <div style={{ flex: 1, backgroundColor: '#FEF9F5', borderTopLeftRadius: 36, borderTopRightRadius: 36, boxShadow: '0 -4px 16px 2px rgba(0,0,0,0.06)', padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8, marginTop: 0, marginBottom: 0 }}>
            {t('profile_personal_cabinet')}
          </h2>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderBottom: '1px solid #CBD5E1' }}>
            <Block w={24} h={24} r={12} />
            <Block w="55%" h={16} r={8} />
          </div>
        ))}
      </div>
    </div>
  );
}
