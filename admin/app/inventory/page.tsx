'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle2, Search, Edit3, Save, X, Plus, Minus, ArrowDownCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  sold_count: number;
  unit?: string;
  category?: { name: string };
  primary_image?: { url: string };
}

interface InventoryCounts {
  total_products: number;
  low_stock: number;
  out_of_stock: number;
}

export default function AdminInventoryPage() {
  const { token } = useAdminAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [counts, setCounts] = useState<InventoryCounts>({ total_products: 0, low_stock: 0, out_of_stock: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Inline editing state: { [productId]: quantity }
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/v1/admin/inventory?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json();
        setProducts(json.products?.data || []);
        setCounts(json.counts || { total_products: 0, low_stock: 0, out_of_stock: 0 });
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInventory();
    }
  }, [token, statusFilter]);

  const handleStartEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setEditQuantity(p.stock_quantity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveStock = async (id: number) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/v1/admin/inventory/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ stock_quantity: editQuantity }),
      });

      if (res.ok) {
        setActionMessage('Cập nhật số lượng tồn kho thành công!');
        setTimeout(() => setActionMessage(null), 3000);
        setEditingId(null);
        fetchInventory();
      } else {
        alert('Không thể cập nhật tồn kho. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown)', margin: '0 0 6px 0' }}>
            Quản Lý Tồn Kho Nông Sản
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Kiểm soát số lượng tồn kho, cảnh báo hàng sắp hết và cập nhật nhanh số lượng ngay tại chỗ.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div style={{
          padding: '12px 20px',
          borderRadius: '8px',
          background: '#E8F5E9',
          color: '#2E7D32',
          border: '1px solid #C8E6C9',
          marginBottom: '20px',
          fontWeight: 600,
        }}>
          {actionMessage}
        </div>
      )}

      {/* KPI Badges row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#FFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'all' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
            padding: '20px 24px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-brown)', textTransform: 'uppercase' }}>
            TẤT CẢ NÔNG SẢN
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--admin-brown)', marginTop: '6px' }}>
            {counts.total_products}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('low_stock')}
          style={{
            background: '#FFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'low_stock' ? '2px solid #E65100' : '1px solid var(--admin-border)',
            padding: '20px 24px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E65100', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} /> SẮP HẾT HÀNG (&le; 10)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#E65100', marginTop: '6px' }}>
            {counts.low_stock}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('out_of_stock')}
          style={{
            background: '#FFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'out_of_stock' ? '2px solid #C62828' : '1px solid var(--admin-border)',
            padding: '20px 24px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C62828', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowDownCircle size={15} /> HẾT HÀNG (0)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C62828', marginTop: '6px' }}>
            {counts.out_of_stock}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9A8878' }} />
          <input
            type="text"
            placeholder="Tìm nông sản theo tên hoặc mã SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--admin-border)',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={fetchInventory}
          style={{
            padding: '9px 20px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--admin-brown)',
            color: '#FFF',
            fontWeight: 600,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tìm kiếm
        </button>
      </div>

      {/* Inventory Table */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF8F5', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>NÔNG SẢN</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>MÃ SKU</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>CHUYÊN MỤC</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>ĐÃ BÁN</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>TÌNH TRẠNG KHO</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>SỐ LƯỢNG TỒN</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)', textAlign: 'right' }}>THAO TÁC CẬP NHẬT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Đang tải danh sách tồn kho...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Không tìm thấy sản phẩm nào phù hợp.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isEditing = editingId === p.id;
                const isLow = p.stock_quantity <= 10 && p.stock_quantity > 0;
                const isOut = p.stock_quantity === 0;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.primary_image?.url || 'https://placehold.co/60x60/FAF7F0/6B4226?text=NS'}
                          alt=""
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-brown)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                            Đơn vị: {p.unit || 'kg'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-brown)' }}>
                      {p.sku || '-'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                      {p.category?.name || 'Nông sản'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '0.88rem', fontWeight: 600 }}>
                      {p.sold_count || 0}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isOut ? '#FFEBEE' : isLow ? '#FFF3E0' : '#E8F5E9',
                        color: isOut ? '#C62828' : isLow ? '#E65100' : '#2E7D32',
                      }}>
                        {isOut ? 'Hết hàng' : isLow ? 'Sắp hết hàng' : 'Đầy đủ'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setEditQuantity(Math.max(0, editQuantity - 5))}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: '#FFF' }}
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(Number(e.target.value))}
                            style={{
                              width: '70px',
                              padding: '6px 8px',
                              textAlign: 'center',
                              borderRadius: '4px',
                              border: '1.5px solid var(--admin-primary)',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setEditQuantity(editQuantity + 5)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--admin-border)', background: '#FFF' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: isOut ? '#C62828' : isLow ? '#E65100' : 'var(--admin-brown)' }}>
                          {p.stock_quantity}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleSaveStock(p.id)}
                            disabled={updating}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#2E7D32',
                              color: '#FFF',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            <Save size={14} /> Lưu
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-border)',
                              background: '#FFF',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--admin-border)',
                            background: '#FFF',
                            cursor: 'pointer',
                            color: 'var(--admin-brown)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                          }}
                        >
                          <Edit3 size={14} /> Cập nhật kho
                        </button>
                      )}
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
