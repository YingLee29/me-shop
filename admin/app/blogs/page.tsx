'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, FolderPlus } from 'lucide-react';
import { fetchAdminApi } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import RichTextEditor from '../../components/RichTextEditor';

const EMPTY = {
  blog_category_id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  thumbnail: '',
  is_published: false,
  published_at: '',
  meta_title: '',
  meta_description: '',
};

export default function AdminBlogsPage() {
  const { user } = useAdminAuth();
  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(targetPage) });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await fetchAdminApi(`/admin/blogs?${params.toString()}`);
      setBlogs(res?.data || []);
      setMeta(res?.meta || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchAdminApi('/admin/blog-categories');
      setCategories(res?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(page); }, [page, status]);
  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowModal(true);
  };

  const openEdit = async (blog: any) => {
    setEditing(blog);
    setForm({
      blog_category_id: blog.blog_category_id ? String(blog.blog_category_id) : '',
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      thumbnail: blog.thumbnail || '',
      is_published: !!blog.is_published,
      published_at: blog.published_at ? String(blog.published_at).slice(0, 16) : '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
    });
    setShowModal(true);

    try {
      const res = await fetchAdminApi(`/admin/blogs/${blog.id}`);
      if (res?.data) {
        const detail = res.data;
        setForm({
          blog_category_id: detail.blog_category_id ? String(detail.blog_category_id) : '',
          title: detail.title || '',
          slug: detail.slug || '',
          excerpt: detail.excerpt || '',
          content: detail.content || '',
          thumbnail: detail.thumbnail || '',
          is_published: !!detail.is_published,
          published_at: detail.published_at ? String(detail.published_at).slice(0, 16) : '',
          meta_title: detail.meta_title || '',
          meta_description: detail.meta_description || '',
        });
      }
    } catch {
      // fallback to row data
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        blog_category_id: form.blog_category_id ? Number(form.blog_category_id) : null,
        published_at: form.is_published ? (form.published_at || new Date().toISOString().slice(0, 19).replace('T', ' ')) : null,
      };

      await fetchAdminApi(editing ? `/admin/blogs/${editing.id}` : '/admin/blogs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setShowModal(false);
      setEditing(null);
      setForm({ ...EMPTY });
      await load();
    } catch (err: any) {
      alert(err.message || 'Không thể lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (blog: any) => {
    if (!confirm(`Xóa bài viết "${blog.title}"?`)) return;
    try {
      await fetchAdminApi(`/admin/blogs/${blog.id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa bài viết');
    }
  };

  const togglePublish = async (blog: any) => {
    try {
      await fetchAdminApi(`/admin/blogs/${blog.id}`, {
        method: 'POST',
        body: JSON.stringify({
          ...blog,
          is_published: !blog.is_published,
          published_at: !blog.is_published ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
          blog_category_id: blog.blog_category_id,
        }),
      });
      await load();
    } catch (err: any) {
      alert(err.message || 'Không thể đổi trạng thái');
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await fetchAdminApi('/admin/blog-categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategory.trim(), is_active: true }),
      });
      setNewCategory('');
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Không thể tạo danh mục');
    }
  };

  const removeCategory = async (category: any) => {
    if (!confirm(`Xóa danh mục "${category.name}"?`)) return;
    try {
      await fetchAdminApi(`/admin/blog-categories/${category.id}`, { method: 'DELETE' });
      await loadCategories();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa danh mục');
    }
  };

  const input: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)' };
  const label: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '5px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>Quản Lý Bài Viết</h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>Tin tức, mẹo nấu ăn và kiến thức nông sản</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {can('blogs.manage') && (
            <button onClick={() => setShowCategoryModal(true)} className="btn-outline" style={{ padding: '9px 14px' }}>
              <FolderPlus size={16} /> Danh mục
            </button>
          )}
          {can('blogs.manage') && (
            <button onClick={openCreate} className="btn-primary" style={{ background: 'var(--color-green)' }}>
              <Plus size={18} /> Viết Bài Mới
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(1); }} style={{ display: 'flex', gap: '8px' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tiêu đề..." style={{ ...input, width: '240px' }} />
          <button className="btn-primary" style={{ padding: '9px 13px' }}><Search size={16} /></button>
        </form>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ ...input, width: '170px' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {loading ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Đang tải bài viết...</div>
      ) : blogs.length === 0 ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Chưa có bài viết nào.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    {blog.thumbnail
                      ? <img src={blog.thumbnail} alt="" style={{ width: 64, height: 42, objectFit: 'cover', borderRadius: 6 }} />
                      : <div style={{ width: 64, height: 42, borderRadius: 6, background: '#F2EDE4' }} />}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--admin-brown-dark)', maxWidth: 320 }}>{blog.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#999' }}>/{blog.slug}</div>
                  </td>
                  <td>{blog.category?.name || '—'}</td>
                  <td>{blog.author?.name || '—'}</td>
                  <td>{blog.view_count || 0}</td>
                  <td>
                    <span className="badge" style={{ background: blog.is_published ? 'var(--color-green-light)' : '#FFF4E5', color: blog.is_published ? 'var(--color-green)' : '#ED6C02' }}>
                      {blog.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {can('blogs.manage') && (
                      <>
                        <button onClick={() => togglePublish(blog)} title={blog.is_published ? 'Ẩn bài' : 'Xuất bản'} style={{ color: blog.is_published ? '#ED6C02' : 'var(--color-green)', padding: '6px' }}>
                          {blog.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => openEdit(blog)} style={{ color: '#1976D2', padding: '6px' }} title="Sửa"><Pencil size={16} /></button>
                        <button onClick={() => remove(blog)} style={{ color: '#E53935', padding: '6px' }} title="Xóa"><Trash2 size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', maxWidth: '820px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{editing ? 'Sửa Bài Viết' : 'Viết Bài Mới'}</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '1.3rem' }}>✕</button>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={label}>Tiêu đề <span style={{ color: 'red' }}>*</span></label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={input} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={label}>Danh mục</label>
                  <select value={form.blog_category_id} onChange={(e) => setForm({ ...form, blog_category_id: e.target.value })} style={input}>
                    <option value="">— Chưa phân loại —</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Đường dẫn (slug)</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Tự động nếu để trống" style={input} />
                </div>
              </div>

              <div>
                <label style={label}>Ảnh đại diện (URL)</label>
                <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." style={input} />
              </div>

              <div>
                <label style={label}>Mô tả ngắn</label>
                <textarea rows={2} maxLength={500} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} style={input} />
              </div>

              <div>
                <label style={label}>Nội dung bài viết <span style={{ color: 'red' }}>*</span></label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
                />
                <p style={{ fontSize: '0.72rem', color: '#888', marginTop: '4px' }}>
                  Sử dụng thanh công cụ để định dạng. Nội dung lưu dưới dạng HTML và hiển thị trên trang tin tức.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={label}>Meta title</label>
                  <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} style={input} />
                </div>
                <div>
                  <label style={label}>Meta description</label>
                  <input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} style={input} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '22px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                  Xuất bản ngay
                </label>
                {form.is_published && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <span>Ngày đăng:</span>
                    <input type="datetime-local" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} style={{ padding: '7px', border: '1px solid var(--admin-border)', borderRadius: 5 }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #CCC', borderRadius: 6 }}>Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
                  {saving ? 'Đang lưu...' : 'Lưu Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontWeight: 800 }}>Danh Mục Bài Viết</h3>
              <button onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>

            <form onSubmit={createCategory} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Tên danh mục mới" style={input} />
              <button className="btn-primary" style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>Thêm</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((category) => (
                <div key={category.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--admin-bg)', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{category.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#999' }}>{category.blogs_count || 0} bài viết</div>
                  </div>
                  <button onClick={() => removeCategory(category)} style={{ color: '#E53935' }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
