'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Phone, MapPin, Sparkles, Menu, X, ShieldCheck, Heart, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchApi, formatPrice } from '../lib/api';

export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSuggesting(true);
      try {
        const res = await fetchApi(`/products/search?q=${encodeURIComponent(term)}&limit=6`);
        setSuggestions(res?.data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggesting(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const goToProduct = (slug: string) => {
    setShowSuggestions(false);
    router.push(`/products/${slug}`);
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
            <span className="topbar-secondary" style={{ alignItems: 'center', gap: '4px', opacity: 0.9 }}>
              <ShieldCheck size={14} /> 100% Hữu cơ & VietGAP
            </span>
          </div>
          <div className="topbar-contact" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
          <form onSubmit={handleSearch} className="header-search" style={{
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
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                window.setTimeout(() => setShowSuggestions(false), 150);
              }}
            />

            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: '#FFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                boxShadow: '0 12px 32px rgba(60, 40, 20, 0.16)', zIndex: 200,
                overflow: 'hidden', textAlign: 'left',
              }}>
                {suggesting && suggestions.length === 0 ? (
                  <div style={{ padding: '14px 16px', fontSize: '0.84rem', color: 'var(--color-gray-mid)' }}>Đang tìm kiếm...</div>
                ) : suggestions.length === 0 ? (
                  <div style={{ padding: '14px 16px', fontSize: '0.84rem', color: 'var(--color-gray-mid)' }}>Không tìm thấy sản phẩm phù hợp.</div>
                ) : (
                  <>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); goToProduct(product.slug); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 13px', borderBottom: '1px solid var(--color-gray-light)', textAlign: 'left', background: '#FFF' }}
                      >
                        <img
                          src={product.primary_image?.url || 'https://placehold.co/48x48/FAF7F0/6B4226?text=NS'}
                          alt={product.name}
                          style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }}
                        />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-brown-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-red)', fontWeight: 700 }}>{formatPrice(product.current_price)}</span>
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`); }}
                      style={{ width: '100%', padding: '11px 14px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-dark)', background: 'var(--color-cream)', textAlign: 'center' }}
                    >
                      Xem tất cả kết quả cho “{searchQuery.trim()}”
                    </button>
                  </>
                )}
              </div>
            )}
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
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* User Profile */}
            <div className="header-account" style={{ position: 'relative' }}>
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
                      <Link
                        href="/account/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'block', padding: '9px 16px', fontSize: '0.85rem', color: 'var(--color-dark)' }}
                      >
                        Sản phẩm yêu thích
                      </Link>
                      <Link
                        href="/account/points"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'block', padding: '9px 16px', fontSize: '0.85rem', color: 'var(--color-dark)' }}
                      >
                        Điểm thưởng ({user.loyalty_points ?? 0})
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

            {/* Wishlist Button */}
            <Link
              href="/account/wishlist"
              title="Sản phẩm yêu thích"
              className="header-wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#FFF',
                border: '1px solid var(--color-border)',
                color: 'var(--color-brown)',
                position: 'relative',
              }}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  background: 'var(--color-red)', color: '#FFF',
                  fontSize: '0.65rem', fontWeight: 800,
                  minWidth: 17, height: 17, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="header-cart"
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
              <span className="header-cart-label">Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Navigation Menu ── */}
      <nav className="main-nav" style={{
        background: '#FFF',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px' }}>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Mở menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            style={{ alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 8, background: 'var(--color-cream)', color: 'var(--color-brown)' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px', height: '100%' }}>
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
            <Link href="/blog" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>
              Tin Tức
            </Link>
          </div>

          <div className="nav-promo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sale" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
              ⚡ Flash Sale
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-red)' }}>
              Giảm đến 40% hôm nay!
            </span>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-drawer">
            {[
              { href: '/', label: 'Trang chủ' },
              { href: '/products', label: 'Tất cả sản phẩm' },
              { href: '/products?is_featured=1', label: 'Sản phẩm nổi bật' },
              { href: '/products?category=rau-cu', label: 'Rau củ tươi' },
              { href: '/products?category=trai-cay', label: 'Trái cây sạch' },
              { href: '/products?category=gao-ngu-coc', label: 'Gạo & ngũ cốc' },
              { href: '/account/wishlist', label: '♡ Sản phẩm yêu thích' },
              { href: '/account/points', label: '🎁 Điểm thưởng' },
              { href: '/orders', label: 'Đơn hàng của tôi' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'block', padding: '12px 20px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-brown-dark)', borderBottom: '1px solid var(--color-gray-light)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
