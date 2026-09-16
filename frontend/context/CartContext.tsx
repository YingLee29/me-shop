'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();

  // Load cart from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nongsan_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Sync with backend if user is logged in
  const refreshCart = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetchApi('/cart');
      if (res?.data) {
        setItems(res.data);
        localStorage.setItem('nongsan_cart', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to sync backend cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshCart();
    }
  }, [token]);

  // Save to local storage whenever items change
  const saveLocalCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('nongsan_cart', JSON.stringify(newItems));
  };

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
      } catch (err: any) {
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
      saveLocalCart(updated);
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
      saveLocalCart([...items, itemToAdd]);
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
    saveLocalCart(updated);
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
    saveLocalCart(filtered);
  };

  const clearCart = async () => {
    if (token) {
      try {
        await fetchApi('/cart', { method: 'DELETE' });
      } catch (e) {
        console.warn('Backend cart clear failed', e);
      }
    }
    saveLocalCart([]);
  };

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
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
