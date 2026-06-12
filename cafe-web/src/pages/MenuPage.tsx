import { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useMenuStore, DUK_CATEGORIES } from '../stores/menu';
import { useCartStore } from '../stores/cart';
import { useOrderStore } from '../stores/orders';
import MenuCard from '../components/MenuCard';
import CategoryCard from '../components/CategoryCard';
import PullToRefresh from '../components/PullToRefresh';
import { useT } from '../i18n/useT';
import { useHardwareBack } from '../hooks/useHardwareBack';

const CartSheet = lazy(() => import('../components/CartSheet'));
const CheckoutSheet = lazy(() => import('../components/CheckoutSheet'));
const AddressSheet = lazy(() => import('../components/AddressSheet'));

const CATEGORY_EMOJI: Record<string, string> = {
  'Кофе': '☕',
  'Чай': '🍵',
  'Лимонады': '🍋',
  'Напитки': '🥤',
  'Авторские напитки': '✨',
  'Выпечка': '🥐',
  'Десерты': '🍰',
  'Завтраки': '🍳',
  'Салаты': '🥗',
  'Супы': '🍜',
  'Горячие блюда': '🍖',
  'Паста': '🍝',
  'Пицца': '🍕',
  'Бургеры': '🍔',
  'Сэндвичи': '🥪',
  'Суши': '🍣',
  'Японские роллы': '🍱',
  'Закуски': '🥨',
  'Гарниры': '🍚',
  'Соусы': '🧈',
  'Фреши': '🧃',
  'Смузи': '🥤',
  'Молочные коктейли': '🥛',
  'Детское меню': '👶',
  'Бизнес-ланчи': '💼',
  'Вегетарианское меню': '🥬',
  'Мороженое': '🍦',
  'Блины и панкейки': '🥞',
  'Стейки': '🥩',
  'Гриль и мангал': '🔥',
  'Боулы и Поке': '🥣',
  'Морепродукты': '🦐',
  'WOK': '🥘',
  'Шаурма и Донеры': '🌯',
  'Хот-доги': '🌭',
  'Пироги': '🥧',
  'Сеты': '🍱',
  'Сезонное меню': '🌸',
  'Алкогольные коктейли': '🍸',
  'Соки и Воды': '🧊',
};

// Categories with DUK images (image overrides emoji)
const CATEGORY_IMAGE: Record<string, string> = {
  'Курица':         '/category_images/cat_chicken_1781168830514-removebg-preview.webp',
  'Напитки':        '/category_images/cat_drinks_1781174228324-removebg-preview.webp',
  'Кимбап':         '/category_images/cat_kimbap_1781168876530-removebg-preview.webp',
  'Горячие блюда':  '/category_images/cat_main_dishes_1781168963104-removebg-preview.webp',
  'Лапша':          '/category_images/cat_noodles_1781169005744-removebg-preview.webp',
  'Пицца':          '/category_images/cat_pizza_1781168865515-removebg-preview.webp',
  'Гарниры':        '/category_images/cat_side_dishes_1781174239254-removebg-preview.webp',
  'Супы':           '/category_images/cat_soups_1781168889004-removebg-preview.webp',
  'Японские роллы':           '/category_images/cat_sushi_1781168847922-removebg-preview.webp',
  'Десерты':        '/category_images/cat_desserts_1781177166251-removebg-preview.webp',
  'Соусы':          '/category_images/cat_sauces_1781176696071-removebg-preview.webp',
  'Кофе':           '/category_images/cat_coffee_1781186991524-removebg-preview.webp',
  'Чай':            '/category_images/cat_tea_1781186983122-removebg-preview.webp',
  'Лимонады':       '/category_images/cat_lemonades_white-removebg-preview.webp',
  'Молочные коктейли': '/category_images/cat_milkshakes_white-removebg-preview.webp',
  'Смузи':          '/category_images/cat_smoothies_white-removebg-preview.webp',
};

// Clean distinct colors for each DUK category
const CATEGORY_COLOR: Record<string, string> = {
  'Пицца':          '#E89040',
  'Японские роллы':           '#5090E0',
  'Курица':         '#E0B040',
  'Кимбап':         '#40C840',
  'Горячие блюда':  '#E04868',
  'Лапша':          '#B8D848',
  'Гарниры':        '#8858D0',
  'Супы':           '#30B8B0',
  'Напитки':        '#4888E8',
  'Десерты':        '#E048A0',
  'Соусы':          '#C88840',
  'Кофе':           '#A06048',
  'Чай':            '#50B050',
  'Лимонады':       '#F0D040',
  'Молочные коктейли': '#D0B8E8',
  'Смузи':          '#F06060',
};

