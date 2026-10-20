'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Search } from 'lucide-react';
import { fetchAdminApi } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

const TABS = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'all', label: 'Tất cả' },
];

export default function AdminReviewsPage() {
  const { user } = useAdminAuth();
  const can = (permission: string) => user?.permissions?.includes(permission) ?? false;

  const [reviews, setReviews] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ pending: 0, approved: 0 });
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1 });
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page: String(targetPage) });
      if (search) params.set('search', search);
      const res = await fetchAdminApi(`/admin/reviews?${params.toString()}`);
      setReviews(res?.data || []);
      setCounts(res?.counts || { pending: 0, approved: 0 });
      setMeta(res?.meta || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page, status]);

  const approve = async (review: any, isApproved: boolean) => {
    try {
      await fetchAdminApi(`/admin/reviews/${review.id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ is_approved: isApproved }),
      });
      await load(page);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật đánh giá');
    }
  };

  const remove = async (review: any) => {
    if (!confirm('Xóa đánh giá này? Khách hàng có thể đánh giá lại đơn hàng.')) return;
    try {
      await fetchAdminApi(`/admin/reviews/${review.id}`, { method: 'DELETE' });
      await load(page);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa đánh giá');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>Quản Lý Đánh Giá</h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Duyệt đánh giá trước khi hiển thị trên website
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatus(tab.key); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: status === tab.key ? 'var(--color-brown)' : '#FFF',
                color: status === tab.key ? '#FFF' : 'var(--admin-text-muted)',
                border: '1px solid var(--admin-border)',
              }}
            >
              {tab.label}
              {tab.key === 'pending' && counts.pending > 0 ? ` (${counts.pending})` : ''}
              {tab.key === 'approved' && counts.approved > 0 ? ` (${counts.approved})` : ''}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(1); }} style={{ display: 'flex', gap: '8px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nội dung, khách, sản phẩm..."
            style={{ padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--admin-border)', width: '240px', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '9px 13px' }}><Search size={16} /></button>
        </form>
      </div>

      {loading ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <div style={{ background: '#FFF', padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Không có đánh giá nào.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: '#FFF', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ color: 'var(--admin-brown-dark)' }}>{review.product?.name || 'Sản phẩm'}</strong>
                    <span className={`badge`} style={{
                      background: review.is_approved ? 'var(--color-green-light)' : '#FFF4E5',
                      color: review.is_approved ? 'var(--color-green)' : '#ED6C02',
                      fontSize: '0.7rem',
                    }}>
                      {review.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={15} fill={star <= review.rating ? '#F5A623' : 'none'} color={star <= review.rating ? '#F5A623' : '#CCC'} />
                    ))}
                    <span style={{ fontSize: '0.78rem', color: '#777' }}>
                      {review.customer?.name} · {review.order_code || '—'} · {review.created_at}
                    </span>
                  </div>
                </div>

                {can('reviews.manage') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!review.is_approved ? (
                      <button onClick={() => approve(review, true)} className="btn-primary" style={{ padding: '7px 12px', fontSize: '0.8rem', background: 'var(--color-green)' }}>
                        <CheckCircle2 size={15} /> Duyệt
                      </button>
                    ) : (
                      <button onClick={() => approve(review, false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', fontSize: '0.8rem', borderRadius: '6px', background: '#FFF4E5', color: '#ED6C02', fontWeight: 700 }}>
                        <XCircle size={15} /> Bỏ duyệt
                      </button>
                    )}
                    <button onClick={() => remove(review)} style={{ padding: '7px', color: '#E53935' }} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {review.title && <div style={{ fontWeight: 700, marginTop: '12px' }}>{review.title}</div>}
              <p style={{ color: '#555', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.6 }}>{review.content}</p>

              {review.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {review.images.map((image: string, index: number) => (
                    <a key={index} href={image} target="_blank" rel="noreferrer">
                      <img src={image} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline" style={{ padding: '7px 12px' }}>Trước</button>
              <span style={{ padding: '7px', fontSize: '0.85rem' }}>Trang {meta.current_page} / {meta.last_page}</span>
              <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="btn-outline" style={{ padding: '7px 12px' }}>Sau</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
