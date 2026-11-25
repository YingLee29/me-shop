'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, CheckCircle, TrendingUp, Calendar, Award, Package, ArrowUpRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface RevenueSummary {
  total_revenue: number;
  total_orders: number;
  completed_orders: number;
  average_order_value: number;
  days: number;
}

interface ChartItem {
  date: string;
  daily_revenue: number;
  total_orders: number;
  completed_orders: number;
}

interface TopProduct {
  id: number;
  name: string;
  price: number;
  sold_count: number;
  stock_quantity: number;
  unit?: string;
  primary_image?: { url: string };
  category?: { name: string };
}

export default function AdminReportsPage() {
  const { token } = useAdminAuth();
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [revRes, topRes] = await Promise.all([
        fetch(`/api/v1/admin/reports/revenue?days=${days}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch('/api/v1/admin/reports/top-products?limit=10', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
      ]);

      if (revRes.ok) {
        const revJson = await revRes.json();
        setSummary(revJson.summary);
        setChartData(revJson.chart_data || []);
      }

      if (topRes.ok) {
        const topJson = await topRes.json();
        setTopProducts(topJson.data || []);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, days]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  // Find max daily revenue for chart scaling
  const maxRevenue = Math.max(...chartData.map((d) => Number(d.daily_revenue) || 0), 100000);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown)', margin: '0 0 6px 0' }}>
            Báo Cáo & Thống Kê Doanh Thu
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Biểu đồ phân tích doanh thu bán lẻ nông sản, hiệu suất đơn hàng và top nông sản chạy nhất.
          </p>
        </div>

        {/* Time range filter buttons */}
        <div style={{
          display: 'flex',
          background: '#FFF',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--admin-border)',
        }}>
          {[
            { label: '7 Ngày Qua', val: 7 },
            { label: '30 Ngày Qua', val: 30 },
            { label: '90 Ngày Qua', val: 90 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDays(item.val)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: days === item.val ? 'var(--admin-primary)' : 'transparent',
                color: days === item.val ? '#FFF' : 'var(--admin-brown)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div style={{
          background: '#FFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--admin-border)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(46, 125, 50, 0.12)',
            color: '#2E7D32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              TỔNG DOANH THU ({days} ngày)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-brown)', marginTop: '4px' }}>
              {formatVND(summary?.total_revenue || 0)}
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--admin-border)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(200, 164, 90, 0.15)',
            color: 'var(--admin-brown)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              TỔNG ĐƠN HÀNG
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-brown)', marginTop: '4px' }}>
              {summary?.total_orders || 0} đơn
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--admin-border)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(33, 150, 243, 0.12)',
            color: '#1976D2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              ĐƠN HOÀN THÀNH
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-brown)', marginTop: '4px' }}>
              {summary?.completed_orders || 0} đơn
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--admin-border)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(230, 81, 0, 0.12)',
            color: '#E65100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              GIÁ TRỊ ĐƠN TB (AOV)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-brown)', marginTop: '4px' }}>
              {formatVND(summary?.average_order_value || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        padding: '28px',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-brown)', margin: 0 }}>
              Biểu Đồ Xu Hướng Doanh Thu Theo Ngày
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', margin: '4px 0 0 0' }}>
              Cột màu xanh đại diện cho doanh thu theo từng ngày
            </p>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-primary)' }}>
            Cao nhất: {formatVND(maxRevenue)}
          </span>
        </div>

        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-muted)' }}>
            Chưa có dữ liệu đơn hàng trong khoảng thời gian này.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', minWidth: '600px', height: '260px', paddingTop: '20px' }}>
              {chartData.map((item, idx) => {
                const revenue = Number(item.daily_revenue) || 0;
                const heightPercent = Math.max(8, Math.round((revenue / maxRevenue) * 100));

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      {revenue > 0 ? (revenue >= 1000000 ? `${(revenue / 1000000).toFixed(1)}M` : `${Math.round(revenue / 1000)}k`) : '0'}
                    </div>
                    <div
                      title={`${item.date}: ${formatVND(revenue)} (${item.total_orders} đơn)`}
                      style={{
                        width: '100%',
                        maxWidth: '40px',
                        height: `${heightPercent}%`,
                        background: 'linear-gradient(180deg, var(--admin-primary) 0%, var(--admin-brown) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '8px', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                      {item.date ? item.date.slice(5) : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Best Selling Products */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={20} color="var(--admin-primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-brown)', margin: 0 }}>
            Top 10 Nông Sản Bán Chạy Nhất
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF8F5', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>HẠNG</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>SẢN PHẨM</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>DANH MỤC</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>ĐƠN GIÁ</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>ĐÃ BÁN</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>TỒN KHO</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)', textAlign: 'right' }}>DOANH SỐ TẠM TÍNH</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Đang tải danh sách sản phẩm...
                </td>
              </tr>
            ) : topProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Chưa có thống kê sản phẩm.
                </td>
              </tr>
            ) : (
              topProducts.map((p, index) => {
                const totalRevenueGen = (p.sold_count || 0) * (p.price || 0);

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--admin-border)',
                        color: index < 3 ? '#2C1A0E' : 'var(--admin-brown)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.primary_image?.url || 'https://placehold.co/60x60/FAF7F0/6B4226?text=NS'}
                          alt=""
                          style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-brown)' }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                      {p.category?.name || 'Nông sản'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.88rem', fontWeight: 600 }}>
                      {formatVND(p.price)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--admin-brown)' }}>
                      {p.sold_count || 0} {p.unit || ''}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem' }}>
                      <span style={{
                        fontWeight: 600,
                        color: (p.stock_quantity || 0) <= 10 ? '#C62828' : '#2E7D32',
                      }}>
                        {p.stock_quantity || 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, color: '#2E7D32', fontSize: '0.95rem' }}>
                      {formatVND(totalRevenueGen)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
