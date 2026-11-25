'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Search, Filter, AlertCircle, MessageSquare } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminReviewsPage() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending
  const [ratingFilter, setRatingFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter === 'approved') params.append('is_approved', '1');
      if (statusFilter === 'pending') params.append('is_approved', '0');
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);

      const res = await fetch(`/api/v1/admin/reviews?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token, statusFilter, ratingFilter]);

  const handleToggleStatus = async (id: number, currentApproved: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ is_approved: !currentApproved }),
      });

      if (res.ok) {
        setActionMessage(`Đã ${!currentApproved ? 'duyệt' : 'ẩn'} đánh giá thành công!`);
        setTimeout(() => setActionMessage(null), 3000);
        fetchReviews();
      }
    } catch (err) {
      console.error('Error toggling review status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.')) return;

    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        setActionMessage('Đã xóa đánh giá thành công!');
        setTimeout(() => setActionMessage(null), 3000);
        fetchReviews();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown)', margin: '0 0 6px 0' }}>
            Quản Lý Đánh Giá Khách Hàng
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Kiểm duyệt và quản lý các phản hồi, xếp hạng sao từ người mua nông sản.
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

      {/* Filter Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9A8878' }} />
          <input
            type="text"
            placeholder="Tìm theo nội dung, tên khách, sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
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

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-brown)' }}>Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--admin-border)',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#FFF',
            }}
          >
            <option value="all">Tất cả</option>
            <option value="approved">Đã duyệt (Hiển thị)</option>
            <option value="pending">Chờ duyệt / Đã ẩn</option>
          </select>
        </div>

        {/* Star Rating Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-brown)' }}>Số sao:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--admin-border)',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#FFF',
            }}
          >
            <option value="all">Tất cả sao</option>
            <option value="5">5 Sao ★★★★★</option>
            <option value="4">4 Sao ★★★★☆</option>
            <option value="3">3 Sao ★★★☆☆</option>
            <option value="2">2 Sao ★★☆☆☆</option>
            <option value="1">1 Sao ★☆☆☆☆</option>
          </select>
        </div>

        <button
          onClick={fetchReviews}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--admin-primary)',
            color: '#FFF',
            fontWeight: 600,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Lọc
        </button>
      </div>

      {/* Reviews Table */}
      <div style={{
        background: '#FFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--admin-border)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF8F5', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>SẢN PHẨM</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>KHÁCH HÀNG</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>ĐÁNH GIÁ</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>NỘI DUNG NHẬN XÉT</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>NGÀY TẠO</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)' }}>TRẠNG THÁI</th>
              <th style={{ padding: '14px 20px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-brown)', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Đang tải danh sách đánh giá...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Không tìm thấy đánh giá nào phù hợp.
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--admin-brown)' }}>
                    {rev.product?.name || `ID #${rev.product_id}`}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{rev.user?.name || 'Khách'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{rev.user?.email || ''}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', color: '#F5A623', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= rev.rating ? '#F5A623' : '#E0E0E0'}
                          color={s <= rev.rating ? '#F5A623' : '#BDBDBD'}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.88rem', color: 'var(--admin-text)', maxWidth: '280px' }}>
                    {rev.comment}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: rev.is_approved ? '#E8F5E9' : '#FFF3E0',
                      color: rev.is_approved ? '#2E7D32' : '#E65100',
                    }}>
                      {rev.is_approved ? 'Đã duyệt' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleStatus(rev.id, rev.is_approved)}
                        title={rev.is_approved ? 'Ẩn đánh giá' : 'Duyệt hiển thị'}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--admin-border)',
                          background: '#FFF',
                          cursor: 'pointer',
                          color: rev.is_approved ? '#E65100' : '#2E7D32',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        {rev.is_approved ? <XCircle size={15} /> : <CheckCircle size={15} />}
                        {rev.is_approved ? 'Ẩn' : 'Duyệt'}
                      </button>

                      <button
                        onClick={() => handleDelete(rev.id)}
                        title="Xóa đánh giá"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #FFCDD2',
                          background: '#FFEBEE',
                          cursor: 'pointer',
                          color: '#C62828',
                        }}
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
    </div>
  );
}
