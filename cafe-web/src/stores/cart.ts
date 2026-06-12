import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // The base product id
  cartItemId: string; // The unique cart identifier: id + '-' + variantName
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variantName?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'> & { variantName?: string }) => void;
  removeItem: (cartItemId: string) => void;
  incrementQuantity: (cartItemId: string) => void;
  decrementQuantity: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const cartItemId = item.variantName ? `${item.id}-${item.variantName}` : item.id;
        const existing = get().items.find((i) => i.cartItemId === cartItemId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, cartItemId, quantity: 1 }] });
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      },

      incrementQuantity: (cartItemId) => {
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      },

      decrementQuantity: (cartItemId) => {
        const item = get().items.find((i) => i.cartItemId === cartItemId);
        if (item && item.quantity <= 1) {
          set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: 'cafe-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
