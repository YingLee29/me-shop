'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchApi } from '../lib/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id?: number;
  product_id: number;
  name: string;
  slug: string;
  image?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  variant_id?: number | null;
  variant?: string | null;
}

export interface AppliedCoupon {
  code: string;
  name?: string | null;
  type: 'percent' | 'fixed' | 'freeship';
  value: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  shipping_discount: number;
  total: number;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  coupon: AppliedCoupon | null;
  addToCart: (item: {
    product_id: number;
    name: string;
    slug: string;
    image?: string | null;
    price: number;
    quantity?: number;
    variant_id?: number | null;
    variant?: string | null;
  }) => Promise<void>;
  updateQuantity: (productId: number, quantity: number, variantId?: number | null) => Promise<void>;
  removeFromCart: (productId: number, variantId?: number | null) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<AppliedCoupon>;
  removeCoupon: () => void;
  refreshCoupon: () => Promise<void>;
}

const CART_KEY = 'nongsan_cart';
const COUPON_KEY = 'nongsan_coupon';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  // Token đã đồng bộ xong (tránh gọi API lặp lại)
  const syncedTokenRef = useRef<string | null>(null);

  // Load giỏ + coupon từ localStorage khi mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedCoupon = localStorage.getItem(COUPON_KEY);
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch {
      // ignore JSON lỗi
    }
  }, []);

  const persist = (nextItems: CartItem[], nextCoupon: AppliedCoupon | null = coupon) => {
    setItems(nextItems);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));

    if (nextCoupon) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(nextCoupon));
    } else {
      localStorage.removeItem(COUPON_KEY);
    }
  };

  const refreshCart = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetchApi('/cart');
      if (res?.data) {
        persist(res.data);
        // Coupon cũ có thể không còn hợp lệ với giỏ mới
        if (coupon) await refreshCouponWith(res.data);
      }
    } catch (e) {
      console.error('Failed to sync backend cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Đồng bộ giỏ guest (localStorage) lên server khi đăng nhập / đổi tài khoản
  useEffect(() => {
    if (!token) {
      // Đăng xuất → không giữ dữ liệu giỏ của user trước
      if (syncedTokenRef.current) {
        setItems([]);
        setCoupon(null);
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(COUPON_KEY);
      }
      syncedTokenRef.current = null;
      return;
    }

    if (syncedTokenRef.current === token) return;
    syncedTokenRef.current = token;

    (async () => {
      let guestItems: CartItem[] = [];
      try {
        const raw = localStorage.getItem(CART_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) guestItems = parsed.filter((i: CartItem) => !i.id);
      } catch {
        guestItems = [];
      }

      if (guestItems.length > 0) {
        try {
          setIsLoading(true);
          const res = await fetchApi('/cart/sync', {
            method: 'POST',
            body: JSON.stringify({
              items: guestItems.map((i) => ({
                product_id: i.product_id,
                variant_id: i.variant_id || null,
                quantity: i.quantity,
              })),
            }),
          });
          if (res?.data) {
            persist(res.data);
            if (coupon) await refreshCouponWith(res.data);
            return;
          }
        } catch (e) {
          console.warn('Cart sync failed, fallback to server cart', e);
        } finally {
          setIsLoading(false);
        }
      }

      await refreshCart();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addToCart = async (newItem: {
    product_id: number;
    name: string;
    slug: string;
    image?: string | null;
    price: number;
    quantity?: number;
    variant_id?: number | null;
    variant?: string | null;
  }) => {
    const qty = newItem.quantity || 1;

    // If logged in, call backend API
    if (token) {
      try {
        await fetchApi('/cart', {
          method: 'POST',
          body: JSON.stringify({
            product_id: newItem.product_id,
            variant_id: newItem.variant_id || null,
            quantity: qty,
          }),
        });
        await refreshCart();
        return;
      } catch (err) {
        console.warn('Backend cart add failed, falling back to local', err);
      }
    }

    // Local cart fallback
    const existingIndex = items.findIndex(
      (i) => i.product_id === newItem.product_id && (i.variant_id || null) === (newItem.variant_id || null)
    );

    if (existingIndex > -1) {
      const updated = [...items];
      const current = updated[existingIndex];
      const newQty = current.quantity + qty;
      updated[existingIndex] = {
        ...current,
        quantity: newQty,
        subtotal: current.price * newQty,
      };
      persist(updated);
    } else {
      const itemToAdd: CartItem = {
        product_id: newItem.product_id,
        name: newItem.name,
        slug: newItem.slug,
        image: newItem.image,
        price: newItem.price,
        quantity: qty,
        subtotal: newItem.price * qty,
        variant_id: newItem.variant_id || null,
        variant: newItem.variant || null,
      };
      persist([...items, itemToAdd]);
    }
  };

  const updateQuantity = async (productId: number, quantity: number, variantId?: number | null) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variantId);
      return;
    }

    if (token) {
      const found = items.find((i) => i.product_id === productId && (i.variant_id || null) === (variantId || null));
      if (found?.id) {
        try {
          await fetchApi(`/cart/${found.id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
          });
          await refreshCart();
          return;
        } catch (e) {
          console.warn('Backend cart update failed', e);
        }
      }
    }

    const updated = items.map((i) => {
      if (i.product_id === productId && (i.variant_id || null) === (variantId || null)) {
        return {
          ...i,
          quantity,
          subtotal: i.price * quantity,
        };
      }
      return i;
    });
    persist(updated);
  };

  const removeFromCart = async (productId: number, variantId?: number | null) => {
    if (token) {
      const found = items.find((i) => i.product_id === productId && (i.variant_id || null) === (variantId || null));
      if (found?.id) {
        try {
          await fetchApi(`/cart/${found.id}`, { method: 'DELETE' });
          await refreshCart();
          return;
        } catch (e) {
          console.warn('Backend cart delete failed', e);
        }
      }
    }

    const filtered = items.filter(
      (i) => !(i.product_id === productId && (i.variant_id || null) === (variantId || null))
    );
    persist(filtered);
  };

  const clearCart = async () => {
    if (token) {
      try {
        await fetchApi('/cart', { method: 'DELETE' });
      } catch (e) {
        console.warn('Backend cart clear failed', e);
      }
    }
    persist([], null);
  };

  // ── Coupon ────────────────────────────────────────────

  const requestCoupon = async (code: string, subtotal: number): Promise<AppliedCoupon> => {
    const res = await fetchApi('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });

    if (!res?.data) {
      throw new Error(res?.message || 'Mã giảm giá không hợp lệ.');
    }

    const applied: AppliedCoupon = res.data;
    setCoupon(applied);
    localStorage.setItem(COUPON_KEY, JSON.stringify(applied));
    return applied;
  };

  const applyCoupon = (code: string) => requestCoupon(code, totalAmount);

  const removeCoupon = () => {
    setCoupon(null);
    localStorage.removeItem(COUPON_KEY);
  };

  /** Revalidate coupon theo giỏ hiện tại; tự bỏ nếu không còn hợp lệ */
  const refreshCouponWith = async (cartItems: CartItem[]) => {
    if (!coupon?.code) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

    if (subtotal <= 0) {
      setCoupon(null);
      localStorage.removeItem(COUPON_KEY);
      return;
    }

    try {
      await requestCoupon(coupon.code, subtotal);
    } catch {
      setCoupon(null);
      localStorage.removeItem(COUPON_KEY);
    }
  };

  const refreshCoupon = () => refreshCouponWith(items);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isLoading,
        coupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        applyCoupon,
        removeCoupon,
        refreshCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
