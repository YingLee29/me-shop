'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Package, TrendingUp, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../lib/api';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total_revenue: 0, pending_count: 0 });
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetchAdminApi('/admin/orders'),
          fetchAdminApi('/admin/products'),
        ]);

        if (ordersRes?.data) setOrders(ordersRes.data);
        if (ordersRes?.summary) setSummary(ordersRes.summary);
        if (productsRes?.meta?.total) {
          setProductsCount(productsRes.meta.total);
        } else if (productsRes?.data) {
          setProductsCount(productsRes.data.length);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const statusColors: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Chờ xử lý', color: '#ED6C02', bg: '#FFF4E5' },
    confirmed: { label: 'Đã xác nhận', color: '#0288D1', bg: '#E1F5FE' },
    preparing: { label: 'Đang chuẩn bị', color: '#7B1FA2', bg: '#F3E5F5' },
    shipping: { label: 'Đang giao', color: '#1976D2', bg: '#E3F2FD' },
    completed: { label: 'Hoàn thành', color: '#2E7D32', bg: '#E8F5E9' },
    cancelled: { label: 'Đã hủy', color: '#D32F2F', bg: '#FFEBEE' },
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
          Tổng Quan Hoạt Động
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Theo dõi doanh số và đơn hàng hôm nay
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '36px',
      }}>
        {/* Doanh thu */}
        <div style={{
          background: '#FFF',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--admin-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>TỔNG DOANH THU</span>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            {formatPrice(summary.total_revenue || 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#2E7D32', marginTop: '6px', fontWeight: 600 }}>
            ↑ Doanh thu từ đơn hàng hoàn tất
          </div>
        </div>

        {/* Đơn hàng chờ xử lý */}
        <div style={{
          background: '#FFF',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--admin-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>ĐƠN CHỜ XỬ LÝ</span>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#FFF4E5', color: '#ED6C02', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ED6C02' }}>
            {summary.pending_count || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '6px' }}>
            Cần đóng gói & xác nhận
          </div>
        </div>

        {/* Tổng sản phẩm */}
        <div style={{
          background: '#FFF',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--admin-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>SẢN PHẨM TRÊN SÀN</span>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#E3F2FD', color: '#1976D2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            {productsCount || 15}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '6px' }}>
            Đang hoạt động trên cửa hàng
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--admin-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
              Đơn Hàng Gần Đây
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
              Danh sách 10 đơn đặt hàng mới nhất
            </p>
          </div>
          <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-primary-dark)' }}>
            Xem toàn bộ đơn <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            Đang tải dữ liệu...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            Chưa có đơn hàng nào được đặt.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => {
                  const st = statusColors[o.status] || { label: o.status, color: '#333', bg: '#EEE' };
                  return (
                    <tr key={o.id}>
                      <td><strong>{o.order_code}</strong></td>
                      <td>{o.customer_name}</td>
                      <td>{o.customer_phone}</td>
                      <td><strong style={{ color: 'var(--color-red)' }}>{formatPrice(o.total)}</strong></td>
                      <td>{o.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}</td>
                      <td>
                        <span className="badge" style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>{o.created_at}</td>
                      <td>
                        <Link href={`/orders?search=${o.order_code}`} className="btn-primary btn-sm">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
