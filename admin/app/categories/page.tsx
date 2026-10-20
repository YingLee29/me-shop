'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree, X } from 'lucide-react';
import { fetchAdminApi } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

const EMPTY = {
  parent_id: '',
  name: '',
  icon: '🌿',
  image: '',
  description: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminCategoriesPage() {
  const { user } = useAdminAuth();
  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminApi('/admin/categories');
      setCategories(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const roots = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const childrenOf = (id: number) => categories.filter((c) => c.parent_id === id);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowModal(true);
  };

  const openEdit = (category: any) => {
    setEditing(category);
    setForm({
      parent_id: category.parent_id ? String(category.parent_id) : '',
      name: category.name || '',
      icon: category.icon || '',
      image: category.image || '',
      description: category.description || '',
      sort_order: String(category.sort_order ?? 0),
      is_active: !!category.is_active,
    });
    setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        name: form.name,
        icon: form.icon,
        image: form.image || null,
        description: form.description || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      await fetchAdminApi(
        editing ? `/admin/categories/${editing.id}` : '/admin/categories',
        { method: 'POST', body: JSON.stringify(payload) },
      );

      setShowModal(false);
      setEditing(null);
      setForm({ ...EMPTY });
      await load();
    } catch (err: any) {
      alert(err.message || 'Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: any) => {
    if (!confirm(`Xóa danh mục "${category.name}"?`)) return;
    try {
      await fetchAdminApi(`/admin/categories/${category.id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa danh mục');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px',
  };

  const renderRow = (category: any, depth = 0) => (
    <React.Fragment key={category.id}>
      <tr>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: depth * 22 }}>
            <span style={{ fontSize: '1.15rem' }}>{category.icon || '🌿'}</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--admin-brown-dark)' }}>{category.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#999' }}>/{category.slug}</div>
            </div>
          </div>
        </td>
        <td>{category.parent?.name || '—'}</td>
        <td>{category.products_count ?? 0}</td>
        <td>{category.sort_order}</td>
        <td>
          <span className="badge" style={{
            background: category.is_active ? 'var(--color-green-light)' : 'var(--color-red-light)',
            color: category.is_active ? 'var(--color-green)' : 'var(--color-red)',
          }}>
            {category.is_active ? 'Hiển thị' : 'Đã ẩn'}
          </span>
        </td>
        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {can('categories.manage') && (
            <>
              <button onClick={() => openEdit(category)} style={{ color: '#1976D2', padding: '6px' }} title="Sửa">
                <Pencil size={16} />
              </button>
              <button onClick={() => remove(category)} style={{ color: '#E53935', padding: '6px' }} title="Xóa">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </td>
      </tr>
      {childrenOf(category.id).map((child) => renderRow(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>Quản Lý Danh Mục</h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Tổ chức danh mục nông sản nhiều cấp
          </p>
        </div>
        {can('categories.manage') && (
          <button onClick={openCreate} className="btn-primary" style={{ background: 'var(--color-green)' }}>
            <Plus size={18} /> Thêm Danh Mục
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Đang tải danh mục...</div>
      ) : roots.length === 0 ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <FolderTree size={42} style={{ margin: '0 auto 10px', color: 'var(--color-primary)' }} />
          Chưa có danh mục nào.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Danh mục cha</th>
                <th>Sản phẩm</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>{roots.map((c) => renderRow(c))}</tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editing ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Tên danh mục <span style={{ color: 'red' }}>*</span></label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Danh mục cha</label>
                  <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} style={inputStyle}>
                    <option value="">— Danh mục gốc —</option>
                    {categories.filter((c) => c.id !== editing?.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Icon (emoji)</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={inputStyle} placeholder="🥬" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Ảnh danh mục (URL)</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>

              <div>
                <label style={labelStyle}>Mô tả</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label style={labelStyle}>Thứ tự hiển thị</label>
                  <input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} style={inputStyle} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  Hiển thị trên website
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #CCC', borderRadius: '6px' }}>Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
                  {saving ? 'Đang lưu...' : 'Lưu Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
