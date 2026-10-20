'use client';

import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function PaymentButton({
  orderCode,
  provider,
}: {
  orderCode: string;
  provider: 'momo' | 'vnpay';
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi(`/payments/${orderCode}/create`, { method: 'POST' });
      if (res?.payment_url) {
        window.location.href = res.payment_url;
      } else if (res?.paid) {
        window.location.reload();
      } else {
        setError(res?.message || 'Không thể tạo giao dịch thanh toán.');
      }
    } catch (err: any) {
      setError(err.message || 'Cổng thanh toán chưa sẵn sàng. Vui lòng chọn COD hoặc chuyển khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '16px' }}>
      <button onClick={pay} disabled={loading} className="btn-primary" style={{ padding: '11px 22px' }}>
        <CreditCard size={17} /> {loading ? 'Đang kết nối...' : provider === 'momo' ? 'Thanh toán bằng MoMo' : 'Thanh toán bằng VNPAY'}
      </button>
      {error && <div style={{ color: 'var(--color-red)', fontSize: '0.82rem', marginTop: '8px' }}>{error}</div>}
    </div>
  );
}
