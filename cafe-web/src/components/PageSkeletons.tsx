import { useT } from '../i18n/useT';
import { useLanguageStore } from '../stores/language';
import { DUK_CATEGORIES, CATEGORY_KEYS } from '../stores/menu';
import CategoryCard from './CategoryCard';
import { CATEGORY_EMOJI, CATEGORY_IMAGE, CATEGORY_COLOR } from './categoryMeta';

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

/** Menu (Доставка): real header (address + cart) and the real colored
 *  category cards — only the address line and per-category counts pulse. */
export function MenuPageSkeleton() {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)' }}>
      {/* Header — same markup as MenuPage categories view */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', paddingBottom: 16, backgroundColor: GREEN }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
            {t('menu_title')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          {/* Address selector — address line pulses */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F5A623',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="icon-material" style={{ color: '#FFF', fontSize: 18 }}>location_on</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Доставка
              </span>
              <Block w={110} h={15} r={8} bg="rgba(255,255,255,0.3)" />
            </div>
          </div>
          {/* Cart icon */}
          <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: '50%' }}>
            <span className="icon-material" style={{ color: '#FFF', fontSize: 22 }}>shopping_cart</span>
          </div>
        </div>
      </div>
      {/* Body — the real colored category cards, counts pulsing */}
      <div style={{ flex: 1, backgroundColor: '#FFFFFF', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
            {t('menu_categories_title')}
          </h2>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px' }}>
          {DUK_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              name={t(CATEGORY_KEYS[cat]) || cat}
              count={null}
              emoji={CATEGORY_EMOJI[cat] || '📋'}
              imageUrl={CATEGORY_IMAGE[cat]}
              imageSize={cat === 'Гарниры' ? 150 : undefined}
              color={CATEGORY_COLOR[cat] || '#EFF8FF'}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** One pulsing branch card — geometry copied 1:1 from BranchCard.
 *  Shared by BranchesPage (data loading) and BranchesPageSkeleton (chunk
 *  loading) so the placeholder always matches the real card. */
export function BranchCardSkeleton() {
  return (
    <div style={{
      padding: '20px 0',
      margin: '0 12px',
      borderBottom: '1px solid #CBD5E1',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top row: text left + image right */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
          <Block w="70%" h={22} r={11} style={{ marginBottom: 6 }} />
          <Block w="85%" h={18} r={9} style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
            <Block w={16} h={16} r={8} />
            <Block w="45%" h={14} r={7} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Block w={16} h={16} r={8} />
            <Block w="35%" h={14} r={7} />
          </div>
        </div>
        {/* Image placeholder */}
        <div className="skeleton-pulse" style={{
          flexShrink: 0,
          width: 'clamp(102px, 26rem, 146px)',
          height: 'clamp(102px, 26rem, 146px)',
          borderRadius: 12,
        }} />
      </div>
      {/* Bottom row: status badge left + save button right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div className="skeleton-pulse" style={{
          width: 'clamp(100px, 25rem, 140px)',
          height: 'clamp(40px, 10.2rem, 60px)',
          borderRadius: 22,
        }} />
        <div className="skeleton-pulse" style={{
          width: 'clamp(40px, 10.2rem, 60px)',
          height: 'clamp(40px, 10.2rem, 60px)',
          borderRadius: 14,
        }} />
      </div>
    </div>
  );
}

/** Branches: real header + tabs + search + filter button, pulsing branch cards */
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
      <div style={{ flex: 1, backgroundColor: '#FEF9F5', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
          <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
            {t('branches_our_branches')}
          </h2>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
        </div>
        {/* Search bar + filter button — same as BranchesPage */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: '0 16px', height: 48, border: '1.5px solid #94A3B8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginRight: 12 }}>
            <span className="icon-material" style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', color: '#000000', marginRight: 10 }}>search</span>
            <span style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: '#64748B' }}>
              {t('branches_search_placeholder')}
            </span>
          </div>
          <div className="flex-center" style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#1E293B', flexShrink: 0, boxShadow: '0 4px 12px rgba(30,41,59,0.2)' }}>
            <span className="icon-material" style={{ fontSize: 'clamp(24px, 6.1rem, 34px)', color: '#FFF' }}>tune</span>
          </div>
        </div>
        <div style={{ paddingBottom: 100 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <BranchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Static settings rows — copied 1:1 from ProfilePage so the skeleton's
// "личный кабинет" list looks exactly like the real one.
const PROFILE_ROWS = [
  { icon: 'local_cafe', color: '#3B82F6', labelKey: 'profile_about_cafe' },
  { icon: 'work',       color: '#0EA5E9', labelKey: 'profile_vacancies' },
  { icon: 'help',       color: '#EAB308', labelKey: 'profile_faq' },
  { icon: 'menu_book',  color: '#8B5CF6', labelKey: 'profile_about_app' },
  { icon: 'share',      color: '#10B981', labelKey: 'profile_share_app' },
  { icon: 'code',       color: '#6366F1', labelKey: 'profile_about_dev' },
  { icon: 'logout',     color: '#EF4444', labelKey: 'profile_logout' },
] as const;

/** Profile: real title, gradient card with robot, action buttons and the
 *  real settings list — only the user data (avatar, name, phone, loyalty
 *  number) pulses. */
export function ProfilePageSkeleton() {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const flag = language === 'en' ? '🇬🇧' : language === 'kg' ? '🇰🇬' : language === 'ko' ? '🇰🇷' : '🇷🇺';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: GREEN, overflowY: 'auto', overscrollBehavior: 'none' }}>
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
          {t('profile_title')}
        </span>
      </div>
      {/* Profile info card — real gradient + robot, pulsing avatar/name/loyalty */}
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 'clamp(96px, 28.7rem, 130px)', background: 'linear-gradient(to bottom right, #6A11CB, #2575FC)', border: '1px solid #000', borderRadius: 28, padding: 16, overflow: 'visible' }}>
          <img src="/robot_3d.png" alt="" decoding="async" style={{ position: 'absolute', right: 0, bottom: 0, height: 'clamp(128px, 38.5rem, 175px)', objectFit: 'contain', pointerEvents: 'none', zIndex: 10 }} />
          <Block w="clamp(68px, 20.5rem, 95px)" h={80} r={999} bg="rgba(255,255,255,0.25)" style={{ flexShrink: 0, aspectRatio: '1 / 1', height: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 16 }}>
            <Block w={120} h={18} r={9} bg="rgba(255,255,255,0.3)" />
            <Block w={90} h={14} r={7} bg="rgba(255,255,255,0.2)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, opacity: 0.85 }}>
              <span className="icon-material" style={{ fontSize: 14, color: '#FFFFFF' }}>qr_code_2</span>
              <Block w={56} h={12} r={6} bg="rgba(255,255,255,0.25)" />
            </div>
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
      {/* Bottom white section — the real static settings list */}
      <div style={{ flex: 1, backgroundColor: '#FEF9F5', borderTopLeftRadius: 36, borderTopRightRadius: 36, boxShadow: '0 -4px 16px 2px rgba(0,0,0,0.06)', padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
            <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', marginRight: 8, marginTop: 0, marginBottom: 0 }}>
              {t('profile_personal_cabinet')}
            </h2>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)' }} />
          </div>
          {PROFILE_ROWS.map(({ icon, color, labelKey }, i) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 0', borderBottom: i === PROFILE_ROWS.length - 1 ? 'none' : '1px solid #CBD5E1' }}>
              <div className="flex-center" style={{ width: 'clamp(28px, 8.2rem, 38px)', height: 'clamp(28px, 8.2rem, 38px)', borderRadius: 'clamp(6px, 2rem, 10px)', backgroundColor: color, marginRight: 12 }}>
                <span className="icon-material" style={{ fontSize: 'clamp(18px, 4.6rem, 24px)', color: '#FFFFFF', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500, color: icon === 'logout' ? '#EF4444' : '#0F172A' }}>{t(labelKey)}</span>
              <span className="icon-material" style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', color: '#CBD5E1' }}>chevron_right</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 24 }}>
          <div style={{ fontSize: 'clamp(12px, 3.1rem, 14px)', fontWeight: 500, color: '#94A3B8' }}>
            Green Chicken v1.0.2
          </div>
        </div>
      </div>
    </div>
  );
}