// How many cards are revealed initially / added per scroll step.
// Data is already local — this only limits DOM size, not network.
const REVEAL_STEP = 16;

export default function MenuPage() {
  const { items, categoryFilter, setCategoryFilter, searchQuery, setSearchQuery, categoryCounts } = useMenuStore();
  const t = useT();
  const isLoading = useMenuStore(s => s.isLoading);
  const cartItems = useCartStore(s => s.items);
  const cartTotalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const activeDeliveryAddress = useOrderStore(s => s.activeDeliveryAddress);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    await useMenuStore.getState().fetchMenuItems(true);
  };

  // All filtering is client-side over the fully-cached menu — instant,
  // zero network on category navigation and search.
  const filteredItems = useMemo(() => {
    let result = items;
    if (categoryFilter) {
      result = result.filter((item) => item.category === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, categoryFilter, searchQuery]);

  // Incremental reveal keeps the DOM light; growing it is a local state
  // change — no network, no spinner, no content-height instability.
  const [visibleCount, setVisibleCount] = useState(REVEAL_STEP);
  useEffect(() => {
    setVisibleCount(REVEAL_STEP);
  }, [categoryFilter, searchQuery]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
      setVisibleCount((c) => (c < filteredItems.length ? c + REVEAL_STEP : c));
    }
  }, [filteredItems.length]);

  const handleBackToCategories = useCallback(() => {
    setCategoryFilter('');
    setSearchQuery('');
  }, []);

  useHardwareBack(handleBackToCategories, !!categoryFilter || !!searchQuery);

  // Scroll to top when entering a category (or going back to categories list)
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [categoryFilter]);

  const showCategories = !categoryFilter;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: 'linear-gradient(to bottom, #1B5E3D 50%, #FEF9F5 50%)',
    }}>
      {/* ─── Header ─── */}
      <div style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#1B5E3D',
      }}>
        {/* Title */}
        {showCategories && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
              {t('menu_title')}
            </span>
          </div>
        )}

        {/* Top Header Row */}
        {showCategories ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 0 }}>
            {/* Address Selector */}
            <button
              className="btn-reset"
              onClick={() => setIsAddressSheetOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F5A623',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="icon-material" style={{ color: '#FFF', fontSize: 18 }}>location_on</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Доставка
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 15, color: '#FFF', fontWeight: 700, maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeDeliveryAddress ? (activeDeliveryAddress.label || activeDeliveryAddress.address.split(',')[0]) : 'Укажите адрес'}
                  </span>
                  <span className="icon-material" style={{ color: '#FFF', fontSize: 16 }}>expand_more</span>
                </div>
              </div>
            </button>

            {/* Cart Icon */}
            <button className="btn-reset" onClick={() => setIsCartOpen(true)} style={{ position: 'relative', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: '50%' }}>
              <span className="icon-material" style={{ color: '#FFF', fontSize: 22 }}>shopping_cart</span>
              {cartTotalItems > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#FFF', border: '2px solid #1B5E3D'
                }}>
                  {cartTotalItems}
                </div>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, position: 'relative', padding: '0 16px' }}>
            <button
              className="btn-reset flex-center"
              onClick={handleBackToCategories}
              style={{
                position: 'absolute',
                left: 16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <span className="icon-material" style={{ fontSize: 24, color: '#FFF' }}>arrow_back</span>
            </button>
            <span style={{ fontSize: 'clamp(20px, 5.1rem, 28px)', fontWeight: 700, color: '#FFF' }}>
              {searchQuery ? t('menu_search_results') : categoryFilter}
            </span>
          </div>
        )}


      </div>

      {/* ─── Body ─── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <PullToRefresh ref={scrollContainerRef} onRefresh={handleRefresh} onScroll={handleScroll}>
          <div style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Title for categories (moved above Search Bar) */}
            {showCategories && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '20px 16px 16px 16px' }}>
                <h2 style={{ fontSize: 'clamp(18px, 4.8rem, 24px)', fontWeight: 800, color: '#1E293B', margin: 0, marginRight: 8 }}>
                  {t('menu_categories_title')}
                </h2>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.7)'
                }} />
              </div>
            )}

            {/* Search Bar MOVED HERE */}
            {!showCategories && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 16px 16px' }}>
                <div style={{
                  flex: 1, minWidth: 0, display: 'flex', alignItems: 'center',
                  backgroundColor: '#FFFFFF', borderRadius: 24, padding: '0 16px', height: 48,
                  border: '1.5px solid #94A3B8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}>
                  <span className="icon-material" style={{ fontSize: 'clamp(22px, 5.6rem, 32px)', color: '#000000', marginRight: 10 }}>search</span>
                  <input
                    className="black-placeholder"
                    type="text"
                    placeholder={t('menu_search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1, minWidth: 0, border: 'none', outline: 'none',
                      backgroundColor: 'transparent', fontSize: 'clamp(16px, 4rem, 22px)',
                      fontWeight: 500, color: '#000000'
                    }}
                  />
                  {searchQuery && (
                    <button className="btn-reset flex-center" onClick={() => setSearchQuery('')} style={{ width: 40, height: 40 }}>
                      <span className="icon-material" style={{ fontSize: 24, color: '#94A3B8' }}>close</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Categories View */}
            {showCategories ? (
              <div style={{ paddingBottom: 100 }}>
                {/* Category List — 1 per row */}
                {isLoading && items.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: '0 12px',
                  }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton-pulse" style={{
                        borderRadius: 16,
                        height: 100,
                      }} />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: '0 12px',
                  }}>
                    {DUK_CATEGORIES.map((cat) => (
                      <CategoryCard
                        key={cat}
                        name={cat}
                        count={categoryCounts[cat] || 0}
                        emoji={CATEGORY_EMOJI[cat] || '📋'}
                        imageUrl={CATEGORY_IMAGE[cat]}
                        imageSize={cat === 'Гарниры' ? 150 : undefined}
                        color={CATEGORY_COLOR[cat] || '#EFF8FF'}
                        onClick={() => setCategoryFilter(cat)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ paddingBottom: 100 }}>
                {isLoading && filteredItems.length === 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    padding: '0 12px',
                  }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                      }}>
                        <div className="skeleton-pulse" style={{ width: '100%', aspectRatio: '1 / 1' }} />
                        <div style={{ padding: '10px 10px 12px 10px' }}>
                          <div className="skeleton-pulse" style={{ width: '80%', height: 14, borderRadius: 7, marginBottom: 8 }} />
                          <div className="skeleton-pulse" style={{ width: '100%', height: 11, borderRadius: 6, marginBottom: 4 }} />
                          <div className="skeleton-pulse" style={{ width: '60%', height: 11, borderRadius: 6, marginBottom: 12 }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className="skeleton-pulse" style={{ width: 50, height: 20, borderRadius: 10 }} />
                            <div className="skeleton-pulse" style={{ width: 36, height: 20, borderRadius: 10 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length > 0 ? (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      padding: '0 12px',
                      paddingTop: 4,
                    }}>
                      {visibleItems.map((item) => (
                        <MenuCard key={item.id} item={item} />
                      ))}
                    </div>
                    {/* ── Footer — data is fully local, so there is no loading
                        spinner anymore; just the end-of-list marker ── */}
                    <div style={{ minHeight: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0 24px 0' }}>
                      {!hasMore && visibleItems.length >= 8 && (
                        <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                          {t('menu_all_loaded')}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94A3B8' }}>
                    <span className="icon-material" style={{ fontSize: 'clamp(48px, 12.3rem, 68px)', marginBottom: 12 }}>
                      search_off
                    </span>
                    <p style={{ fontSize: 'clamp(16px, 4rem, 22px)', fontWeight: 500 }}>{t('menu_not_found')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>

      {/* ─── Cart FAB ─── */}
      {cartTotalItems > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}>
          <button
            className="btn-reset"
            onClick={() => setIsCartOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 20px',
              backgroundColor: '#1B5E3D',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(27, 94, 61, 0.35)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <span className="icon-material" style={{ fontSize: 22, color: '#FFF' }}>shopping_cart</span>
              <div style={{
                position: 'absolute',
                top: -8,
                right: -10,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FFF' }}>{cartTotalItems}</span>
              </div>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>
              {cartTotalPrice} {t('som')}
            </span>
          </button>
        </div>
      )}

      {/* ─── Address Sheet ─── */}
      <Suspense fallback={null}>
        <AddressSheet
          isOpen={isAddressSheetOpen}
          onClose={() => setIsAddressSheetOpen(false)}
        />
      </Suspense>

      {/* ─── Cart Sheet ─── */}
      <Suspense fallback={null}>
        <CartSheet
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => setIsCheckoutOpen(true)}
        />
      </Suspense>

      {/* ─── Checkout Sheet ─── */}
      <Suspense fallback={null}>
        <CheckoutSheet
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={() => setIsCheckoutOpen(false)}
        />
      </Suspense>
    </div>
  );
}
