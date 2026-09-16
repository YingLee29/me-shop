'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeStatus) params.append('status', activeStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetchAdminApi(`/admin/orders?${params.toString()}`);
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleViewDetails = async (orderId: number) => {
    try {
      const res = await fetchAdminApi(`/admin/orders/${orderId}`);
      if (res?.data) {
        setSelectedOrder(res.data);
        setNewStatus(res.data.status);
        setAdminNote('');
      }
    } catch (e) {
      console.error('Failed to fetch order detail:', e);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setStatusUpdateLoading(true);
    try {
      await fetchAdminApi(`/admin/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          admin_note: adminNote,
        }),
      });

      // Reload
      await handleViewDetails(selectedOrder.id);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'preparing', label: 'Đang chuẩn bị hàng' },
    { value: 'shipping', label: 'Đang giao hàng' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            Quản Lý Đơn Hàng
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Theo dõi, xác nhận và cập nhật tiến độ giao hàng
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--admin-border)',
              outline: 'none',
              fontSize: '0.88rem',
              width: '280px',
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '10px 18px' }}>
            <Search size={16} /> Tìm
          </button>
        </form>
      </div>

      {/* Filter status tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveStatus(opt.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeStatus === opt.value ? 'var(--admin-brown)' : '#FFF',
              color: activeStatus === opt.value ? '#FFF' : 'var(--admin-text)',
              border: '1px solid var(--admin-border)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          Đang tải danh sách đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          Không tìm thấy đơn hàng nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Tổng tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const st = statusColors[o.status] || { label: o.status, color: '#333', bg: '#EEE' };
                return (
                  <tr key={o.id}>
                    <td><strong>{o.order_code}</strong></td>
                    <td>{o.customer_name}</td>
                    <td>{o.customer_phone}</td>
                    <td><strong style={{ color: 'var(--color-red)' }}>{formatPrice(o.total)}</strong></td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 600 }}>
                        {o.payment_method}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>{o.created_at}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(o.id)}
                        className="btn-primary btn-sm"
                      >
                        <Eye size={14} /> Xử lý đơn
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Order Details & Status Updater */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
                  Chi Tiết Đơn Hàng #{selectedOrder.order_code}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                  Ngày đặt: {selectedOrder.created_at}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ fontSize: '1.4rem', color: '#999', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Customer info */}
            <div style={{ background: '#FAF7F0', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-brown)' }}>Thông Tin Giao Hàng</div>
              <div style={{ marginTop: '8px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Người nhận:</strong> {selectedOrder.shipping_name} ({selectedOrder.shipping_phone})</div>
                <div><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</div>
                {selectedOrder.note && <div><strong>Ghi chú:</strong> {selectedOrder.note}</div>}
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-brown)', marginBottom: '10px' }}>Sản Phẩm Đặt Mua</div>
              <div style={{ border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #EEE' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#777' }}>{formatPrice(item.price)} x {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-red)' }}>{formatPrice(item.subtotal)}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#FAF7F0', fontWeight: 800 }}>
                  <span>Tổng tiền thanh toán:</span>
                  <span style={{ color: 'var(--color-red)', fontSize: '1.1rem' }}>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Update status form */}
            <div style={{ borderTop: '2px dashed var(--admin-border)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--admin-brown)', marginBottom: '12px' }}>
                Cập Nhật Trạng Thái Đơn Hàng
              </h4>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--admin-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="pending">Chờ xác nhận (Pending)</option>
                  <option value="confirmed">Đã xác nhận (Confirmed)</option>
                  <option value="preparing">Đang chuẩn bị hàng (Preparing)</option>
                  <option value="shipping">Đang giao hàng (Shipping)</option>
                  <option value="completed">Đã hoàn thành (Completed)</option>
                  <option value="cancelled">Hủy đơn hàng (Cancelled)</option>
                </select>

                <button
                  onClick={handleUpdateStatus}
                  disabled={statusUpdateLoading}
                  className="btn-primary"
                  style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
                >
                  {statusUpdateLoading ? 'Đang lưu...' : 'Lưu Trạng Thái'}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Ghi chú nội bộ admin (tùy chọn)..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
