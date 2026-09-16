'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchAdminApi } from '../lib/api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles?: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nongsan_admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchAdminApi('/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('nongsan_admin_token');
          setToken(null);
          setUser(null);
          if (pathname !== '/login') router.push('/login');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [pathname]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await fetchAdminApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.access_token) {
      // Check if user has admin role
      const roles = res.user?.roles || [];
      if (!roles.includes('admin') && !roles.includes('super-admin')) {
        throw new Error('Tài khoản này không có quyền truy cập trang Quản Trị.');
      }

      localStorage.setItem('nongsan_admin_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      router.push('/');
    }
  };

  const logout = () => {
    if (token) {
      fetchAdminApi('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    localStorage.removeItem('nongsan_admin_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
}
