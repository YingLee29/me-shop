'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Ticket, Power } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: 'percent' | 'fixed' | 'freeship';
  value: number;
  min_order_amount: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  user_limit?: number | null;
  starts_at?: string | null;
  expired_at?: string | null;
  is_active: boolean;
  status: 'active' | 'inactive' | 'expired' | 'upcoming' | 'exhausted';
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Đang chạy',  color: 'var(--color-green)', bg: 'var(--color-green-light)' },
  upcoming:  { label: 'Sắp diễn ra', color: 'var(--color-blue)',  bg: 'var(--color-blue-light)' },
  expired:   { label: 'Hết hạn',    color: 'var(--admin-text-muted)', bg: '#F1EDE4' },
  exhausted: { label: 'Hết lượt',   color: 'var(--color-amber)', bg: 'var(--color-amber-light)' },
  inactive:  { label: 'Đã tắt',     color: 'var(--color-red)',   bg: 'var(--color-red-light)' },
};

const TYPE_LABEL: Record<string, string> = {
  percent: 'Giảm theo %',
  fixed: 'Giảm số tiền',
  freeship: 'Miễn phí ship',
};

const toInputValue = (value?: string | null) => (value ? value.replace(' ', 'T').slice(0, 16) : '');

const emptyForm = () => ({
  code: '',
  name: '',
  description: '',
  type: 'percent',
  value: '10',
  min_order_amount: '0',
  max_discount: '',
  usage_limit: '',
  user_limit: '1',
  starts_at: '',
  expired_at: '',
  is_active: true,
});

export default function AdminCouponsPage() {
  const { user } = useAdminAuth();
  const canManage = user?.permissions?.includes('coupons.manage') ?? false;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminApi('/admin/coupons?per_page=50');
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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: String(coupon.value),
      min_order_amount: String(coupon.min_order_amount),
      max_discount: coupon.max_discount != null ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit != null ? String(coupon.usage_limit) : '',
      user_limit: coupon.user_limit != null ? String(coupon.user_limit) : '',
      starts_at: toInputValue(coupon.starts_at),
      expired_at: toInputValue(coupon.expired_at),
      is_active: coupon.is_active,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description || null,
        type: form.type,
        value: Number(form.value || 0),
        min_order_amount: Number(form.min_order_amount || 0),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        user_limit: form.user_limit ? Number(form.user_limit) : null,
        starts_at: form.starts_at || null,
        expired_at: form.expired_at || null,
        is_active: form.is_active,
      };

      if (editing) {
        await fetchAdminApi(`/admin/coupons/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdminApi('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Không lưu được mã giảm giá.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await fetchAdminApi(`/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          min_order_amount: coupon.min_order_amount,
          max_discount: coupon.max_discount,
          usage_limit: coupon.usage_limit,
          user_limit: coupon.user_limit,
          starts_at: coupon.starts_at,
          expired_at: coupon.expired_at,
          is_active: !coupon.is_active,
        }),
      });
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Không cập nhật được trạng thái.');
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Xóa mã giảm giá "${coupon.code}"?`)) return;

    try {
      await fetchAdminApi(`/admin/coupons/${coupon.id}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Không xóa được mã giảm giá.');
    }
  };

  const describeCoupon = (coupon: Coupon) => {
    if (coupon.type === 'percent') {
      return `Giảm ${coupon.value}%${coupon.max_discount ? ` (tối đa ${formatPrice(coupon.max_discount)})` : ''}`;
    }
    if (coupon.type === 'fixed') {
      return `Giảm ${formatPrice(coupon.value)}`;
    }
    return 'Miễn phí vận chuyển';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ticket size={26} color="var(--admin-primary-dark)" /> Mã Giảm Giá
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Quản lý coupon giảm giá, freeship và giới hạn lượt sử dụng.
          </p>
        </div>

        {canManage && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Tạo Mã Giảm Giá
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Đang tải...</div>
      ) : coupons.length === 0 ? (
        <div className="table-container" style={{ padding: '48px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          Chưa có mã giảm giá nào.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Ưu đãi</th>
                <th>Điều kiện</th>
                <th>Đã dùng</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const meta = STATUS_META[coupon.status] || STATUS_META.inactive;
                return (
                  <tr key={coupon.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--admin-primary-dark)', letterSpacing: '0.4px' }}>{coupon.code}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{coupon.name}</div>
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>
                      <div>{describeCoupon(coupon)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{TYPE_LABEL[coupon.type]}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div>Đơn từ {formatPrice(coupon.min_order_amount)}</div>
                      {coupon.expired_at && <div style={{ color: 'var(--admin-text-muted)' }}>HSD: {coupon.expired_at}</div>}
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>
                      <strong>{coupon.used_count}</strong>
                      {coupon.usage_limit != null && <span style={{ color: 'var(--admin-text-muted)' }}> / {coupon.usage_limit}</span>}
                    </td>
                    <td>
                      <span className="badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                    </td>
                    <td>
                      {canManage && (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleToggle(coupon)} title="Bật/tắt" style={{ padding: '7px', color: coupon.is_active ? 'var(--color-green)' : 'var(--admin-text-muted)' }}>
                          <Power size={16} />
                        </button>
                        <button onClick={() => openEdit(coupon)} title="Sửa" style={{ padding: '7px', color: 'var(--color-blue)' }}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(coupon)} title="Xóa" style={{ padding: '7px', color: 'var(--color-red)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#FFF', borderRadius: 'var(--radius-lg)', maxWidth: '640px',
            width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
                {editing ? 'Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ fontSize: '1.4rem', color: '#999' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Mã code *</label>
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ ...inputStyle, textTransform: 'uppercase' }} placeholder="SALE10" />
                </div>
                <div>
                  <label style={labelStyle}>Tên chương trình *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Giảm 10% đơn hàng" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Loại ưu đãi *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    <option value="percent">Giảm theo %</option>
                    <option value="fixed">Giảm số tiền</option>
                    <option value="freeship">Miễn phí vận chuyển</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{form.type === 'percent' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (đ)'}</label>
                  <input
                    type="number"
                    min={0}
                    disabled={form.type === 'freeship'}
                    value={form.type === 'freeship' ? 0 : form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    style={{ ...inputStyle, opacity: form.type === 'freeship' ? 0.6 : 1 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Đơn tối thiểu (đ)</label>
                  <input type="number" min={0} value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Giảm tối đa (đ)</label>
                  <input type="number" min={0} placeholder="Không giới hạn" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Tổng lượt dùng</label>
                  <input type="number" min={1} placeholder="Không giới hạn" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Lượt / mỗi khách</label>
                  <input type="number" min={1} placeholder="Không giới hạn" value={form.user_limit} onChange={(e) => setForm({ ...form, user_limit: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Bắt đầu</label>
                  <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hết hạn</label>
                  <input type="datetime-local" value={form.expired_at} onChange={(e) => setForm({ ...form, expired_at: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mô tả</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-brown)' }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Kích hoạt mã giảm giá
              </label>

              <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '13px', marginTop: '8px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Đang lưu...' : editing ? 'Lưu Thay Đổi' : 'Tạo Mã Giảm Giá'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: 'var(--admin-brown)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--admin-border)',
  outline: 'none',
  fontSize: '0.88rem',
  background: '#FFF',
};
