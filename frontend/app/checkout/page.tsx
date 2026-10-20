'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, CheckCircle2, AlertCircle, Gift, Wallet, QrCode } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi, formatPrice } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart, coupon, refreshCoupon } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    payment_method: 'cod',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);

  // Tải số điểm khả dụng
  useEffect(() => {
    if (!user) {
      setAvailablePoints(0);
      setPointsUsed(0);
      return;
    }

    fetchApi('/loyalty')
      .then((res) => setAvailablePoints(res?.summary?.points || 0))
      .catch(() => setAvailablePoints(0));
  }, [user]);

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

  // Giỏ thay đổi → kiểm tra lại mã giảm giá
  useEffect(() => {
    if (coupon) refreshCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount]);

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

  const shippingFee = coupon ? coupon.shipping_fee : (totalAmount >= 300000 ? 0 : 25000);
  const shippingDiscount = coupon?.shipping_discount || 0;
  const payableShipping = Math.max(0, shippingFee - shippingDiscount);
  const discountAmount = coupon?.discount_amount || 0;
  const baseTotal = coupon ? coupon.total : totalAmount + shippingFee;

  // 1 điểm = 100đ, không vượt quá giá trị đơn
  const maxPoints = Math.min(availablePoints, Math.floor(baseTotal / 100));
  const appliedPoints = Math.min(pointsUsed, maxPoints);
  const pointsDiscount = appliedPoints * 100;
  const finalTotal = Math.max(0, baseTotal - pointsDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create order via backend API
      const res = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          coupon_code: coupon?.code || null,
          points_used: appliedPoints,
          // Gửi kèm items để guest cũng đặt được đơn và server kiểm tra lại giá/tồn kho
          items: items.map((i) => ({
            product_id: i.product_id,
            variant_id: i.variant_id || null,
            quantity: i.quantity,
          })),
        }),
      });

      if (res?.data?.order_code) {
        const orderCode = res.data.order_code;

        // Clear local cart
        await clearCart();

        // Thanh toán online: tạo URL và chuyển sang cổng thanh toán
        if (['momo', 'vnpay'].includes(formData.payment_method)) {
          try {
            const payment = await fetchApi(`/payments/${orderCode}/create`, { method: 'POST' });
            if (payment?.payment_url) {
              window.location.href = payment.payment_url;
              return;
            }
          } catch (paymentError: any) {
            router.push(`/orders/${orderCode}?payment=unavailable`);
            return;
          }
        }

        // Redirect to success / tracking page
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

        <form onSubmit={handleSubmit} className="checkout-layout" style={{
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '6px' }}>
                  Họ và tên người nhận <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
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
                  Số điện thoại <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
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
                  Địa chỉ giao hàng chi tiết <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
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
                        Chuyển khoản Ngân Hàng (QR Code)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Quét mã VietQR chuyển khoản nhanh 24/7.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.payment_method === 'momo' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: formData.payment_method === 'momo' ? 'var(--color-cream)' : '#FFF',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="momo"
                      checked={formData.payment_method === 'momo'}
                      onChange={() => setFormData({ ...formData, payment_method: 'momo' })}
                    />
                    <Wallet size={20} color="#A50064" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-brown-dark)' }}>
                        Ví điện tử MoMo
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Tính năng minh hoạ – chưa kết nối cổng thanh toán thật.
                      </div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.payment_method === 'vnpay' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: formData.payment_method === 'vnpay' ? 'var(--color-cream)' : '#FFF',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={formData.payment_method === 'vnpay'}
                      onChange={() => setFormData({ ...formData, payment_method: 'vnpay' })}
                    />
                    <QrCode size={20} color="#005BAA" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-brown-dark)' }}>
                        VNPAY – Thẻ ATM / QR Code
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                        Tính năng minh hoạ – đơn hàng vẫn được ghi nhận để thanh toán sau.
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

            {/* Calculations */}
            <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
                <span>Tạm tính:</span>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
                <span>Phí vận chuyển:</span>
                <span>{payableShipping === 0 ? <strong style={{ color: 'var(--color-green)' }}>Miễn phí</strong> : formatPrice(payableShipping)}</span>
              </div>

              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-green)', fontWeight: 600 }}>
                  <span>Mã giảm giá ({coupon.code}):</span>
                  <span>-{formatPrice(discountAmount + shippingDiscount)}</span>
                </div>
              )}

              {coupon && (
                <Link href="/cart" style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                  Thay đổi mã giảm giá
                </Link>
              )}

              {user && availablePoints >= 10 && maxPoints >= 10 && (
                <div style={{
                  background: 'var(--color-cream)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-brown)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Gift size={15} /> Dùng điểm thưởng ({availablePoints} điểm)
                    </span>
                    <button
                      type="button"
                      onClick={() => setPointsUsed(maxPoints)}
                      style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', background: 'none' }}
                    >
                      Dùng tối đa
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min={0}
                      max={maxPoints}
                      value={pointsUsed || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(maxPoints, Number(e.target.value) || 0));
                        setPointsUsed(value > 0 && value < 10 ? 10 : value);
                      }}
                      style={{
                        width: '110px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--color-border)',
                        outline: 'none',
                        fontSize: '0.85rem',
                        background: '#FFF',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-dark)' }}>
                      = -{formatPrice(pointsDiscount)}
                    </span>
                  </div>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-green)', fontWeight: 600 }}>
                  <span>Điểm thưởng ({appliedPoints} điểm):</span>
                  <span>-{formatPrice(pointsDiscount)}</span>
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
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-red)' }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.05rem',
                borderRadius: 'var(--radius-md)',
                marginTop: '24px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận Đặt Hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
