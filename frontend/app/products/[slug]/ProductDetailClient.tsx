'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Star, MapPin, Check, Plus, Minus, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';

export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [added, setAdded] = useState(false);

  // Gallery
  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 0, url: product.primary_image?.url || 'https://placehold.co/600x600/FAF7F0/6B4226?text=NongSan' }];

  const [activeImage, setActiveImage] = useState(images[0]?.url || product.primary_image?.url);

  // Calculate adjusted price based on variant
  const currentPrice = selectedVariant
    ? product.current_price + (selectedVariant.price_adjust || 0)
    : product.current_price;

  const originalPrice = selectedVariant
    ? product.price + (selectedVariant.price_adjust || 0)
    : product.price;

  const handleAddToCart = async () => {
    await addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image: activeImage,
      price: currentPrice,
      quantity,
      variant_id: selectedVariant?.id || null,
      variant: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : null,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '40px',
    }}>
      {/* ── Left: Image Gallery ── */}
      <div>
        <div style={{
          width: '100%',
          paddingTop: '85%',
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--color-cream)',
          border: '1px solid var(--color-border)',
          marginBottom: '16px',
        }}>
          <img
            src={activeImage}
            alt={product.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Thumbnail list */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {images.map((img: any, idx: number) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImage(img.url)}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: activeImage === img.url ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Product Specs & Actions ── */}
      <div>
        {/* Category & Origin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span className="badge badge-organic">
            {product.category?.name || 'Nông sản sạch'}
          </span>
          {product.origin && (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-mid)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> Xuất xứ: <strong>{product.origin}</strong>
            </span>
          )}
        </div>

        {/* Product Title */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
          fontWeight: 800,
          color: 'var(--color-brown-dark)',
          marginBottom: '12px',
          lineHeight: 1.3,
        }}>
          {product.name}
        </h1>

        {/* Reviews & SKU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', color: '#F5A623' }}>
              <Star size={15} fill="#F5A623" />
            </div>
            <strong style={{ color: 'var(--color-dark)' }}>{product.avg_rating || 5.0}</strong>
            <span style={{ color: 'var(--color-gray-mid)' }}>({product.review_count || 12} đánh giá)</span>
          </div>
          {product.sku && (
            <span style={{ color: 'var(--color-gray-mid)' }}>Mã SP: <strong>{product.sku}</strong></span>
          )}
          <span style={{ color: 'var(--color-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={16} /> Còn {product.stock_quantity || 100} {product.unit || 'sản phẩm'}
          </span>
        </div>

        {/* Price Box */}
        <div style={{
          background: 'var(--color-cream)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-red)' }}>
            {formatPrice(currentPrice)}
          </div>
          {originalPrice > currentPrice && (
            <>
              <div style={{ fontSize: '1.1rem', color: 'var(--color-gray-mid)', textDecoration: 'line-through' }}>
                {formatPrice(originalPrice)}
              </div>
              <span className="badge badge-sale">
                -{product.discount_percentage || 15}%
              </span>
            </>
          )}
          {product.unit && (
            <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
              /{product.unit}
            </span>
          )}
        </div>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '10px' }}>
              Quy cách / Trọng lượng:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: selectedVariant?.id === v.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: selectedVariant?.id === v.id ? 'var(--color-primary-light)' : '#FFF',
                    color: selectedVariant?.id === v.id ? 'var(--color-brown-dark)' : 'var(--color-gray-dark)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {v.name ? `${v.name}: ` : ''}{v.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Controls */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '10px' }}>
            Số lượng:
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#FFF' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ padding: '10px 14px', color: 'var(--color-brown)' }}
            >
              <Minus size={16} />
            </button>
            <span style={{ minWidth: '44px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{ padding: '10px 14px', color: 'var(--color-brown)' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAddToCart}
            className="btn-outline"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '14px 24px',
              fontSize: '1rem',
              background: added ? 'var(--color-green)' : '#FFF',
              borderColor: added ? 'var(--color-green)' : 'var(--color-primary)',
              color: added ? '#FFF' : 'var(--color-brown-dark)',
            }}
          >
            {added ? (
              <>
                <Check size={20} /> Đã thêm vào giỏ!
              </>
            ) : (
              <>
                <ShoppingCart size={20} /> Thêm Vào Giỏ
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="btn-primary"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '14px 24px',
              fontSize: '1rem',
            }}
          >
            <Zap size={20} /> Mua Ngay
          </button>
        </div>
      </div>
    </div>
  );
}
