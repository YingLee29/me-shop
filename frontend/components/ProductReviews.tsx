'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Upload, CheckCircle2, ChevronDown } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Review {
  id: number;
  rating: number;
  title?: string;
  content: string;
  images: string[];
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

interface Summary {
  avg_rating: number;
  review_count: number;
  counts: Record<string, number>;
}

interface EligibleItem {
  order_item_id: number;
  order_code: string;
  variant_name?: string;
  quantity: number;
  created_at: string;
}

export default function ProductReviews({ slug }: { slug: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>({ avg_rating: 0, review_count: 0, counts: {} });
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState<EligibleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [orderItemId, setOrderItemId] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadReviews = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await fetchApi(`/products/${slug}/reviews?page=${targetPage}&per_page=5`);
      if (targetPage === 1) setReviews(res?.data || []);
      else setReviews((current) => [...current, ...(res?.data || [])]);
      setSummary(res?.summary || { avg_rating: 0, review_count: 0, counts: {} });
      setMeta(res?.meta || {});
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1);
  }, [slug]);

  useEffect(() => {
    if (!user) {
      setEligible([]);
      return;
    }

    fetchApi(`/products/${slug}/review-eligibility`)
      .then((res) => {
        const items = res?.data || [];
        setEligible(items);
        if (items.length > 0) setOrderItemId(String(items[0].order_item_id));
      })
      .catch(() => setEligible([]));
  }, [user, slug]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!orderItemId) {
      setError('Vui lòng chọn đơn hàng cần đánh giá.');
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('order_item_id', orderItemId);
      body.append('rating', String(rating));
      if (title) body.append('title', title);
      body.append('content', content);
      files.forEach((file) => body.append('images[]', file));

      const res = await fetchApi(`/products/${slug}/reviews`, { method: 'POST', body });
      setMessage(res?.message || 'Cảm ơn bạn! Đánh giá đang chờ duyệt.');
      setShowForm(false);
      setContent('');
      setTitle('');
      setRating(5);
      setFiles([]);
      setEligible((current) => current.filter((item) => String(item.order_item_id) !== orderItemId));
    } catch (err: any) {
      setError(err.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const stars = (value: number, size = 16) =>
    [1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill={star <= value ? '#F5A623' : 'none'} color={star <= value ? '#F5A623' : '#D9D9D9'} />
    ));

  return (
    <section id="reviews" style={{ background: '#FFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: '32px', marginTop: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-brown)' }}>Đánh Giá Từ Khách Hàng</h2>
        {!authLoading && user && eligible.length > 0 && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
            Viết đánh giá
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 2fr', gap: '28px', alignItems: 'center', padding: '20px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-brown-dark)', lineHeight: 1 }}>
            {Number(summary.avg_rating || 0).toFixed(1)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '8px 0' }}>{stars(Math.round(summary.avg_rating || 0), 18)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>{summary.review_count || 0} đánh giá</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = Number(summary.counts?.[String(star)] ?? summary.counts?.[star] ?? 0);
            const percent = summary.review_count > 0 ? (count / summary.review_count) * 100 : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <span style={{ width: 16 }}>{star}</span>
                <Star size={12} fill="#F5A623" color="#F5A623" />
                <div style={{ flex: 1, height: 8, background: '#E8E0D4', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: '#F5A623' }} />
                </div>
                <span style={{ width: 26, textAlign: 'right', color: 'var(--color-gray-mid)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#E8F5E9', color: '#2E7D32', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.88rem' }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {showForm && eligible.length > 0 && (
        <form onSubmit={submit} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 800 }}>Chia sẻ cảm nhận của bạn</h3>

          {eligible.length > 1 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '5px' }}>Chọn đơn hàng</label>
              <select value={orderItemId} onChange={(e) => setOrderItemId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                {eligible.map((item) => (
                  <option key={item.order_item_id} value={item.order_item_id}>
                    {item.order_code} {item.variant_name ? `· ${item.variant_name}` : ''} · SL {item.quantity}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '5px' }}>Chấm điểm</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} sao`}>
                  <Star size={26} fill={star <= rating ? '#F5A623' : 'none'} color={star <= rating ? '#F5A623' : '#CFCFCF'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '5px' }}>Tiêu đề</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} placeholder="VD: Rau rất tươi và ngọt" style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '5px' }}>Nội dung <span style={{ color: 'red' }}>*</span></label>
            <textarea required minLength={10} maxLength={2000} rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Cảm nhận về chất lượng, độ tươi, đóng gói..." style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px' }} />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
              <Upload size={16} /> Thêm ảnh (tối đa 5)
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} style={{ display: 'none' }} />
            </label>
            {files.length > 0 && <div style={{ fontSize: '0.76rem', color: 'var(--color-gray-mid)', marginTop: '5px' }}>{files.map((file) => file.name).join(', ')}</div>}
          </div>

          {error && <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '9px 12px', borderRadius: '6px', fontSize: '0.83rem' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Hủy</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      )}

      {!authLoading && !user && (
        <div style={{ background: 'var(--color-cream)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.86rem', color: 'var(--color-gray-dark)' }}>
          <Link href={`/login?redirect=/products/${slug}`} style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>Đăng nhập</Link> để đánh giá sản phẩm sau khi mua hàng.
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-gray-mid)', padding: '24px' }}>Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-gray-mid)', padding: '24px' }}>Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ borderBottom: '1px solid var(--color-gray-light)', paddingBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-brown)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {review.user_name?.charAt(0)?.toUpperCase() || 'K'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{review.user_name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--color-gray-mid)' }}>{review.created_at} · Đã mua hàng</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>{stars(review.rating, 14)}</div>
              {review.title && <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '3px' }}>{review.title}</div>}
              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--color-gray-dark)' }}>{review.content}</p>
              {review.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {review.images.map((image, index) => (
                    <a key={index} href={image} target="_blank" rel="noreferrer">
                      <Image src={image} alt="Ảnh đánh giá" width={72} height={72} style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {meta.current_page < meta.last_page && (
            <button onClick={loadMore} className="btn-outline" style={{ alignSelf: 'center', padding: '9px 18px' }}>
              Xem thêm đánh giá <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
