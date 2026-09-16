'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nongsan_token');
    if (savedToken) {
      setToken(savedToken);
      fetchApi('/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res?.user) setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('nongsan_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.access_token) {
      localStorage.setItem('nongsan_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    }
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string; address?: string }) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.access_token) {
      localStorage.setItem('nongsan_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    }
  };

  const logout = () => {
    if (token) {
      fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    localStorage.removeItem('nongsan_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
