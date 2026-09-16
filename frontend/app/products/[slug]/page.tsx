import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Truck, RefreshCw, Star, MapPin, Award, CheckCircle } from 'lucide-react';
import { fetchApi, formatPrice } from '../../../lib/api';
import ProductDetailClient from './ProductDetailClient';

async function getProductBySlug(slug: string) {
  try {
    const res = await fetchApi(`/products/${slug}`);
    return res?.data || null;
  } catch (err) {
    console.error('Error fetching product detail:', err);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-mid)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--color-brown)' }}>Trang chủ</Link> /{' '}
          <Link href="/products" style={{ color: 'var(--color-brown)' }}>Sản phẩm</Link> /{' '}
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} style={{ color: 'var(--color-brown)' }}>
                {product.category.name}
              </Link>{' '}
              /{' '}
            </>
          )}
          <span>{product.name}</span>
        </div>

        {/* Product Main Container */}
        <div style={{
          background: '#FFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px',
          marginBottom: '40px',
        }}>
          <ProductDetailClient product={product} />
        </div>

        {/* Product Description & Details Tabs */}
        <div style={{
          background: '#FFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          padding: '36px',
        }}>
          <div style={{
            borderBottom: '2px solid var(--color-cream)',
            paddingBottom: '16px',
            marginBottom: '24px',
            display: 'flex',
            gap: '24px',
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-brown)',
              borderBottom: '3px solid var(--color-primary)',
              paddingBottom: '14px',
              marginBottom: '-19px',
            }}>
              Mô Tả Sản Phẩm & Nguồn Gốc
            </h3>
          </div>

          <div
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.8,
              color: 'var(--color-gray-dark)',
            }}
            dangerouslySetInnerHTML={{
              __html: product.description || `<p>${product.short_description || 'Sản phẩm tươi sạch từ nông trại chuẩn VietGAP.'}</p>`,
            }}
          />

          {/* Guarantee Badges Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '1px solid var(--color-gray-light)',
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={24} color="var(--color-green)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nguồn Gốc Rõ Ràng</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>Truy xuất tận vườn canh tác</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Truck size={24} color="var(--color-primary-dark)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Giao Lạnh Trong 2H</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>Bảo toàn độ tươi giòn</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <RefreshCw size={24} color="var(--color-brown)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Đổi Trả Miễn Phí</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>Nếu sản phẩm bị hư dập</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
