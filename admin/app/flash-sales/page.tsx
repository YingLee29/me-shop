'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Zap, Trash2, Calendar, Clock, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';

export default function AdminFlashSalesPage() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailSale, setDetailSale] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    start_at: '',
    end_at: '',
    banner_url: '',
    is_active: true,
    selected_products: [] as { product_id: number; flash_sale_price: number; limit_quantity: number }[],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetchAdminApi('/admin/flash-sales'),
        fetchAdminApi('/admin/products?limit=100'),
      ]);

      if (salesRes?.data) setFlashSales(salesRes.data);
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

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await fetchAdminApi(`/admin/flash-sales/${id}`);
      if (res?.data) {
        setDetailSale(res.data);
      }
    } catch (e) {
      alert('Không thể tải chi tiết đợt Flash Sale');
    }
  };

  const handleToggleProduct = (product: any) => {
    const exists = formData.selected_products.find((p) => p.product_id === product.id);
    if (exists) {
      setFormData({
        ...formData,
        selected_products: formData.selected_products.filter((p) => p.product_id !== product.id),
      });
    } else {
      setFormData({
        ...formData,
        selected_products: [
          ...formData.selected_products,
          {
            product_id: product.id,
            flash_sale_price: Math.round(product.price * 0.8), // mặc định giảm 20%
            limit_quantity: 50,
          },
        ],
      });
    }
  };

  const handleUpdateProductPrice = (productId: number, price: number) => {
    setFormData({
      ...formData,
      selected_products: formData.selected_products.map((p) =>
        p.product_id === productId ? { ...p, flash_sale_price: price } : p
      ),
    });
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selected_products.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm tham gia Flash Sale!');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        banner_url: formData.banner_url || null,
        is_active: formData.is_active,
        products: formData.selected_products,
      };

      const res = await fetchAdminApi('/admin/flash-sales', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.data) {
        alert('Tạo đợt Flash Sale thành công!');
        setShowAddModal(false);
        setFormData({
          name: '',
          start_at: '',
          end_at: '',
          banner_url: '',
          is_active: true,
          selected_products: [],
        });
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
    if (!confirm('Bạn có chắc chắn muốn xóa đợt Flash Sale này?')) return;
    try {
      await fetchAdminApi(`/admin/flash-sales/${id}`, { method: 'DELETE' });
      setFlashSales(flashSales.filter((s) => s.id !== id));
      if (detailSale?.id === id) setDetailSale(null);
    } catch (e) {
      alert('Lỗi khi xóa Flash Sale');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-brown)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap color="var(--admin-primary)" /> Quản Lý Đợt Flash Sale (Giờ Vàng)
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
            Tạo chiến dịch khuyến mãi giảm giá giờ vàng kích cầu mua sắm nông sản
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
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
          <Plus size={18} /> Tạo Đợt Flash Sale Mới
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#FFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#FAF7F0', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-brown)', fontWeight: 700 }}>
              <th style={{ padding: '14px 20px' }}>Tên Chiến Dịch</th>
              <th style={{ padding: '14px 20px' }}>Thời Gian Bắt Đầu</th>
              <th style={{ padding: '14px 20px' }}>Thời Gian Kết Thúc</th>
              <th style={{ padding: '14px 20px' }}>Số Sản Phẩm</th>
              <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Đang tải danh sách Flash Sale...
                </td>
              </tr>
            ) : flashSales.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Chưa có đợt Flash Sale nào. Nhấn "Tạo Đợt Flash Sale Mới" để bắt đầu.
                </td>
              </tr>
            ) : (
              flashSales.map((sale) => {
                const now = new Date();
                const start = new Date(sale.start_at);
                const end = new Date(sale.end_at);
                const isRunning = sale.is_active && now >= start && now <= end;
                const isUpcoming = sale.is_active && now < start;
                const isExpired = now > end;

                return (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--admin-brown)' }}>{sale.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>Slug: {sale.slug}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#555' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#888" /> {new Date(sale.start_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#555' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#888" /> {new Date(sale.end_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                      <span style={{ background: '#F0EAD6', padding: '4px 10px', borderRadius: '12px', color: 'var(--admin-brown)' }}>
                        {sale.flash_sale_products_count || 0} sản phẩm
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {isRunning ? (
                        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                          🔥 Đang diễn ra
                        </span>
                      ) : isUpcoming ? (
                        <span style={{ background: '#FFF3E0', color: '#E65100', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                          ⏳ Sắp diễn ra
                        </span>
                      ) : (
                        <span style={{ background: '#ECEFF1', color: '#607D8B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                          Đã kết thúc
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenDetail(sale.id)}
                          style={{ padding: '6px', color: 'var(--admin-primary)', border: '1px solid var(--admin-border)', borderRadius: '4px', background: '#FFF' }}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          style={{ padding: '6px', color: '#E53935', border: '1px solid var(--admin-border)', borderRadius: '4px', background: '#FFF' }}
                          title="Xóa đợt sale"
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

      {/* Modal Xem chi tiết */}
      {detailSale && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-brown)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="var(--admin-primary)" /> {detailSale.name}
              </h2>
              <button onClick={() => setDetailSale(null)} style={{ fontSize: '1.5rem', color: '#888', border: 'none', background: 'none' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.88rem', color: '#555', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><strong>Bắt đầu:</strong> {new Date(detailSale.start_at).toLocaleString('vi-VN')}</div>
              <div><strong>Kết thúc:</strong> {new Date(detailSale.end_at).toLocaleString('vi-VN')}</div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '12px' }}>Danh Sách Sản Phẩm Flash Sale</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#FAF7F0', borderBottom: '1px solid var(--admin-border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Sản phẩm</th>
                  <th style={{ padding: '10px' }}>Giá gốc</th>
                  <th style={{ padding: '10px' }}>Giá Flash Sale</th>
                  <th style={{ padding: '10px' }}>Đã bán / Giới hạn</th>
                </tr>
              </thead>
              <tbody>
                {detailSale.flash_sale_products?.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{item.product?.name}</td>
                    <td style={{ padding: '10px', textDecoration: 'line-through', color: '#888' }}>{formatPrice(item.product?.price)}</td>
                    <td style={{ padding: '10px', color: '#D9534F', fontWeight: 700 }}>{formatPrice(item.flash_sale_price)}</td>
                    <td style={{ padding: '10px' }}>{item.sold_quantity} / {item.limit_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm Flash Sale */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-brown)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="var(--admin-primary)" /> Tạo Đợt Flash Sale Mới
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ fontSize: '1.5rem', color: '#888', border: 'none', background: 'none' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateSale}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                    Tên Chiến Dịch *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Giờ Vàng Nông Sản Cuối Tuần"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Thời Gian Bắt Đầu *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                      Thời Gian Kết Thúc *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                    URL Banner Ảnh (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '8px' }}>
                    Chọn Sản Phẩm Tham Gia ({formData.selected_products.length} sản phẩm đã chọn) *
                  </label>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
                    {products.map((p) => {
                      const isSelected = formData.selected_products.some((sp) => sp.product_id === p.id);
                      const selectedItem = formData.selected_products.find((sp) => sp.product_id === p.id);

                      return (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            background: isSelected ? '#FAF7F0' : 'transparent',
                            borderBottom: '1px solid #F0EAD6',
                            marginBottom: '4px',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProduct(p)}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#888' }}>Giá gốc: {formatPrice(p.price)}</div>
                            </div>
                          </label>

                          {isSelected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--admin-brown)', fontWeight: 600 }}>Giá Flash Sale:</span>
                              <input
                                type="number"
                                value={selectedItem?.flash_sale_price || ''}
                                onChange={(e) => handleUpdateProductPrice(p.id, Number(e.target.value))}
                                style={{ width: '110px', padding: '6px 8px', border: '1px solid var(--admin-border)', borderRadius: '4px', textAlign: 'right' }}
                              />
                              <span style={{ fontSize: '0.8rem' }}>đ</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  {saving ? 'Đang lưu...' : 'Lưu Đợt Flash Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
