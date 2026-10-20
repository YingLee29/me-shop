'use client';

import React, { useEffect, useState } from 'react';
import { Search, Save, Download, AlertTriangle, PackageX, Boxes } from 'lucide-react';
import { fetchAdminApi, API_BASE_URL, formatPrice } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

const TABS = [
  { key: '', label: 'Tất cả', icon: Boxes },
  { key: 'low', label: 'Sắp hết', icon: AlertTriangle },
  { key: 'out', label: 'Hết hàng', icon: PackageX },
  { key: 'in', label: 'Còn nhiều', icon: Boxes },
];

export default function AdminInventoryPage() {
  const { user } = useAdminAuth();
  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ low: 0, out: 0, total_stock: 0 });
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [threshold, setThreshold] = useState('10');
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(targetPage), threshold });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetchAdminApi(`/admin/inventory?${params.toString()}`);
      setProducts(res?.data || []);
      setMeta(res?.meta || {});
      setStats(res?.stats || {});
      setChanges({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page, status]);

  const setStock = (id: number, value: string) => {
    setChanges((current) => ({ ...current, [id]: value }));
  };

  const saveOne = async (product: any) => {
    const value = changes[product.id];
    if (value === undefined) return;
    try {
      await fetchAdminApi(`/admin/inventory/${product.id}`, {
        method: 'POST',
        body: JSON.stringify({ stock_quantity: Number(value) }),
      });
      await load(page);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật tồn kho');
    }
  };

  const saveAll = async () => {
    const items = Object.entries(changes).map(([id, value]) => ({ id: Number(id), stock_quantity: Number(value) }));
    if (items.length === 0) return;
    setSaving(true);
    try {
      await fetchAdminApi('/admin/inventory/bulk', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      await load(page);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật tồn kho');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    try {
      const token = localStorage.getItem('nongsan_admin_token');
      const res = await fetch(`${API_BASE_URL}/admin/inventory/export?status=${status}&threshold=${threshold}`, {
        headers: { Accept: 'text/csv', Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('Không thể xuất file');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ton-kho-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Không thể xuất file');
    }
  };

  const changedCount = Object.keys(changes).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>Quản Lý Tồn Kho</h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Tổng tồn kho: <strong>{stats.total_stock || 0}</strong> sản phẩm
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCsv} className="btn-outline" style={{ padding: '9px 14px' }}>
            <Download size={16} /> Xuất CSV
          </button>
          {can('inventory.update') && changedCount > 0 && (
            <button onClick={saveAll} disabled={saving} className="btn-primary" style={{ background: 'var(--color-green)' }}>
              <Save size={16} /> Lưu {changedCount} thay đổi
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>Sắp hết (≤ {threshold})</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ED6C02' }}>{stats.low || 0}</div>
        </div>
        <div style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>Đã hết hàng</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D32F2F' }}>{stats.out || 0}</div>
        </div>
        <div style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>Ngưỡng cảnh báo</div>
          <input
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            onBlur={() => load(1)}
            style={{ width: 90, padding: '4px 8px', border: '1px solid var(--admin-border)', borderRadius: 5, fontWeight: 700, marginTop: 3 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setStatus(tab.key); setPage(1); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '999px', fontSize: '0.83rem', fontWeight: 700,
                background: status === tab.key ? 'var(--color-brown)' : '#FFF',
                color: status === tab.key ? '#FFF' : 'var(--admin-text-muted)',
                border: '1px solid var(--admin-border)',
              }}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}

        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(1); }} style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên hoặc SKU..." style={{ padding: '8px 11px', border: '1px solid var(--admin-border)', borderRadius: 6, width: 220, fontSize: '0.85rem' }} />
          <button className="btn-primary" style={{ padding: '8px 12px' }}><Search size={15} /></button>
        </form>
      </div>

      {loading ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Đang tải tồn kho...</div>
      ) : products.length === 0 ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Không có sản phẩm phù hợp.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.stock_quantity;
                const value = changes[product.id] ?? String(stock);
                const isLow = stock > 0 && stock <= Number(threshold);
                const isOut = stock <= 0;

                return (
                  <tr key={product.id}>
                    <td>
                      <img src={product.primary_image?.url || 'https://placehold.co/50x50/FAF7F0/6B4226?text=NS'} alt="" style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover' }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--admin-brown-dark)' }}>{product.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#999' }}>{product.sku || '—'}</div>
                    </td>
                    <td>{product.category?.name || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(product.price)}</td>
                    <td>
                      {can('inventory.update') ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input
                            type="number"
                            min={0}
                            value={value}
                            onChange={(e) => setStock(product.id, e.target.value)}
                            style={{ width: 82, padding: '6px 8px', border: changes[product.id] !== undefined ? '2px solid var(--color-primary)' : '1px solid var(--admin-border)', borderRadius: 5, fontWeight: 700 }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#777' }}>{product.unit}</span>
                        </div>
                      ) : (
                        <strong>{stock} {product.unit}</strong>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: isOut ? 'var(--color-red-light)' : isLow ? '#FFF4E5' : 'var(--color-green-light)',
                        color: isOut ? 'var(--color-red)' : isLow ? '#ED6C02' : 'var(--color-green)',
                      }}>
                        {isOut ? 'Hết hàng' : isLow ? 'Sắp hết' : 'Còn hàng'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {can('inventory.update') && (
                        <button
                          onClick={() => saveOne(product)}
                          disabled={changes[product.id] === undefined}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: 5, background: changes[product.id] !== undefined ? '#E8F5E9' : '#F5F5F5', color: changes[product.id] !== undefined ? '#2E7D32' : '#AAA', fontWeight: 700, fontSize: '0.78rem' }}
                        >
                          <Save size={14} /> Lưu
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline" style={{ padding: '7px 12px' }}>Trước</button>
          <span style={{ padding: '7px', fontSize: '0.85rem' }}>Trang {meta.current_page} / {meta.last_page}</span>
          <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="btn-outline" style={{ padding: '7px 12px' }}>Sau</button>
        </div>
      )}
    </div>
  );
}
