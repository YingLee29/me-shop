'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  ids: number[];
  count: number;
  isLoading: boolean;
  has: (productId: number) => boolean;
  toggle: (productId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [ids, setIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setIds([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetchApi('/wishlists/ids');
      if (Array.isArray(res?.data)) {
        setIds(res.data.map(Number));
      }
    } catch (err) {
      console.warn('Không tải được wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const has = (productId: number) => ids.includes(productId);

  const toggle = async (productId: number): Promise<boolean> => {
    if (!token) {
      router.push('/login?redirect=/products');
      return false;
    }

    const isSaved = ids.includes(productId);

    // Optimistic update
    setIds((prev) => (isSaved ? prev.filter((id) => id !== productId) : [...prev, productId]));

    try {
      if (isSaved) {
        await fetchApi(`/wishlists/${productId}`, { method: 'DELETE' });
      } else {
        await fetchApi('/wishlists', {
          method: 'POST',
          body: JSON.stringify({ product_id: productId }),
        });
      }
      return !isSaved;
    } catch (err) {
      // Rollback nếu API lỗi
      setIds((prev) => (isSaved ? [...prev, productId] : prev.filter((id) => id !== productId)));
      console.warn('Không cập nhật được wishlist:', err);
      return isSaved;
    }
  };

  const value = useMemo(
    () => ({ ids, count: ids.length, isLoading, has, toggle, refresh }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ids, isLoading, toggle, refresh]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
