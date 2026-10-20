'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Zap, Power } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';

interface FlashSale {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  start_at: string;
  end_at: string;
  is_active: boolean;
  status: 'running' | 'upcoming' | 'ended' | 'inactive';
  items_count: number;
}

interface ProductOption {
  id: number;
  name: string;
  sku?: string | null;
  price: number;
  sale_price?: number | null;
  current_price: number;
}

interface SelectedProduct {
  sale_price: string;
  quantity_limit: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  running:  { label: 'Đang chạy',  color: 'var(--color-green)', bg: 'var(--color-green-light)' },
  upcoming: { label: 'Sắp diễn ra', color: 'var(--color-blue)',  bg: 'var(--color-blue-light)' },
  ended:    { label: 'Đã kết thúc', color: 'var(--admin-text-muted)', bg: '#F1EDE4' },
  inactive: { label: 'Đã tắt',     color: 'var(--color-red)',   bg: 'var(--color-red-light)' },
};

const toInputValue = (value: string) => value.replace(' ', 'T').slice(0, 16);

const emptyForm = () => ({
  name: '',
  start_at: toInputValue(new Date().toISOString()),
  end_at: toInputValue(new Date(Date.now() + 3 * 86400000).toISOString()),
  description: '',
  is_active: true,
});

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm());
  const [selected, setSelected] = useState<Record<number, SelectedProduct>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetchAdminApi('/admin/flash-sales?per_page=50'),
        fetchAdminApi('/admin/products?per_page=100'),
      ]);
      if (salesRes?.data) setSales(salesRes.data);
      if (productsRes?.data) setProducts(productsRes.data);
    } catch (e) {
      console.error('Failed to load flash sales:', e);
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
    setSelected({});
    setError(null);
    setModalOpen(true);
  };

  const openEdit = async (sale: FlashSale) => {
    setError(null);
    try {
      const res = await fetchAdminApi(`/admin/flash-sales/${sale.id}`);
      const data = res?.data;
      if (!data) throw new Error('Không tải được đợt flash sale.');

      setEditing(sale);
      setForm({
        name: data.name || '',
        start_at: toInputValue(data.start_at),
        end_at: toInputValue(data.end_at),
        description: data.description || '',
        is_active: !!data.is_active,
      });

      const nextSelected: Record<number, SelectedProduct> = {};
      (data.products || []).forEach((item: any) => {
        nextSelected[item.product_id] = {
          sale_price: String(Math.round(item.sale_price)),
          quantity_limit: item.quantity_limit ? String(item.quantity_limit) : '',
        };
      });
      setSelected(nextSelected);
      setModalOpen(true);
    } catch (e: any) {
      alert(e?.message || 'Có lỗi khi tải dữ liệu.');
    }
  };

  const toggleProduct = (product: ProductOption) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = {
          sale_price: String(Math.round(product.current_price * 0.8)),
          quantity_limit: '',
        };
      }
      return next;
    });
  };

  const updateSelected = (productId: number, field: keyof SelectedProduct, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        start_at: form.start_at,
        end_at: form.end_at,
        is_active: form.is_active,
        products: Object.entries(selected).map(([productId, value]) => ({
          product_id: Number(productId),
          sale_price: Number(value.sale_price || 0),
          quantity_limit: value.quantity_limit ? Number(value.quantity_limit) : null,
        })),
      };

      if (editing) {
        await fetchAdminApi(`/admin/flash-sales/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdminApi('/admin/flash-sales', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Không lưu được đợt flash sale.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (sale: FlashSale) => {
    try {
      await fetchAdminApi(`/admin/flash-sales/${sale.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: sale.name,
          start_at: sale.start_at,
          end_at: sale.end_at,
          is_active: !sale.is_active,
        }),
      });
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Không cập nhật được trạng thái.');
    }
  };

  const handleDelete = async (sale: FlashSale) => {
    if (!confirm(`Xóa đợt flash sale "${sale.name}"?`)) return;

    try {
      await fetchAdminApi(`/admin/flash-sales/${sale.id}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Không xóa được đợt flash sale.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={26} color="var(--admin-primary-dark)" /> Flash Sale
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Quản lý các đợt giờ vàng giá sốc và sản phẩm tham gia.
          </p>
        </div>

        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Tạo đợt Flash Sale
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Đang tải...</div>
      ) : sales.length === 0 ? (
        <div className="table-container" style={{ padding: '48px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
          Chưa có đợt flash sale nào.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Đợt Flash Sale</th>
                <th>Thời gian</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const meta = STATUS_META[sale.status] || STATUS_META.inactive;
                return (
                  <tr key={sale.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--admin-brown-dark)' }}>{sale.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{sale.slug}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <div>{sale.start_at}</div>
                      <div style={{ color: 'var(--admin-text-muted)' }}>→ {sale.end_at}</div>
                    </td>
                    <td><strong>{sale.items_count}</strong> sản phẩm</td>
                    <td>
                      <span className="badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleToggle(sale)} title="Bật/tắt" style={{ padding: '7px', color: sale.is_active ? 'var(--color-green)' : 'var(--admin-text-muted)' }}>
                          <Power size={16} />
                        </button>
                        <button onClick={() => openEdit(sale)} title="Sửa" style={{ padding: '7px', color: 'var(--color-blue)' }}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(sale)} title="Xóa" style={{ padding: '7px', color: 'var(--color-red)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
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
            background: '#FFF', borderRadius: 'var(--radius-lg)', maxWidth: '760px',
            width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
                {editing ? 'Sửa Đợt Flash Sale' : 'Tạo Đợt Flash Sale'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ fontSize: '1.4rem', color: '#999' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Tên đợt *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Ví dụ: Giờ Vàng Nông Sản" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Bắt đầu *</label>
                  <input required type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kết thúc *</label>
                  <input required type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mô tả</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-brown)' }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Kích hoạt đợt flash sale
              </label>

              <div>
                <div style={{ ...labelStyle, marginBottom: '8px' }}>Sản phẩm tham gia ({Object.keys(selected).length})</div>
                <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}>
                  {products.map((product) => {
                    const chosen = selected[product.id];
                    return (
                      <div key={product.id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderBottom: '1px solid #F0ECE1',
                        background: chosen ? '#FBF6E9' : '#FFF',
                      }}>
                        <input type="checkbox" checked={!!chosen} onChange={() => toggleProduct(product)} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--admin-brown-dark)' }}>{product.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            {product.sku || '---'} · Giá hiện tại {formatPrice(product.current_price)}
                          </div>
                        </div>
                        {chosen && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="number"
                              min={0}
                              value={chosen.sale_price}
                              onChange={(e) => updateSelected(product.id, 'sale_price', e.target.value)}
                              title="Giá flash sale"
                              style={{ ...inputStyle, width: '120px', padding: '6px 8px' }}
                            />
                            <input
                              type="number"
                              min={1}
                              value={chosen.quantity_limit}
                              onChange={(e) => updateSelected(product.id, 'quantity_limit', e.target.value)}
                              placeholder="SL"
                              title="Giới hạn số lượng"
                              style={{ ...inputStyle, width: '70px', padding: '6px 8px' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '13px', marginTop: '8px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Đang lưu...' : editing ? 'Lưu Thay Đổi' : 'Tạo Flash Sale'}
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
