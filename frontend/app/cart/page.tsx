'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { shouldUnoptimizeImage } from '../../lib/image';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, Tag, X, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/api';

export default function CartPage() {
  const {
    items,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    refreshCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  // Giỏ thay đổi → kiểm tra lại mã giảm giá đang áp dụng
  useEffect(() => {
    if (coupon) refreshCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount]);

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '540px' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--color-cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '2.5rem',
          }}>
            🛒
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '12px' }}>
            Giỏ hàng của bạn đang trống!
          </h2>
          <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem', marginBottom: '30px', lineHeight: 1.6 }}>
            Hãy dạo quanh cửa hàng để lựa chọn những món nông sản tươi ngon, an toàn cho cả gia đình nhé.
          </p>
          <Link href="/products" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <ShoppingBag size={18} /> Khám Phá Nông Sản Ngay
          </Link>
        </div>
      </div>
    );
  }

  const shippingFee = coupon ? coupon.shipping_fee : (totalAmount >= 300000 ? 0 : 25000);
  const shippingDiscount = coupon?.shipping_discount || 0;
  const payableShipping = Math.max(0, shippingFee - shippingDiscount);
  const discountAmount = coupon?.discount_amount || 0;
  const finalTotal = coupon ? coupon.total : totalAmount + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplying(true);
    setCouponError(null);

    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err?.message || 'Mã giảm giá không hợp lệ.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>
            Giỏ Hàng Của Bạn ({items.length} mặt hàng)
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-mid)', marginTop: '4px' }}>
            Kiểm tra số lượng và tiến hành đặt hàng nhận hàng trong ngày
          </div>
        </div>

        <div className="cart-layout" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Items List */}
          <div style={{
            background: '#FFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            {/* Header table */}
            <div className="cart-header" style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1.2fr 1.2fr 40px',
              padding: '16px 24px',
              background: 'var(--color-cream)',
              borderBottom: '1px solid var(--color-border)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--color-brown)',
            }}>
              <div>Sản phẩm</div>
              <div style={{ textAlign: 'center' }}>Đơn giá</div>
              <div style={{ textAlign: 'center' }}>Số lượng</div>
              <div style={{ textAlign: 'right' }}>Thành tiền</div>
              <div></div>
            </div>

            {/* Rows */}
            <div style={{ padding: '8px 24px' }}>
              {items.map((item) => (
                <div
                  key={`${item.product_id}-${item.variant_id || 'base'}`}
                  className="cart-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1.2fr 1.2fr 40px',
                    padding: '20px 0',
                    borderBottom: '1px solid var(--color-gray-light)',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Product Info */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Image
                      src={item.image || 'https://placehold.co/100x100/FAF7F0/6B4226?text=NongSan'}
                      alt={item.name}
                      width={68}
                      height={68}
                      unoptimized={shouldUnoptimizeImage(item.image)}
                      style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <Link href={`/products/${item.slug}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-brown-dark)' }}>
                        {item.name}
                      </Link>
                      {item.variant && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)', marginTop: '4px' }}>
                          Phân loại: {item.variant}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variant_id)}
                        style={{ padding: '6px 10px', color: 'var(--color-brown)' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variant_id)}
                        style={{ padding: '6px 10px', color: 'var(--color-brown)' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--color-red)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  {/* Delete button */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => removeFromCart(item.product_id, item.variant_id)}
                      style={{ color: 'var(--color-gray-mid)', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-red)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gray-mid)')}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions bottom */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              background: 'var(--color-cream)',
            }}>
              <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-brown)' }}>
                <ArrowLeft size={16} /> Tiếp tục chọn thêm sản phẩm
              </Link>
              <button
                onClick={clearCart}
                style={{ fontSize: '0.85rem', color: 'var(--color-red)', fontWeight: 600 }}
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div style={{
            background: '#FFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '20px', borderBottom: '1px solid var(--color-gray-light)', paddingBottom: '12px' }}>
              Tóm Tắt Đơn Hàng
            </h3>

            {/* Mã giảm giá */}
            <div style={{ marginBottom: '18px' }}>
              {coupon ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--color-cream)',
                  border: '1.5px dashed var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-brown-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} /> {coupon.code}
                      <Check size={14} color="var(--color-green)" />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-green)', marginTop: '2px' }}>
                      {coupon.message || 'Đã áp dụng mã giảm giá'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    title="Bỏ mã giảm giá"
                    style={{ color: 'var(--color-gray-mid)', padding: '4px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--color-border)',
                        outline: 'none',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="btn-primary"
                      style={{ padding: '10px 14px', fontSize: '0.82rem', opacity: applying ? 0.7 : 1 }}
                    >
                      {applying ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  {couponError && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-red)', marginTop: '6px' }}>
                      {couponError}
                    </div>
                  )}
                </form>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
                <span>Tạm tính ({items.length} món):</span>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
                <span>Phí vận chuyển:</span>
                <span>{payableShipping === 0 ? <strong style={{ color: 'var(--color-green)' }}>Miễn phí</strong> : formatPrice(payableShipping)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-green)', fontWeight: 600 }}>
                  <span>Giảm giá ({coupon?.code}):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {payableShipping > 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)', background: 'var(--color-cream)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  💡 Mua thêm {formatPrice(300000 - totalAmount)} để được <strong>FREESHIP</strong>!
                </div>
              )}

              <div style={{
                borderTop: '2px dashed var(--color-border)',
                paddingTop: '16px',
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-brown-dark)' }}>Tổng cộng:</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-red)' }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              Tiến Hành Đặt Hàng <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
