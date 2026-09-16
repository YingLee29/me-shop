'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Check, X, MapPin } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    sku: '',
    price: '',
    sale_price: '',
    stock_quantity: '100',
    unit: 'kg',
    origin: 'Đà Lạt, Lâm Đồng',
    short_description: '',
    is_active: true,
    is_featured: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchAdminApi(`/admin/products?search=${encodeURIComponent(searchTerm)}`),
        fetchAdminApi('/categories'),
      ]);

      if (productsRes?.data) setProducts(productsRes.data);
      if (categoriesRes?.data) setCategories(categoriesRes.data);
    } catch (e) {
      console.error('Failed to load products/categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchAdminApi('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          category_id: Number(formData.category_id),
          price: Number(formData.price),
          sale_price: formData.sale_price ? Number(formData.sale_price) : null,
          stock_quantity: Number(formData.stock_quantity),
        }),
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        category_id: '',
        sku: '',
        price: '',
        sale_price: '',
        stock_quantity: '100',
        unit: 'kg',
        origin: 'Đà Lạt, Lâm Đồng',
        short_description: '',
        is_active: true,
        is_featured: false,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await fetchAdminApi(`/admin/products/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            Quản Lý Sản Phẩm
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Danh mục và tồn kho nông sản đang bán
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Tìm tên sản phẩm, mã SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--admin-border)',
                outline: 'none',
                fontSize: '0.88rem',
                width: '240px',
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '9px 14px' }}>
              <Search size={16} />
            </button>
          </form>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ background: 'var(--color-green)' }}
          >
            <Plus size={18} /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          Đang tải danh sách sản phẩm...
        </div>
      ) : products.length === 0 ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          Không có sản phẩm nào.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>SKU</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Xuất xứ</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.primary_image?.url || 'https://placehold.co/60x60/FAF7F0/6B4226?text=NS'}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--admin-brown-dark)' }}>{p.name}</div>
                    {p.is_featured && (
                      <span className="badge" style={{ background: '#FFF4E5', color: '#ED6C02', fontSize: '0.68rem', padding: '2px 6px' }}>
                        Nổi bật
                      </span>
                    )}
                  </td>
                  <td style={{ color: '#777', fontSize: '0.82rem' }}>{p.sku || '—'}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-red)' }}>{formatPrice(p.current_price)}</div>
                    {p.sale_price && p.price > p.sale_price && (
                      <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#999' }}>
                        {formatPrice(p.price)}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: p.stock_quantity > 10 ? 'var(--color-green)' : 'var(--color-red)' }}>
                      {p.stock_quantity}
                    </strong> {p.unit}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#666' }}>{p.origin || 'Đà Lạt'}</td>
                  <td>
                    <span className="badge" style={{
                      background: p.is_active ? 'var(--color-green-light)' : 'var(--color-red-light)',
                      color: p.is_active ? 'var(--color-green)' : 'var(--color-red)',
                    }}>
                      {p.is_active ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      style={{ color: '#E53935', padding: '6px' }}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add Product */}
      {showAddModal && (
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
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
                Thêm Nông Sản Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ fontSize: '1.4rem', color: '#999' }}>✕</button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tên sản phẩm <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cải Kale Hữu Cơ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Danh mục <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Mã SKU
                  </label>
                  <input
                    type="text"
                    placeholder="RAU-005"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Giá bán (VNĐ) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="35000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Giá khuyến mãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Số lượng tồn kho <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    placeholder="kg, bó, vỉ, hộp..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Xuất xứ / Nông trại
                </label>
                <input
                  type="text"
                  placeholder="Đà Lạt, Lâm Đồng"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  placeholder="Rau trồng theo tiêu chuẩn hữu cơ, thu hoạch vào buổi sáng..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Đang hoạt động (hiển thị trên web)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  Sản phẩm nổi bật
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #CCC' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
