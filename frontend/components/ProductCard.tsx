'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, Star, MapPin } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { useCart } from '../context/CartContext';

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  sale_price?: number | null;
  current_price: number;
  discount_percentage?: number | null;
  unit?: string;
  origin?: string;
  avg_rating?: number;
  review_count?: number;
  is_flash_sale?: boolean;
  primary_image?: { url: string; alt?: string } | null;
  images?: { id: number; url: string }[];
  category?: { id: number; name: string; slug: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imageUrl = product.primary_image?.url ||
    (product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/400x400/FAF7F0/6B4226?text=NongSan');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image: imageUrl,
      price: product.current_price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card" style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
    }}>
      {/* Badges */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 10,
      }}>
        {product.discount_percentage && product.discount_percentage > 0 ? (
          <span className="badge badge-sale">-{product.discount_percentage}%</span>
        ) : null}
        {product.is_flash_sale && (
          <span className="badge badge-sale" style={{ background: '#FF6B00' }}>⚡ Flash Sale</span>
        )}
      </div>

      {/* Image container */}
      <Link href={`/products/${product.slug}`} style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        paddingTop: '85%',
        background: '#FAF7F0',
        overflow: 'hidden',
      }}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Link>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Origin */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
            {product.category?.name || 'Hữu cơ'}
          </span>
          {product.origin && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-mid)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} /> {product.origin.split(',')[0]}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`} style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            color: 'var(--color-brown-dark)',
            lineHeight: 1.4,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <div style={{ display: 'flex', color: '#F5A623' }}>
            <Star size={13} fill="#F5A623" />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-dark)' }}>
            {product.avg_rating || 5.0}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-mid)' }}>
            ({product.review_count || 12})
          </span>
        </div>

        {/* Price & Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-gray-light)',
          paddingTop: 12,
          marginTop: 'auto',
        }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-red)' }}>
              {formatPrice(product.current_price)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {product.sale_price && product.price > product.sale_price && (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)}
                </span>
              )}
              {product.unit && (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-gray-dark)', background: '#F0ECE1', padding: '1px 6px', borderRadius: 4 }}>
                  /{product.unit}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: added ? 'var(--color-green)' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(200, 164, 90, 0.35)',
              transition: 'all 0.2s ease',
            }}
            title="Thêm vào giỏ hàng"
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
