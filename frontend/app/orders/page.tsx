'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { shouldUnoptimizeImage } from '../../lib/image';
import { Package, ChevronLeft, ChevronRight, XCircle, ArrowRight, Clock } from 'lucide-react';
import { fetchApi, formatPrice } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: number;
  product_name: string;
  variant_name?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  order_code: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: '#ED6C02', bg: '#FFF4E5' },
  confirmed: { label: 'Đã xác nhận', color: '#0288D1', bg: '#E1F5FE' },
  preparing: { label: 'Đang chuẩn bị', color: '#7B1FA2', bg: '#F3E5F5' },
  shipping: { label: 'Đang giao', color: '#1976D2', bg: '#E3F2FD' },
  delivered: { label: 'Đã giao', color: '#00897B', bg: '#E0F2F1' },
  completed: { label: 'Hoàn thành', color: '#2E7D32', bg: '#E8F5E9' },
  cancelled: { label: 'Đã hủy', color: '#D32F2F', bg: '#FFEBEE' },
  refunded: { label: 'Đã hoàn tiền', color: '#6B4226', bg: '#FAF7F0' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPAY',
};

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadOrders = useCallback(async (targetPage = page) => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi(`/orders?page=${targetPage}`);
      setOrders(res?.data || []);
      setMeta(res?.meta || {});
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    if (!authLoading) loadOrders(page);
  }, [authLoading, page, loadOrders]);

  const cancelOrder = async (code: string) => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;

    setCancelling(code);
    try {
      await fetchApi(`/orders/${code}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Khách hàng hủy từ trang đơn hàng' }),
      });
      await loadOrders(page);
    } catch (err: any) {
      alert(err?.message || 'Không thể hủy đơn hàng.');
    } finally {
      setCancelling(null);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Package size={54} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>Đơn Hàng Của Tôi</h1>
        <p style={{ color: 'var(--color-gray-mid)', margin: '8px 0 24px' }}>Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>
        <Link href="/login?redirect=/orders" className="btn-primary">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '26px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>Đơn Hàng Của Tôi</h1>
          <p style={{ color: 'var(--color-gray-mid)', marginTop: '4px' }}>{meta.total || 0} đơn hàng</p>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-gray-mid)' }}>Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div style={{ background: '#FFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center' }}>
            <Package size={46} color="var(--color-primary)" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontWeight: 800, color: 'var(--color-brown-dark)' }}>Bạn chưa có đơn hàng nào</h2>
            <p style={{ color: 'var(--color-gray-mid)', margin: '6px 0 20px' }}>Khám phá nông sản tươi sạch và đặt đơn đầu tiên nhé!</p>
            <Link href="/products" className="btn-primary">Mua sắm ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((order) => {
              const status = STATUS[order.status] || { label: order.status, color: '#6B4226', bg: '#FAF7F0' };
              const canCancel = ['pending', 'confirmed'].includes(order.status);

              return (
                <div key={order.id} style={{ background: '#FFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '14px 20px', background: 'var(--color-cream)', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <strong style={{ color: 'var(--color-brown-dark)' }}>{order.order_code}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)', marginLeft: '10px' }}>{order.created_at}</span>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, color: status.color, background: status.bg }}>
                      {status.label}
                    </span>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Image
                          src={item.image || 'https://placehold.co/80x80/FAF7F0/6B4226?text=NS'}
                          alt={item.product_name}
                          width={48}
                          height={48}
                          unoptimized={shouldUnoptimizeImage(item.image)}
                          style={{ borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-brown-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--color-gray-mid)' }}>
                            {item.variant_name ? `${item.variant_name} · ` : ''}x{item.quantity}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatPrice(item.subtotal)}</div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>+{order.items.length - 3} sản phẩm khác</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px 20px', borderTop: '1px solid var(--color-gray-light)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> {PAYMENT_LABELS[order.payment_method] || order.payment_method} ·{' '}
                      <span style={{ color: order.payment_status === 'paid' ? 'var(--color-green)' : 'var(--color-red)' }}>
                        {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-gray-mid)' }}>Tổng: </span>
                        <strong style={{ color: 'var(--color-red)', fontSize: '1rem' }}>{formatPrice(order.total)}</strong>
                      </div>
                      {canCancel && (
                        <button
                          onClick={() => cancelOrder(order.order_code)}
                          disabled={cancelling === order.order_code}
                          style={{ color: 'var(--color-red)', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <XCircle size={15} /> {cancelling === order.order_code ? 'Đang hủy...' : 'Hủy'}
                        </button>
                      )}
                      <Link href={`/orders/${order.order_code}`} className="btn-outline" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                        Chi tiết <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {meta.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-outline" style={{ padding: '8px 12px' }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Trang {meta.current_page} / {meta.last_page}</span>
                <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page} className="btn-outline" style={{ padding: '8px 12px' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
