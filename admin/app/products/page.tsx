'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Trash2, Edit3, CheckSquare, Square } from 'lucide-react';
import { fetchAdminApi, formatPrice } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

const MAX_PRODUCT_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EMPTY_FORM = {
  name: '',
  category_id: '',
  sku: '',
  price: '',
  sale_price: '',
  stock_quantity: '100',
  unit: 'kg',
  origin: 'Đà Lạt, Lâm Đồng',
  short_description: '',
  description: '',
  is_active: true,
  is_featured: false,
};

type ProductForm = typeof EMPTY_FORM;

function PendingImageTile({
  file,
  isPrimary,
  onRemove,
}: {
  file: File;
  isPrimary: boolean;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div
      style={{
        width: '92px',
        padding: '5px',
        borderRadius: '8px',
        border: isPrimary ? '2px solid var(--color-green)' : '1px solid var(--admin-border)',
        background: '#FFF',
      }}
    >
      <div style={{ position: 'relative' }}>
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '5px', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '72px', borderRadius: '5px', background: 'var(--admin-bg)' }} />
        )}
        <button
          type="button"
          onClick={onRemove}
          title="Bỏ ảnh này"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#D32F2F',
            color: '#FFF',
            fontSize: '12px',
            lineHeight: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        >
          ×
        </button>
      </div>
      <div
        title={file.name}
        style={{
          marginTop: '5px',
          fontSize: '0.62rem',
          color: '#666',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {file.name}
      </div>
      <div
        style={{
          marginTop: '3px',
          fontSize: '0.68rem',
          fontWeight: 800,
          color: isPrimary ? 'var(--color-green)' : '#777',
          textAlign: 'center',
        }}
      >
        {isPrimary ? '★ Ảnh chính' : 'Ảnh phụ'}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const { user } = useAdminAuth();
  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProductForm>({ ...EMPTY_FORM });

  const flatCategories = useMemo(() => {
    const rows: any[] = [];
    const walk = (items: any[], depth = 0) => {
      items.forEach((item) => {
        rows.push({ ...item, depth });
        if (item.children?.length) walk(item.children, depth + 1);
      });
    };
    walk(categories);
    return rows;
  }, [categories]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchAdminApi(`/admin/products?search=${encodeURIComponent(searchTerm)}`),
        fetchAdminApi('/categories'),
      ]);

      if (productsRes?.data) setProducts(productsRes.data);
      if (categoriesRes?.data) setCategories(categoriesRes.data);
      setSelected([]);
    } catch (e) {
      console.error('Failed to load products/categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...EMPTY_FORM });
    setImageFiles([]);
    setImageLoading(false);
    setShowModal(true);
  };

  const openEdit = async (product: any) => {
    setEditing(product);
    setImageFiles([]);
    setImageLoading(true);
    setFormData({
      name: product.name || '',
      category_id: String(product.category?.id || product.category_id || ''),
      sku: product.sku || '',
      price: String(product.price ?? ''),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      stock_quantity: String(product.stock_quantity ?? 0),
      unit: product.unit || 'kg',
      origin: product.origin || '',
      short_description: product.short_description || '',
      description: product.description || '',
      is_active: !!product.is_active,
      is_featured: !!product.is_featured,
    });
    setShowModal(true);

    try {
      const res = await fetchAdminApi(`/admin/products/${product.id}`);
      if (res?.data) {
        const detail = res.data;
        setEditing({ ...product, ...detail });
        setFormData({
          name: detail.name || '',
          category_id: String(detail.category?.id || ''),
          sku: detail.sku || '',
          price: String(detail.price ?? ''),
          sale_price: detail.sale_price ? String(detail.sale_price) : '',
          stock_quantity: String(detail.stock_quantity ?? 0),
          unit: detail.unit || 'kg',
          origin: detail.origin || '',
          short_description: detail.short_description || '',
          description: detail.description || '',
          is_active: !!detail.is_active,
          is_featured: !!detail.is_featured,
        });
      }
    } catch {
      // Dùng dữ liệu từ danh sách nếu không tải được chi tiết
    } finally {
      setImageLoading(false);
    }
  };

  const handleAddImages = (files: FileList | null) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    const existingCount = (editing?.images?.length || 0) + imageFiles.length;
    const remaining = MAX_PRODUCT_IMAGES - existingCount;

    if (remaining <= 0) {
      alert(`Mỗi sản phẩm chỉ được tối đa ${MAX_PRODUCT_IMAGES} ảnh.`);
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert(`Ảnh "${file.name}" không đúng định dạng JPG/PNG/WebP.`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`Ảnh "${file.name}" vượt quá 5MB.`);
        return false;
      }
      return true;
    });

    const acceptedFiles = validFiles.slice(0, remaining);

    if (acceptedFiles.length < selectedFiles.length) {
      alert(`Chỉ thêm được ${acceptedFiles.length}/${selectedFiles.length} ảnh đã chọn (tối đa ${MAX_PRODUCT_IMAGES} ảnh/sản phẩm).`);
    }

    if (acceptedFiles.length > 0) {
      setImageFiles((current) => [...current, ...acceptedFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('category_id', formData.category_id);
      body.append('sku', formData.sku);
      body.append('price', formData.price);
      if (formData.sale_price) body.append('sale_price', formData.sale_price);
      body.append('stock_quantity', formData.stock_quantity);
      body.append('unit', formData.unit);
      body.append('origin', formData.origin);
      body.append('short_description', formData.short_description);
      body.append('description', formData.description);
      body.append('is_active', formData.is_active ? '1' : '0');
      body.append('is_featured', formData.is_featured ? '1' : '0');
      imageFiles.forEach((file) => body.append('images[]', file));

      await fetchAdminApi(
        editing ? `/admin/products/${editing.id}` : '/admin/products',
        { method: 'POST', body },
      );

      setShowModal(false);
      setEditing(null);
      setImageFiles([]);
      setFormData({ ...EMPTY_FORM });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu sản phẩm');
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

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Xóa ${selected.length} sản phẩm đã chọn?`)) return;

    try {
      await fetchAdminApi('/admin/products/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selected }),
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const applyUpdatedProduct = (detail: any) => {
    setEditing(detail);
    setProducts((current) =>
      current.map((item) =>
        item.id === detail.id
          ? { ...item, primary_image: detail.primary_image, images: detail.images }
          : item,
      ),
    );
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!editing) return;
    try {
      const res = await fetchAdminApi(`/admin/products/${editing.id}/images/${imageId}/primary`, {
        method: 'POST',
      });
      if (res?.data) applyUpdatedProduct(res.data);
    } catch (err: any) {
      alert(err.message || 'Không thể đặt ảnh chính');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editing) return;
    if (!confirm('Xóa ảnh này khỏi sản phẩm?')) return;
    try {
      const res = await fetchAdminApi(`/admin/products/${editing.id}/images/${imageId}`, {
        method: 'DELETE',
      });
      if (res?.data) applyUpdatedProduct(res.data);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa ảnh');
    }
  };

  const toggleSelected = (id: number) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleAll = () => {
    setSelected(selected.length === products.length ? [] : products.map((p) => p.id));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--admin-border)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    marginBottom: '6px',
  };

  const existingImages = editing?.images || [];
  const hasExistingPrimary = existingImages.some((img: any) => img.is_primary);
  const totalSelectedImages = existingImages.length + imageFiles.length;
  const remainingImageSlots = Math.max(0, MAX_PRODUCT_IMAGES - totalSelectedImages);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            Quản Lý Sản Phẩm
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Thêm, sửa, xóa và cập nhật hình ảnh nông sản
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <form onSubmit={(e) => { e.preventDefault(); loadData(); }} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Tìm tên sản phẩm, mã SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--admin-border)', fontSize: '0.88rem', width: '220px' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '9px 14px' }}>
              <Search size={16} />
            </button>
          </form>

          {can('products.delete') && selected.length > 0 && (
            <button onClick={handleBulkDelete} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: 'var(--radius-sm)', background: '#FFEBEE', color: '#D32F2F', fontWeight: 700 }}>
              <Trash2 size={16} /> Xóa {selected.length} sản phẩm
            </button>
          )}

          {can('products.create') && (
            <button onClick={openCreate} className="btn-primary" style={{ background: 'var(--color-green)' }}>
              <Plus size={18} /> Thêm Sản Phẩm Mới
            </button>
          )}
        </div>
      </div>

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
                <th style={{ width: '46px' }}>
                  <button onClick={toggleAll} title="Chọn tất cả" style={{ display: 'inline-flex' }}>
                    {selected.length === products.length ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th style={{ width: '60px' }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>SKU</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button onClick={() => toggleSelected(p.id)} style={{ display: 'inline-flex' }}>
                      {selected.includes(p.id) ? <CheckSquare size={18} color="var(--color-green)" /> : <Square size={18} />}
                    </button>
                  </td>
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
                  <td>
                    <span className="badge" style={{
                      background: p.is_active ? 'var(--color-green-light)' : 'var(--color-red-light)',
                      color: p.is_active ? 'var(--color-green)' : 'var(--color-red)',
                    }}>
                      {p.is_active ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {can('products.update') && (
                      <button onClick={() => openEdit(p)} style={{ color: '#1976D2', padding: '6px' }} title="Sửa sản phẩm">
                        <Edit3 size={16} />
                      </button>
                    )}
                    {can('products.delete') && (
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#E53935', padding: '6px' }} title="Xóa sản phẩm">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
                {editing ? 'Chỉnh Sửa Nông Sản' : 'Thêm Nông Sản Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '1.4rem', color: '#999' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Tên sản phẩm <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Danh mục <span style={{ color: 'red' }}>*</span></label>
                  <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} style={inputStyle}>
                    <option value="">-- Chọn danh mục --</option>
                    {flatCategories.map((c: any) => (
                      <option key={c.id} value={c.id}>{'— '.repeat(c.depth)}{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Mã SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Giá bán (VNĐ) <span style={{ color: 'red' }}>*</span></label>
                  <input type="number" min={0} required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Giá khuyến mãi (VNĐ)</label>
                  <input type="number" min={0} value={formData.sale_price} onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Tồn kho <span style={{ color: 'red' }}>*</span></label>
                  <input type="number" min={0} required value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Đơn vị</label>
                  <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Xuất xứ</label>
                  <input type="text" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mô tả ngắn</label>
                <textarea rows={2} value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Mô tả chi tiết</label>
                <textarea rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Hình ảnh sản phẩm</label>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: totalSelectedImages >= MAX_PRODUCT_IMAGES ? '#D32F2F' : '#777' }}>
                    {totalSelectedImages}/{MAX_PRODUCT_IMAGES} ảnh
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#777', marginTop: '6px' }}>
                  JPG/PNG/WebP, tối đa 5MB/ảnh. Mỗi sản phẩm tối đa 6 ảnh: 1 ảnh chính + 5 ảnh phụ.
                  Ảnh đầu tiên của sản phẩm mới sẽ làm ảnh chính; có thể đổi ảnh chính sau khi lưu.
                </p>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    handleAddImages(e.target.files);
                    e.target.value = '';
                  }}
                  style={{ display: 'none' }}
                />

                {imageLoading ? (
                  <p style={{ fontSize: '0.78rem', color: '#777', marginTop: '12px' }}>Đang tải ảnh hiện tại...</p>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px', alignItems: 'flex-start' }}>
                    {existingImages.map((img: any) => (
                      <div
                        key={img.id}
                        style={{
                          width: '92px',
                          padding: '5px',
                          borderRadius: '8px',
                          border: img.is_primary ? '2px solid var(--color-green)' : '1px solid var(--admin-border)',
                          background: '#FFF',
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <img
                            src={img.url}
                            alt=""
                            style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '5px', display: 'block' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            title="Xóa ảnh"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#D32F2F',
                              color: '#FFF',
                              fontSize: '12px',
                              lineHeight: '20px',
                              textAlign: 'center',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                            }}
                          >
                            ×
                          </button>
                        </div>
                        {img.is_primary ? (
                          <div style={{ marginTop: '5px', fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-green)', textAlign: 'center' }}>
                            ★ Ảnh chính
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.id)}
                            style={{
                              width: '100%',
                              marginTop: '5px',
                              padding: '4px 3px',
                              borderRadius: '4px',
                              background: 'var(--admin-bg)',
                              color: 'var(--admin-brown-dark)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                            }}
                          >
                            Đặt làm ảnh chính
                          </button>
                        )}
                      </div>
                    ))}

                    {imageFiles.map((file, index) => (
                      <PendingImageTile
                        key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                        file={file}
                        isPrimary={!hasExistingPrimary && index === 0}
                        onRemove={() => setImageFiles((current) => current.filter((_, i) => i !== index))}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={remainingImageSlots <= 0}
                      title={remainingImageSlots > 0 ? 'Thêm ảnh cho sản phẩm' : 'Đã đủ 6 ảnh'}
                      style={{
                        width: '92px',
                        minHeight: '112px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: remainingImageSlots > 0 ? '2px dashed var(--color-green)' : '2px dashed #CCC',
                        background: remainingImageSlots > 0 ? '#FAFBF7' : '#F5F5F5',
                        color: remainingImageSlots > 0 ? 'var(--color-green)' : '#999',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        cursor: remainingImageSlots > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Plus size={22} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>Thêm ảnh</span>
                      <span style={{ fontSize: '0.62rem', color: '#777' }}>
                        {remainingImageSlots > 0 ? `Còn ${remainingImageSlots} ô` : 'Đã đủ ảnh'}
                      </span>
                    </button>
                  </div>
                )}

                {imageFiles.length > 0 && (
                  <p style={{ fontSize: '0.72rem', color: '#777', marginTop: '8px' }}>
                    Ảnh mới sẽ được tải lên khi bấm Lưu. Bấm × trên ảnh để bỏ chọn.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '6px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  Đang hoạt động
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                  Sản phẩm nổi bật
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #CCC' }}>
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2, padding: '12px', justifyContent: 'center' }}>
                  {saving ? 'Đang lưu...' : editing ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
