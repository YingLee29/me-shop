'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, Eye, Calendar, BookOpen, X } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface Blog {
  id: number;
  title: string;
  slug: string;
  category_id?: number;
  summary: string;
  content: string;
  thumbnail: string;
  is_published: boolean;
  views_count: number;
  published_at: string;
  category?: {
    id: number;
    name: string;
  };
  author?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function AdminBlogsPage() {
  const { token } = useAdminAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/blogs?search=${encodeURIComponent(search.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        const json = await res.json();
        setBlogs(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/blog-categories');
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching blog categories:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBlogs();
      fetchCategories();
    }
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingBlog(null);
    setTitle('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setSummary('');
    setContent('');
    setThumbnail('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
    setIsPublished(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setCategoryId(blog.category_id || (categories[0]?.id || ''));
    setSummary(blog.summary || '');
    setContent(blog.content || '');
    setThumbnail(blog.thumbnail || '');
    setIsPublished(blog.is_published);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng điền tiêu đề và nội dung bài viết.');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingBlog
        ? `/api/v1/admin/blogs/${editingBlog.id}`
        : '/api/v1/admin/blogs';
      const method = editingBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          category_id: categoryId ? Number(categoryId) : null,
          summary: summary.trim(),
          content: content.trim(),
          thumbnail: thumbnail.trim(),
          is_published: isPublished,
        }),
      });

      if (res.ok) {
        setActionMessage(editingBlog ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết mới thành công!');
        setTimeout(() => setActionMessage(null), 3000);
        setModalOpen(false);
        fetchBlogs();
      } else {
        const data = await res.json();
        alert(data.message || 'Có lỗi xảy ra khi lưu bài viết.');
      }
    } catch (err) {
      console.error('Error saving blog:', err);
      alert('Lỗi mạng khi lưu bài viết.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này không?')) return;
    try {
      const res = await fetch(`/api/v1/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        setActionMessage('Đã xóa bài viết thành công!');
        setTimeout(() => setActionMessage(null), 3000);
        fetchBlogs();
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown)', margin: '0 0 6px 0' }}>
            Quản Lý Tin Tức & Cẩm Nang
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Đăng tải và quản lý các bài viết chia sẻ kinh nghiệm nông sản, cẩm nang dinh dưỡng sạch.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--admin-primary)',
            color: '#FFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(200, 164, 90, 0.3)',
          }}
        >
          <Plus size={18} /> Viết Bài Mới
        </button>
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

      {/* Filter Bar */}
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
            placeholder="Tìm theo tiêu đề bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBlogs()}
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
          onClick={fetchBlogs}
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

      {/* Blogs Table */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF8F5', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>BÀI VIẾT</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>CHUYÊN MỤC</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>TÁC GIẢ</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>LƯỢT XEM</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>TRẠNG THÁI</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Đang tải danh sách bài viết...
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Chưa có bài viết nào. Hãy bấm &quot;Viết Bài Mới&quot; để tạo bài viết đầu tiên.
                </td>
              </tr>
            ) : (
              blogs.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={b.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80'}
                        alt=""
                        style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                      />
                      <div style={{ maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-brown)' }}>
                          {b.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                          {b.published_at ? new Date(b.published_at).toLocaleDateString('vi-VN') : 'Bản nháp'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(200, 164, 90, 0.2)',
                      color: 'var(--admin-brown)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}>
                      {b.category?.name || 'Chung'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                    {b.author?.name || 'Admin'}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} /> {b.views_count || 0}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: b.is_published ? '#E8F5E9' : '#FFF3E0',
                      color: b.is_published ? '#2E7D32' : '#E65100',
                    }}>
                      {b.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--admin-border)',
                          background: '#FFF',
                          cursor: 'pointer',
                          color: 'var(--admin-brown)',
                        }}
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #FFCDD2',
                          background: '#FFEBEE',
                          cursor: 'pointer',
                          color: '#C62828',
                        }}
                        title="Xóa bài viết"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-brown)', margin: 0 }}>
                {editingBlog ? 'Chỉnh Sửa Bài Viết' : 'Soạn Bài Viết Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Cách nhận biết rau củ quả chuẩn hữu cơ và VietGAP..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                    Chuyên mục
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--admin-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#FFF',
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                    URL Ảnh Đại Diện (Thumbnail)
                  </label>
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--admin-border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                  Tóm tắt ngắn gọn
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung chính để hiển thị ngoài danh sách bài viết..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
                  Nội dung chi tiết bài viết (HTML / Text) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nội dung bài viết... Bạn có thể dùng các thẻ HTML như <p>, <h3>, <ul>, <li>..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="is_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="is_published" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-brown)', cursor: 'pointer' }}>
                  Xuất bản ngay (Hiển thị công khai trên website)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    background: '#FFF',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--admin-primary)',
                    color: '#FFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Đang lưu...' : editingBlog ? 'Cập Nhật Bài Viết' : 'Đăng Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
