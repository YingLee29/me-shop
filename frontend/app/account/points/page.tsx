'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchApi, formatPrice } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface Transaction {
  id: number;
  type: string;
  type_label: string;
  points: number;
  description?: string;
  order_code?: string;
  created_at: string;
}

interface Summary {
  points: number;
  point_value: number;
  amount_per_point: number;
  min_redeem: number;
}

export default function LoyaltyPointsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    fetchApi('/loyalty')
      .then((res) => {
        setTransactions(res?.data || []);
        setSummary(res?.summary || null);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (!authLoading && !user) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Gift size={54} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>Điểm Thưởng</h1>
        <p style={{ color: 'var(--color-gray-mid)', marginTop: '8px', marginBottom: '24px' }}>
          Đăng nhập để xem điểm thưởng và lịch sử tích điểm.
        </p>
        <Link href="/login?redirect=/account/points" className="btn-primary">Đăng nhập ngay</Link>
      </div>
    );
  }

  const points = summary?.points ?? user?.loyalty_points ?? 0;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brown-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gift size={26} color="var(--color-primary-dark)" /> Điểm Thưởng Của Tôi
            </h1>
            <p style={{ color: 'var(--color-gray-mid)', marginTop: '4px' }}>Tích điểm mỗi khi mua sắm – đổi điểm thành giảm giá.</p>
          </div>
          <Link href="/account/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-brown)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Sản phẩm yêu thích
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6B4226 0%, #2C1A0E 100%)', color: '#FFF', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '6px' }}>Điểm hiện có</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{points}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '8px' }}>
              ≈ {formatPrice(points * (summary?.point_value || 100))} khi thanh toán
            </div>
          </div>

          <div style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '10px' }}>Cách tích điểm</h3>
            <ul style={{ fontSize: '0.84rem', color: 'var(--color-gray-dark)', lineHeight: 1.9, paddingLeft: '18px' }}>
              <li>Mỗi {formatPrice(summary?.amount_per_point || 10000)} mua hàng = <strong>1 điểm</strong></li>
              <li>100 điểm = giảm {formatPrice(100 * (summary?.point_value || 100))}</li>
              <li>Điểm được cộng khi đơn hàng <strong>hoàn thành</strong></li>
              <li>Sử dụng tối thiểu {summary?.min_redeem || 10} điểm mỗi đơn</li>
            </ul>
          </div>
        </div>

        <div style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-gray-light)', fontWeight: 800, color: 'var(--color-brown-dark)' }}>
            Lịch Sử Giao Dịch
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-mid)' }}>Đang tải...</div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-gray-mid)' }}>
              Chưa có giao dịch điểm nào. Hoàn thành đơn hàng đầu tiên để nhận điểm nhé!
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '14px 22px', borderBottom: '1px solid var(--color-gray-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: tx.points >= 0 ? 'var(--color-green-light)' : 'var(--color-red-light)',
                    color: tx.points >= 0 ? 'var(--color-green)' : 'var(--color-red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {tx.points >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-brown-dark)' }}>{tx.type_label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || tx.order_code || '—'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: tx.points >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {tx.points >= 0 ? '+' : ''}{tx.points} điểm
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-gray-mid)' }}>{tx.created_at}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
