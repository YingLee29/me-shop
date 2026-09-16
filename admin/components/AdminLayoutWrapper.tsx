'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, LogOut, User, Store, Layers } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAdminAuth();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌾</div>
          <div style={{ fontWeight: 600, color: 'var(--admin-brown)' }}>Đang tải bảng điều khiển...</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Tổng Quan (Dashboard)', href: '/', icon: LayoutDashboard },
    { label: 'Quản Lý Đơn Hàng', href: '/orders', icon: ShoppingBag },
    { label: 'Quản Lý Sản Phẩm', href: '/products', icon: Package },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left Sidebar ── */}
      <aside style={{
        width: '260px',
        background: 'var(--admin-sidebar-bg)',
        color: 'var(--admin-sidebar-text)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'var(--admin-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
          }}>
            🌾
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFF' }}>NÔNG SẢN ADMIN</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--admin-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bảng Điều Khiển</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFF' : 'var(--admin-sidebar-text)',
                  background: isActive ? 'rgba(200, 164, 90, 0.25)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--admin-primary)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--admin-primary)' : '#9A8878'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* View store link */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: 'var(--admin-sidebar-text)',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <Store size={16} /> Xem Website Cửa Hàng
          </a>
        </div>

        {/* User profile & Logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(200, 164, 90, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="var(--admin-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#9A8878' }}>Super Admin</div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{ color: '#E57373', padding: '6px' }}
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '64px',
          background: '#FFF',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-brown)' }}>
            Hệ Thống Quản Lý Thương Mại Điện Tử Nông Sản
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Phiên bản <strong>Phase 1 MVP</strong>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
