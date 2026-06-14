import React, { useMemo } from 'react';
import { useMenuStore } from '../stores/menu';
import { useCartStore } from '../stores/cart';
import { useT } from '../i18n/useT';
import { thumbnailUrl } from '../utils/imageUrl';
import type { MenuItem } from '../stores/menu';

// ─── Category groups for context-aware suggestions ───
const DRINKS = new Set<string>([
  'Напитки', 'Кофе', 'Чай', 'Лимонады', 'Молочные коктейли', 'Смузи', 'Соки и Воды', 'Фреши',
]);
const DESSERTS = new Set<string>(['Десерты', 'Мороженое', 'Выпечка', 'Блины и панкейки']);
const SAUCES = new Set<string>(['Соусы']);
// Anything that isn't a drink/dessert/sauce counts as "food" (a main item).

const MAX_SUGGESTIONS = 12;

// Round-robin across groups so the strip shows a mix (a dessert, a drink, a sauce…)
function interleave(groups: MenuItem[][], max: number): MenuItem[] {
  const out: MenuItem[] = [];
  for (let i = 0; out.length < max; i++) {
    let added = false;
    for (const g of groups) {
      if (g[i]) {
        out.push(g[i]);
        added = true;
        if (out.length >= max) break;
      }
    }
    if (!added) break;
  }
  return out;
}

// Smart cart add-ons:
//  • no dessert in the order → suggest a dessert
//  • food but nothing to drink → suggest a drink AND a sauce
// Lives at the bottom of the cart list and scrolls with it.
const CartUpsell = React.memo(function CartUpsell() {
  const t = useT();
  const menuItems = useMenuStore((s) => s.items);
  const cartItems = useCartStore((s) => s.items);

  const { suggestions, subKey } = useMemo(() => {
    const byId = new Map(menuItems.map((m) => [m.id, m]));

    let hasFood = false, hasDrink = false, hasDessert = false;
    for (const ci of cartItems) {
      const cat = byId.get(ci.id)?.category;
      if (!cat) { hasFood = true; continue; } // unknown → assume a main dish
      if (DRINKS.has(cat)) hasDrink = true;
      else if (DESSERTS.has(cat)) hasDessert = true;
      else if (SAUCES.has(cat)) { /* sauce present */ }
      else hasFood = true;
    }

    const inCart = new Set(cartItems.map((i) => i.id));
    const pick = (cats: Set<string>, n: number) =>
      menuItems
        .filter((m) => cats.has(m.category) && !inCart.has(m.id) && !(m.variants && m.variants.length > 0))
        .slice(0, n);

    const dessertItems = !hasDessert ? pick(DESSERTS, 6) : [];
    const drinkSauceWanted = hasFood && !hasDrink;
    const drinkItems = drinkSauceWanted ? pick(DRINKS, 6) : [];
    const sauceItems = drinkSauceWanted ? pick(SAUCES, 4) : [];

    const groups = [dessertItems, drinkItems, sauceItems].filter((g) => g.length > 0);
    const list = interleave(groups, MAX_SUGGESTIONS);

    const showDessert = dessertItems.length > 0;
    const showDrinkSauce = drinkItems.length > 0 || sauceItems.length > 0;
    let key = 'cart_upsell_subtitle';
    if (showDessert && !showDrinkSauce) key = 'cart_upsell_dessert';
    else if (!showDessert && showDrinkSauce) key = 'cart_upsell_drink_sauce';

    return { suggestions: list, subKey: key as any };
  }, [menuItems, cartItems]);

  if (suggestions.length === 0) return null;

  const add = (item: MenuItem) => {
    useCartStore.getState().addItem({
      id: item.id, title: item.title, price: item.price, imageUrl: item.imageUrl,
    });
  };

  return (
    <div style={{ marginTop: 12, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{t('cart_upsell_title')}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', marginLeft: 6 }}>{t(subKey)}</span>
      </div>

      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {suggestions.map((item) => (
          <div
            key={item.id}
            style={{
              width: 116,
              flexShrink: 0,
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Square image / green name-tile fallback */}
            <div style={{
              width: '100%',
              aspectRatio: '1 / 1',
              backgroundColor: item.imageUrl ? '#F1F5F9' : '#1B5E3D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {item.imageUrl ? (
                <img
                  src={thumbnailUrl(item.imageUrl, 200)}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#FFFFFF', textAlign: 'center',
                  lineHeight: 1.2, padding: 6, overflow: 'hidden',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                }}>
                  {item.title}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '8px 8px 8px 10px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: '#1E293B', lineHeight: 1.25,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {item.title}
              </span>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                  {item.price} {t('som')}
                </span>
                <button
                  className="btn-reset flex-center"
                  onClick={() => add(item)}
                  aria-label={item.title}
                  style={{
                    width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                    backgroundColor: '#1B5E3D', color: '#FFFFFF',
                  }}
                >
                  <span className="icon-material" style={{ fontSize: 18 }}>add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default CartUpsell;
