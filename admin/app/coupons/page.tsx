'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Trash2, Calendar, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'fixed', // percent | fixed | freeship
    value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    start_at: '',
    expired_at: '',
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminApi('/admin/coupons');
      if (res?.data) setCoupons(res.data);
    } catch (e) {
      console.error('Failed to load coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      type: 'fixed',
      value: '',
      min_order_amount: '100000',
      max_discount_amount: '',
      usage_limit: '100',
      start_at: '',
      expired_at: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      name: c.name,
      type: c.type,
      value: String(c.value),
      min_order_amount: c.min_order_amount ? String(c.min_order_amount) : '',
      max_discount_amount: c.max_discount_amount ? String(c.max_discount_amount) : '',
      usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      start_at: c.start_at ? c.start_at.slice(0, 16) : '',
      expired_at: c.expired_at ? c.expired_at.slice(0, 16) : '',
      is_active: Boolean(c.is_active),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name,
        type: formData.type,
        value: Number(formData.value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        start_at: formData.start_at ? new Date(formData.start_at).toISOString() : null,
        expired_at: formData.expired_at ? new Date(formData.expired_at).toISOString() : null,
        is_active: formData.is_active,
      };

      const url = editingCoupon ? `/admin/coupons/${editingCoupon.id}` : '/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetchAdminApi(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res?.data) {
        alert(editingCoupon ? 'Cập nhật mã giảm giá thành công!' : 'Tạo mã giảm giá mới thành công!');
        setShowModal(false);
        loadData();
      } else {
        alert(res?.message || 'Có lỗi xảy ra');
      }
    } catch (e: any) {
      alert(e.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      await fetchAdminApi(`/admin/coupons/${id}`, { method: 'DELETE' });
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (e) {
      alert('Lỗi khi xóa mã giảm giá');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-brown)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket color="var(--admin-primary)" /> Quản Lý Mã Giảm Giá (Coupons)
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
            Tạo và cấu hình các mã khuyến mãi giảm theo số tiền, theo phần trăm hoặc miễn phí vận chuyển
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--admin-primary)',
            color: '#FFF',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          <Plus size={18} /> Tạo Mã Mới
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#FFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#FAF7F0', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-brown)', fontWeight: 700 }}>
              <th style={{ padding: '14px 20px' }}>Mã Code</th>
              <th style={{ padding: '14px 20px' }}>Tên Khuyến Mãi</th>
              <th style={{ padding: '14px 20px' }}>Mức Giảm</th>
              <th style={{ padding: '14px 20px' }}>Đơn Tối Thiểu</th>
              <th style={{ padding: '14px 20px' }}>Đã Dùng / Giới Hạn</th>
              <th style={{ padding: '14px 20px' }}>Hạn Dùng</th>
              <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Đang tải danh sách mã giảm giá...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Chưa có mã giảm giá nào.
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const now = new Date();
                const expired = c.expired_at ? new Date(c.expired_at) < now : false;

                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        background: '#FAF0E6',
                        color: 'var(--admin-brown)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                        border: '1px dashed var(--admin-primary)',
                      }}>
                        {c.code}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--admin-brown)' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#2E7D32' }}>
                      {c.type === 'percent'
                        ? `Giảm ${c.value}%`
                        : c.type === 'freeship'
                        ? 'Miễn phí vận chuyển'
                        : `Giảm ${formatPrice(c.value)}`}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#555' }}>
                      {formatPrice(c.min_order_amount || 0)}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                      {c.used_count || 0} / {c.usage_limit || '∞'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: expired ? '#D9534F' : '#555' }}>
                      {c.expired_at ? new Date(c.expired_at).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {c.is_active && !expired ? (
                        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          Hoạt động
                        </span>
                      ) : (
                        <span style={{ background: '#ECEFF1', color: '#607D8B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {expired ? 'Hết hạn' : 'Đã khóa'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          style={{ padding: '6px', color: 'var(--admin-primary)', border: '1px solid var(--admin-border)', borderRadius: '4px', background: '#FFF' }}
                          title="Sửa mã"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ padding: '6px', color: '#E53935', border: '1px solid var(--admin-border)', borderRadius: '4px', background: '#FFF' }}
                          title="Xóa mã"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-brown)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="var(--admin-primary)" /> {editingCoupon ? 'Cập Nhật Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '1.5rem', color: '#888', border: 'none', background: 'none' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Mã Code (In Hoa) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: CHAOBANMOI"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Tên Chiến Dịch *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Giảm 20K cho khách hàng mới"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Loại Giảm Giá *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)', background: '#FFF' }}
                    >
                      <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                      <option value="percent">Giảm theo tỷ lệ phần trăm (%)</option>
                      <option value="freeship">Miễn phí vận chuyển (Freeship)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Giá Trị Giảm * ({formData.type === 'percent' ? '%' : 'VNĐ'})
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={formData.type === 'percent' ? 'VD: 10' : 'VD: 20000'}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Đơn Hàng Tối Thiểu (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Giới Hạn Lượt Dùng (Lần)
                    </label>
                    <input
                      type="number"
                      placeholder="Để trống = Không giới hạn"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Bắt Đầu Lúc
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Hết Hạn Lúc
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expired_at}
                      onChange={(e) => setFormData({ ...formData, expired_at: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-brown)' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Kích hoạt mã giảm giá ngay
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 18px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)', background: '#FFF' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    background: 'var(--admin-primary)',
                    color: '#FFF',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    border: 'none',
                  }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu Mã Giảm Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
