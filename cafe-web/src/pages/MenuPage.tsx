import { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useMenuStore, DUK_CATEGORIES, CATEGORY_KEYS } from '../stores/menu';
import { useCartStore } from '../stores/cart';
import { useOrderStore } from '../stores/orders';
import MenuCard from '../components/MenuCard';
import CategoryCard from '../components/CategoryCard';
import { CATEGORY_EMOJI, CATEGORY_IMAGE, CATEGORY_COLOR } from '../components/categoryMeta';
import PullToRefresh from '../components/PullToRefresh';
import VariantSelectSheet from '../components/VariantSelectSheet';
import { useT } from '../i18n/useT';
import { useHardwareBack } from '../hooks/useHardwareBack';
import type { MenuItem } from '../stores/menu';

const CartSheet = lazy(() => import('../components/CartSheet'));
const CheckoutSheet = lazy(() => import('../components/CheckoutSheet'));
const AddressSheet = lazy(() => import('../components/AddressSheet'));
const MenuItemModal = lazy(() => import('../components/MenuItemModal'));

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
  const [variantSheetItem, setVariantSheetItem] = useState<MenuItem | null>(null);
  const [itemModalItem, setItemModalItem] = useState<MenuItem | null>(null);
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
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
              {searchQuery ? t('menu_search_results') : (CATEGORY_KEYS[categoryFilter] ? t(CATEGORY_KEYS[categoryFilter]) : categoryFilter)}
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

            {/* Categories View — the list is static (names, colors, images),
                so it renders immediately even while the menu is loading;
                only the per-category counts pulse until data arrives. */}
            {showCategories ? (
              <div style={{ paddingBottom: 180 }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '0 12px',
                }}>
                  {DUK_CATEGORIES.map((cat) => (
                    <CategoryCard
                      key={cat}
                      name={t(CATEGORY_KEYS[cat]) || cat}
                      count={isLoading && items.length === 0 ? null : (categoryCounts[cat] || 0)}
                      emoji={CATEGORY_EMOJI[cat] || '📋'}
                      imageUrl={CATEGORY_IMAGE[cat]}
                      imageSize={cat === 'Гарниры' ? 150 : undefined}
                      color={CATEGORY_COLOR[cat] || '#EFF8FF'}
                      onClick={() => setCategoryFilter(cat)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ paddingBottom: 180 }}>
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
                        <MenuCard key={item.id} item={item} onSelectVariants={setVariantSheetItem} onClick={setItemModalItem} />
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
          // Always keep a fixed 6px gap above the bottom nav, whatever its
          // rendered height is on this device (set by BottomNav). Fallback 100px
          // matches the nav's max height for the first paint before measurement.
          bottom: 'calc(var(--bottom-nav-height, 100px) + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: '90%',
          maxWidth: 360,
        }}>
          <button
            className="btn-reset"
            onClick={() => setIsCartOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px 10px 10px',
              width: '100%',
              height: 64,
              backgroundColor: '#16A34A',
              border: '1px solid #15803D',
              borderRadius: 16,
              boxShadow: '0 6px 24px rgba(22, 163, 74, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/assets/courier_icon.jpg" 
                  alt="Courier" 
                  style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  border: '2px solid #16A34A'
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FFF' }}>{cartTotalItems}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0' }}>{t('cart_title') || 'Корзина'}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#FFF' }}>{cartTotalPrice} {t('som')}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>Оформить</span>
              <span className="icon-material" style={{ fontSize: 20, color: '#FFF' }}>chevron_right</span>
            </div>
          </button>
        </div>
      )}

      {/* ─── Address Sheet ─── */}
      <Suspense fallback={null}>
        <AddressSheet
          isOpen={isAddressSheetOpen}
          onClose={() => setIsAddressSheetOpen(false)}
        />
        
        {/* ─── Variant Select Sheet ─── */}
        <VariantSelectSheet 
            isOpen={!!variantSheetItem} 
            onClose={() => setVariantSheetItem(null)} 
            item={variantSheetItem} 
        />

        {/* ─── Menu Item Modal ─── */}
        <MenuItemModal
            isOpen={!!itemModalItem}
            onClose={() => setItemModalItem(null)}
            item={itemModalItem}
            onSelectVariants={setVariantSheetItem}
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
