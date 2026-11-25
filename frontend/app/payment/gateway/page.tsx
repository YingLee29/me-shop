'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { fetchApi, formatPrice } from '../../../lib/api';

export default function PaymentGatewayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const method = searchParams.get('method') || 'momo';
  const orderCode = searchParams.get('order_code') || '';
  const amount = Number(searchParams.get('amount')) || 0;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 phút

  const isMomo = method === 'momo';
  const brandColor = isMomo ? '#A50064' : '#0066CC';
  const brandName = isMomo ? 'Ví Điện Tử MoMo' : 'Cổng Thanh Toán VNPAY';
  const brandLogo = isMomo ? '🌸 MoMo' : '💳 VNPAY';

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleConfirmPayment = async () => {
    if (!orderCode) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi('/payment/confirm', {
        method: 'POST',
        body: JSON.stringify({
          order_code: orderCode,
          method,
        }),
      });

      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/orders/${orderCode}`);
        }, 2000);
      } else {
        throw new Error(res?.message || 'Thanh toán thất bại.');
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi kết nối cổng thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', background: '#F8F9FA', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: '#FFF',
        borderRadius: '20px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '1px solid #EAEAEA',
        overflow: 'hidden',
      }}>
        {/* Gateway Brand Header */}
        <div style={{
          background: brandColor,
          color: '#FFF',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            {brandLogo} Sandbox Gateway
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>
            Hệ thống thanh toán trực tuyến an toàn & tức thì
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2E7D32', marginBottom: '8px' }}>
                Thanh Toán Thành Công!
              </h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Đơn hàng <strong>#{orderCode}</strong> đã được xác nhận thanh toán. Đang chuyển hướng về trang chi tiết đơn hàng...
              </p>
            </div>
          ) : (
            <>
              {/* Order Info */}
              <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#666' }}>Mã đơn hàng:</span>
                  <strong style={{ color: 'var(--color-brown-dark)' }}>#{orderCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#666' }}>Số tiền cần thanh toán:</span>
                  <strong style={{ color: brandColor, fontSize: '1.2rem', fontWeight: 800 }}>
                    {formatPrice(amount)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#888' }}>
                  <span>Hết hạn sau:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E53935', fontWeight: 700 }}>
                    <Clock size={14} /> {formatTime(secondsLeft)}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '12px',
                  background: '#FFF',
                  border: '2px dashed ' + brandColor,
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `${method}://pay?order=${orderCode}&amount=${amount}`
                    )}`}
                    alt="QR Code thanh toán"
                    style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }}
                  />
                </div>
                <p style={{ fontSize: '0.82rem', color: '#777', marginTop: '10px' }}>
                  Quét mã QR bằng ứng dụng <strong>{brandName}</strong> để thanh toán
                </p>
              </div>

              {error && (
                <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Sandbox Confirmation Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: brandColor,
                    color: '#FFF',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 14px ${brandColor}40`,
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin" /> Đang xử lý giao dịch...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} /> Xác Nhận Thanh Toán Ngay (Sandbox)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/orders/${orderCode}`)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    color: '#888',
                    border: 'none',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Quay lại xem đơn hàng
                </button>
              </div>
            </>
          )}

          {/* Secure badge footer */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: '#999' }}>
            <ShieldCheck size={16} color="#4CAF50" /> Kết nối bảo mật chuẩn SSL 256-bit & PCI-DSS
          </div>
        </div>
      </div>
    </div>
  );
}
