'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Package, CalendarDays, Download } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(isoDate(new Date(today.getTime() - 29 * 86400000)));
  const [dateTo, setDateTo] = useState(isoDate(today));
  const [summary, setSummary] = useState<any>({ revenue: 0, orders: 0, avg_order_value: 0, items_sold: 0 });
  const [series, setSeries] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(true);

  const load = async (from = dateFrom, to = dateTo, group = groupBy) => {
    setDateFrom(from);
    setDateTo(to);
    setLoading(true);
    try {
      const params = new URLSearchParams({ date_from: from, date_to: to, group_by: group });
      const [revenueRes, topRes] = await Promise.all([
        fetchAdminApi(`/admin/reports/revenue?${params.toString()}`),
        fetchAdminApi(`/admin/reports/top-products?date_from=${from}&date_to=${to}&limit=10`),
      ]);
      setSummary(revenueRes?.data?.summary || {});
      setSeries(revenueRes?.data?.series || []);
      setGroupBy(revenueRes?.data?.group_by || groupBy);
      setTopProducts(topRes?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const preset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 86400000);
    load(isoDate(start), isoDate(end), groupBy);
  };

  const maxRevenue = Math.max(...series.map((item) => item.revenue), 1);
  const totalSeriesRevenue = series.reduce((sum, item) => sum + item.revenue, 0);

  const exportCsv = () => {
    const rows = [
      ['Kỳ', 'Doanh thu', 'Số đơn'],
      ...series.map((item) => [item.period, item.revenue, item.orders]),
      [],
      ['Sản phẩm', 'Số lượng', 'Doanh thu'],
      ...topProducts.map((item) => [item.product_name, item.quantity, item.revenue]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-${dateFrom}-${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: 'Doanh thu', value: formatPrice(summary.revenue || 0), icon: DollarSign, color: '#2E7D32', bg: '#E8F5E9' },
    { label: 'Số đơn hoàn thành', value: summary.orders || 0, icon: ShoppingBag, color: '#1976D2', bg: '#E3F2FD' },
    { label: 'Giá trị đơn trung bình', value: formatPrice(summary.avg_order_value || 0), icon: TrendingUp, color: '#6A1B9A', bg: '#F3E5F5' },
    { label: 'Sản phẩm đã bán', value: summary.items_sold || 0, icon: Package, color: '#ED6C02', bg: '#FFF4E5' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>Báo Cáo Doanh Thu</h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>Chỉ tính đơn đã giao / hoàn thành</p>
        </div>
        <button onClick={exportCsv} className="btn-outline" style={{ padding: '9px 14px' }}>
          <Download size={16} /> Xuất CSV
        </button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px' }}>Từ ngày</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--admin-border)', borderRadius: 6 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px' }}>Đến ngày</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--admin-border)', borderRadius: 6 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px' }}>Nhóm theo</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--admin-border)', borderRadius: 6 }}>
            <option value="day">Ngày</option>
            <option value="month">Tháng</option>
          </select>
        </div>
        <button onClick={() => load()} className="btn-primary" style={{ padding: '9px 16px' }}><CalendarDays size={16} /> Xem báo cáo</button>
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {[7, 30, 90].map((days) => (
            <button key={days} onClick={() => preset(days)} style={{ padding: '7px 11px', borderRadius: 999, border: '1px solid var(--admin-border)', fontSize: '0.78rem', fontWeight: 600, background: '#FFF' }}>
              {days} ngày
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={21} />
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginBottom: '3px' }}>{card.label}</div>
                <div style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Biểu Đồ Doanh Thu</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Tổng: <strong style={{ color: 'var(--color-red)' }}>{formatPrice(totalSeriesRevenue)}</strong></span>
        </div>

        {loading ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Đang tải...</div>
        ) : series.length === 0 ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Không có dữ liệu trong khoảng thời gian này.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: series.length > 45 ? '2px' : '6px', height: 230, padding: '10px 4px 0', borderBottom: '1px solid var(--admin-border)', overflowX: 'auto' }}>
            {series.map((item) => (
              <div key={item.period} title={`${item.label}: ${formatPrice(item.revenue)} · ${item.orders} đơn`} style={{ flex: 1, minWidth: series.length > 45 ? 5 : 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ fontSize: '0.62rem', color: '#777', marginBottom: '4px', whiteSpace: 'nowrap', opacity: item.revenue > 0 ? 1 : 0 }}>
                  {(item.revenue / 1000).toFixed(0)}k
                </div>
                <div style={{ width: '100%', maxWidth: 46, height: `${Math.max((item.revenue / maxRevenue) * 180, item.revenue > 0 ? 4 : 1)}px`, borderRadius: '4px 4px 0 0', background: item.revenue > 0 ? 'linear-gradient(180deg, #7CB342, #2E7D32)' : '#EEE' }} />
                <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '5px', transform: series.length > 20 ? 'rotate(-40deg)' : 'none', transformOrigin: 'top center', whiteSpace: 'nowrap' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="table-container">
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--admin-border)', fontWeight: 800 }}>Top Sản Phẩm Bán Chạy</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Sản phẩm</th>
              <th>Số lượng bán</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Chưa có dữ liệu.</td></tr>
            ) : topProducts.map((product, index) => (
              <tr key={`${product.product_id}-${index}`}>
                <td><strong>{index + 1}</strong></td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--admin-brown-dark)' }}>{product.product_name}</div>
                  {product.slug && <a href={`http://localhost:3000/products/${product.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#1976D2' }}>Xem trên website</a>}
                </td>
                <td>{product.quantity}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-red)' }}>{formatPrice(product.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
