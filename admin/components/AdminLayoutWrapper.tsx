'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, LogOut, User, Store, Zap, Ticket, ShieldCheck, FolderTree, Star, Newspaper, BarChart3, Warehouse, Menu, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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
    { label: 'Tổng Quan (Dashboard)', href: '/', icon: LayoutDashboard, permission: null },
    { label: 'Quản Lý Đơn Hàng', href: '/orders', icon: ShoppingBag, permission: 'orders.view' },
    { label: 'Quản Lý Sản Phẩm', href: '/products', icon: Package, permission: 'products.view' },
    { label: 'Quản Lý Danh Mục', href: '/categories', icon: FolderTree, permission: 'categories.view' },
    { label: 'Flash Sale', href: '/flash-sales', icon: Zap, permission: 'flash-sales.view' },
    { label: 'Mã Giảm Giá', href: '/coupons', icon: Ticket, permission: 'coupons.view' },
    { label: 'Quản Lý Đánh Giá', href: '/reviews', icon: Star, permission: 'reviews.view' },
    { label: 'Quản Lý Bài Viết', href: '/blogs', icon: Newspaper, permission: 'blogs.view' },
    { label: 'Quản Lý Tồn Kho', href: '/inventory', icon: Warehouse, permission: 'inventory.view' },
    { label: 'Báo Cáo Doanh Thu', href: '/reports', icon: BarChart3, permission: 'reports.view' },
    { label: 'Phân Quyền', href: '/roles', icon: ShieldCheck, permission: 'roles.manage' },
  ].filter((item) => !item.permission || can(item.permission));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {mobileNavOpen && (
        <button
          type="button"
          className="admin-overlay"
          aria-label="Đóng menu quản trị"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside className={`admin-sidebar${mobileNavOpen ? ' is-open' : ''}`} style={{
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
          <div className="admin-logo-text">
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
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* View store link */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}
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
            <Store size={16} /> <span className="admin-store-label">Xem Website Cửa Hàng</span>
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
            <div className="admin-user-info">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#9A8878' }}>{user?.roles?.[0] || 'Nhân viên'}</div>
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
      <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header className="admin-topbar" style={{
          minHeight: '64px',
          background: '#FFF',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          gap: '12px',
        }}>
          <button
            type="button"
            className="admin-menu-btn"
            aria-label={mobileNavOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="admin-topbar-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-brown)', minWidth: 0 }}>
            Hệ Thống Quản Lý Thương Mại Điện Tử Nông Sản
          </div>
          <div className="admin-topbar-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              Phiên bản <strong>Phase 3 – Wishlist, Loyalty &amp; RBAC</strong>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
