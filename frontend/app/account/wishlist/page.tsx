'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import ProductCard, { Product } from '../../../components/ProductCard';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useWishlist } from '../../../context/WishlistContext';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    fetchApi('/wishlists')
      .then((res) => setProducts(res?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  // Sản phẩm vừa bỏ yêu thích sẽ biến mất ngay (optimistic)
  const visibleProducts = products.filter((p) => ids.includes(p.id));

  if (!authLoading && !user) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Heart size={54} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>Danh Sách Yêu Thích</h1>
        <p style={{ color: 'var(--color-gray-mid)', marginTop: '8px', marginBottom: '24px' }}>
          Vui lòng đăng nhập để lưu và xem sản phẩm yêu thích.
        </p>
        <Link href="/login?redirect=/account/wishlist" className="btn-primary">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brown-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={26} fill="#E53935" color="#E53935" /> Sản Phẩm Yêu Thích
            </h1>
            <p style={{ color: 'var(--color-gray-mid)', marginTop: '4px' }}>
              {visibleProducts.length} sản phẩm đã lưu
            </p>
          </div>
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brown)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-mid)' }}>Đang tải...</div>
        ) : visibleProducts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#FFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💚</div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-brown-dark)' }}>Chưa có sản phẩm yêu thích</h2>
            <p style={{ color: 'var(--color-gray-mid)', marginTop: '6px', marginBottom: '20px' }}>
              Nhấn vào biểu tượng ♡ trên sản phẩm để lưu lại nhé!
            </p>
            <Link href="/products" className="btn-primary">Khám phá nông sản</Link>
          </div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
