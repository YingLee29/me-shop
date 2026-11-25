'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Smartphone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi, formatPrice } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get('coupon') || '';
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    payment_method: 'cod',
    note: '',
  });

  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill user profile if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shipping_name: user.name || '',
        shipping_phone: user.phone || '',
        shipping_address: user.address || '',
      }));
    }
  }, [user]);

  // Validate coupon
  const validateCoupon = async (code: string) => {
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetchApi('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal: totalAmount }),
      });
      if (res?.valid) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discount_amount || 0);
      } else {
        setCouponError(res?.message || 'Mã giảm giá không hợp lệ');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (e: any) {
      setCouponError('Không thể kiểm tra mã giảm giá');
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (initialCoupon) {
      validateCoupon(initialCoupon);
    }
  }, [initialCoupon, totalAmount]);

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <h2>Giỏ hàng của bạn đang trống!</h2>
          <p style={{ color: 'var(--color-gray-dark)', margin: '14px 0 24px' }}>
            Vui lòng chọn sản phẩm trước khi tiến hành thanh toán.
          </p>
          <Link href="/products" className="btn-primary">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const shippingFee = totalAmount >= 300000 ? 0 : 25000;
  const finalTotal = Math.max(0, totalAmount - discountAmount + shippingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        coupon_code: appliedCoupon ? appliedCoupon.code : (couponCode.trim() || undefined),
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.data?.order_code) {
        const orderCode = res.data.order_code;
        await clearCart();

        // Redirect to Online Payment Gateways if chosen
        if (formData.payment_method === 'momo') {
          const payRes = await fetchApi('/payment/momo/create', {
            method: 'POST',
            body: JSON.stringify({ order_code: orderCode }),
          });
          if (payRes?.pay_url) {
            window.location.href = payRes.pay_url;
            return;
          }
        } else if (formData.payment_method === 'vnpay') {
          const payRes = await fetchApi('/payment/vnpay/create', {
            method: 'POST',
            body: JSON.stringify({ order_code: orderCode }),
          });
          if (payRes?.pay_url) {
            window.location.href = payRes.pay_url;
            return;
          }
        }

        router.push(`/orders/${orderCode}`);
      } else {
        throw new Error(res?.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra trong quá trình đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--color-brown)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Quay lại giỏ hàng
          </Link>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '32px' }}>
          Thanh Toán Đơn Hàng
        </h1>

        {error && (
          <div style={{
            background: 'var(--color-red-light)',
            border: '1px solid var(--color-red)',
            color: 'var(--color-red)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '36px',
          alignItems: 'start',
        }}>
          {/* Left: Shipping Form */}
          <div style={{
            background: '#FFF',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brown)', marginBottom: '24px', borderBottom: '1px solid var(--color-gray-light)', paddingBottom: '12px' }}>
              Thông Tin Nhận Hàng
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '6px' }}>
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.shipping_name}
                  onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '6px' }}>
                  Số điện thoại nhận hàng *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0912 345 678"
                  value={formData.shipping_phone}
                  onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '6px' }}>
                  Địa chỉ giao hàng chi tiết *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, ngõ, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '6px' }}>
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Giao hàng buổi sáng, gọi trước khi đến..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.92rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Payment Method */}
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '12px' }}>
                  Phương thức thanh toán
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* COD */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.payment_method === 'cod' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: formData.payment_method === 'cod' ? 'var(--color-cream)' : '#FFF',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={() => setFormData({ ...formData, payment_method: 'cod' })}
                    />
                    <Banknote size={20} color="var(--color-primary-dark)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-brown-dark)' }}>
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Nhận hàng, kiểm tra độ tươi ngon rồi mới thanh toán tiền mặt.
                      </div>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.payment_method === 'momo' ? '2px solid #A50064' : '1px solid var(--color-border)',
                    background: formData.payment_method === 'momo' ? '#FDF2F7' : '#FFF',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="momo"
                      checked={formData.payment_method === 'momo'}
                      onChange={() => setFormData({ ...formData, payment_method: 'momo' })}
                    />
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: '#A50064', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>
                      M
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#A50064' }}>
                        Ví Điện Tử MoMo (Sandbox)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Quét mã QR qua ứng dụng MoMo siêu tốc & bảo mật.
                      </div>
                    </div>
                  </label>

                  {/* VNPAY */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.payment_method === 'vnpay' ? '2px solid #0066CC' : '1px solid var(--color-border)',
                    background: formData.payment_method === 'vnpay' ? '#F0F7FF' : '#FFF',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={formData.payment_method === 'vnpay'}
                      onChange={() => setFormData({ ...formData, payment_method: 'vnpay' })}
                    />
                    <CreditCard size={20} color="#0066CC" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0066CC' }}>
                        VNPAY (Thẻ ATM / QR Ngân Hàng Sandbox)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Hỗ trợ 40+ ngân hàng Việt Nam, thẻ quốc tế Visa/Master.
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.payment_method === 'bank_transfer' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: formData.payment_method === 'bank_transfer' ? 'var(--color-cream)' : '#FFF',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={() => setFormData({ ...formData, payment_method: 'bank_transfer' })}
                    />
                    <CreditCard size={20} color="var(--color-primary-dark)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-brown-dark)' }}>
                        Chuyển khoản Ngân Hàng Trực Tiếp
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Chuyển khoản theo thông tin tài khoản hiển thị sau khi đặt hàng.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Review */}
          <div style={{
            background: '#FFF',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brown)', marginBottom: '20px', borderBottom: '1px solid var(--color-gray-light)', paddingBottom: '12px' }}>
              Đơn Hàng Của Bạn ({items.length})
            </h2>

            {/* Item list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '320px', overflowY: 'auto', marginBottom: '24px' }}>
              {items.map((i) => (
                <div key={`${i.product_id}-${i.variant_id || 'base'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={i.image || 'https://placehold.co/80x80/FAF7F0/6B4226?text=NongSan'} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)' }}>{i.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>x{i.quantity} {i.variant ? `(${i.variant})` : ''}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-dark)' }}>
                    {formatPrice(i.price * i.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Mã Giảm Giá / Khuyến Mãi
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã coupon..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  type="button"
                  onClick={() => validateCoupon(couponCode)}
                  disabled={couponLoading || !couponCode.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  {couponLoading ? '...' : 'Áp Dụng'}
                </button>
              </div>

              {couponError && (
                <div style={{ color: 'var(--color-red)', fontSize: '0.78rem', marginTop: '6px' }}>
                  {couponError}
                </div>
              )}

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#E8F5E9', padding: '6px 10px', borderRadius: '6px', marginTop: '8px', fontSize: '0.82rem', color: '#2E7D32' }}>
                  <span>Đã dùng mã: <strong>{appliedCoupon.code}</strong></span>
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }}
                    style={{ color: '#D32F2F', fontWeight: 700, fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Gỡ bỏ
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
                <span>Tạm tính:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
                <span>Phí vận chuyển:</span>
                <span>{shippingFee === 0 ? <strong style={{ color: 'var(--color-green)' }}>Miễn phí</strong> : formatPrice(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-green)' }}>
                  <span>Giảm giá khuyến mãi:</span>
                  <strong>-{formatPrice(discountAmount)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brown-dark)', borderTop: '1px solid var(--color-gray-light)', paddingTop: '14px', marginTop: '6px' }}>
                <span>Tổng cộng:</span>
                <span style={{ color: 'var(--color-red)' }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '16px',
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {loading ? 'Đang Xử Lý Đơn Hàng...' : formData.payment_method === 'cod' ? 'Xác Nhận Đặt Hàng (COD)' : `Tiến Hành Thanh Toán (${formData.payment_method.toUpperCase()})`}
            </button>

            {/* Trust badge */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>
              <ShieldCheck size={16} color="var(--color-green)" />
              <span>Cam kết giao hàng đúng hẹn & bảo mật thông tin</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
