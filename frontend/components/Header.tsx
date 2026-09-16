'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Phone, MapPin, Sparkles, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FFF' }}>
      {/* ── Top Bar ── */}
      <div style={{
        background: 'linear-gradient(90deg, #A0783A 0%, #C8A45A 50%, #A0783A 100%)',
        color: '#FFF',
        fontSize: '0.8rem',
        padding: '7px 0',
        fontWeight: 500,
        letterSpacing: '0.3px',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> <strong>Ưu đãi tháng 9:</strong> Freeship cho đơn hàng từ 300.000đ!
            </span>
            <span style={{ display: 'none', md: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
              <ShieldCheck size={14} /> 100% Hữu cơ & VietGAP
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} /> Hotline: <strong>1900 6868</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} /> Giao hàng toàn quốc
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 0',
        background: '#FAF7F0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #C8A45A 0%, #6B4226 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '1.4rem',
              boxShadow: '0 4px 10px rgba(107, 66, 38, 0.25)',
            }}>
              🌾
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-brown)', letterSpacing: '-0.5px' }}>
                NÔNG SẢN <span style={{ color: 'var(--color-primary-dark)' }}>VIỆT</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-gray-dark)', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Tươi Sạch Tận Vườn
              </div>
            </div>
          </Link>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{
            flex: 1,
            maxWidth: '560px',
            position: 'relative',
            display: 'flex',
          }}>
            <input
              type="text"
              placeholder="Tìm kiếm rau củ hữu cơ, trái cây sạch, gạo lứt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 110px 12px 18px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-border)',
                background: '#FFF',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                bottom: '4px',
                padding: '0 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
              }}
            >
              <Search size={16} /> Tìm kiếm
            </button>
          </form>

          {/* Actions: Auth & Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: '#FFF',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-brown)',
                    }}
                  >
                    <User size={16} color="var(--color-primary)" />
                    <span>{user.name.split(' ')[0]}</span>
                  </button>

                  {userDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      background: '#FFF',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--color-border)',
                      width: '190px',
                      padding: '8px 0',
                      zIndex: 200,
                    }}>
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-gray-light)', fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>
                        Xin chào, <strong>{user.name}</strong>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'block', padding: '9px 16px', fontSize: '0.85rem', color: 'var(--color-dark)' }}
                      >
                        Đơn hàng của tôi
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '9px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--color-red)',
                        }}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: '#FFF',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--color-brown)',
                    transition: 'all 0.2s',
                  }}
                >
                  <User size={16} color="var(--color-primary-dark)" />
                  <span>Tài khoản</span>
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-brown) 0%, var(--color-brown-dark) 100%)',
                color: '#FFF',
                fontWeight: 600,
                fontSize: '0.85rem',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(107, 66, 38, 0.25)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -8,
                    right: -10,
                    background: 'var(--color-primary)',
                    color: '#FFF',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--color-brown-dark)',
                  }}>
                    {itemCount}
                  </span>
                )}
              </div>
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Navigation Menu ── */}
      <nav style={{
        background: '#FFF',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', height: '100%' }}>
            <Link
              href="/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--color-brown)',
                height: '100%',
                borderBottom: '2px solid transparent',
              }}
            >
              <Menu size={18} color="var(--color-primary)" /> Tất Cả Danh Mục
            </Link>
            <Link href="/" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>
              Trang Chủ
            </Link>
            <Link href="/products?is_featured=1" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>
              Sản Phẩm Nổi Bật
            </Link>
            <Link href="/products?category=rau-cu" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>
              Rau Củ Tươi
            </Link>
            <Link href="/products?category=trai-cay" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>
              Trái Cây Sạch
            </Link>
            <Link href="/products?category=gao-ngu-coc" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>
              Gạo & Ngũ Cốc
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sale" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
              ⚡ Flash Sale
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-red)' }}>
              Giảm đến 40% hôm nay!
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
