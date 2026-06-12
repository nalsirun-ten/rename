import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { retry } from '../lib/retry';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  variant_name?: string;
}

export type DeliveryMethod = 'pickup' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  branch_id: string | null;
  items: OrderItem[];
  total_price: number;
  delivery_method: DeliveryMethod;
  delivery_address: string | null;
  recipient_name: string | null;
  phone: string | null;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  branch_name?: string;
}

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string | null;
  address: string;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateOrderPayload {
  branch_id: string | null;
  items: OrderItem[];
  total_price: number;
  delivery_method: DeliveryMethod;
  delivery_address?: string;
  recipient_name?: string;
  phone?: string;
  notes?: string;
}

interface OrdersState {
  orders: Order[];
  savedAddresses: SavedAddress[];
  activeDeliveryAddress: SavedAddress | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isLoadingAddresses: boolean;
  error: string | null;
  createOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  fetchOrders: (userId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  fetchAddresses: () => Promise<void>;
  setActiveDeliveryAddress: (address: SavedAddress | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrdersState>()((set, get) => ({
  orders: [],
  savedAddresses: [],
  activeDeliveryAddress: null,
  isLoading: false,
  isSubmitting: false,
  isLoadingAddresses: false,
  error: null,

  setActiveDeliveryAddress: (address) => set({ activeDeliveryAddress: address }),

  clearError: () => set({ error: null }),

  createOrder: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        set({ error: 'auth', isSubmitting: false });
        return null;
      }

      const { data, error } = await retry(() =>
        supabase
          .from('orders')
          .insert({
            user_id: userId,
            branch_id: payload.branch_id,
            items: payload.items,
            total_price: payload.total_price,
            delivery_method: payload.delivery_method,
            delivery_address: payload.delivery_address || null,
            recipient_name: payload.recipient_name || null,
            phone: payload.phone || null,
            notes: payload.notes || null,
            status: 'pending',
          })
          .select()
          .single()
      );

      if (error) {
        set({ error: error.message, isSubmitting: false });
        return null;
      }

      // Notify Telegram group about the new order
      try {
        await supabase.functions.invoke('notify-order', {
          body: { order_id: data.id }
        });
      } catch (notifyErr) {
        console.error('Failed to notify order:', notifyErr);
      }

      set({ isSubmitting: false });
      return data as Order;
    } catch (err: any) {
      set({ error: err?.message || 'unknown', isSubmitting: false });
      return null;
    }
  },

  fetchOrders: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await retry(() =>
        supabase
          .from('orders')
          .select('*, branches:branch_id(name)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)
      );

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const orders = (data || []).map((row: any) => ({
        ...row,
        branch_name: row.branches?.name || null,
      }));

      set({ orders, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'unknown', isLoading: false });
    }
  },

  cancelOrder: async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        set({ error: error.message });
        return false;
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
        ),
      }));
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'unknown' });
      return false;
    }
  },

  fetchAddresses: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    set({ isLoadingAddresses: true });
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        const addresses = data as SavedAddress[];
        set({ savedAddresses: addresses });
        
        // Auto-select the default address if activeDeliveryAddress is not set
        const { activeDeliveryAddress } = get();
        if (!activeDeliveryAddress && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
          set({ activeDeliveryAddress: defaultAddr });
        }
      }
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
    } finally {
      set({ isLoadingAddresses: false });
    }
  },
}));
