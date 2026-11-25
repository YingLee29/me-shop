'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

interface Review {
  id: number;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface ReviewStats {
  avg_rating: number;
  review_count: number;
  rating_breakdown: Record<number, number>;
}

export default function ProductReviews({ productId }: { productId: number }) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/products/${productId}/reviews`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.reviews?.data || []);
        setStats(json.stats || null);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá ít nhất 5 ký tự.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Cảm ơn bạn đã gửi đánh giá sản phẩm!' });
        setComment('');
        fetchReviews(); // Refresh review list and stats
      } else {
        setMessage({ type: 'error', text: data.message || 'Không thể gửi đánh giá. Vui lòng thử lại.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra kết nối. Vui lòng thử lại sau.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      background: '#FFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      padding: '36px',
      marginTop: '32px',
    }}>
      <div style={{
        borderBottom: '2px solid var(--color-cream)',
        paddingBottom: '16px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <MessageSquare size={22} color="var(--color-primary-dark)" />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brown)', margin: 0 }}>
          Đánh Giá & Nhận Xét Từ Khách Hàng
        </h3>
      </div>

      {/* ── Rating Summary Overview ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        background: 'var(--color-cream)',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '36px',
      }}>
        {/* Left: Big Score */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-brown-dark)', lineHeight: 1 }}>
            {stats?.avg_rating ? stats.avg_rating.toFixed(1) : '5.0'}
          </div>
          <div style={{ display: 'flex', color: '#F5A623', margin: '8px 0', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={star <= Math.round(stats?.avg_rating || 5) ? '#F5A623' : 'none'}
                color="#F5A623"
              />
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
            Dựa trên <strong>{stats?.review_count || reviews.length || 0}</strong> nhận xét thực tế
          </div>
        </div>

        {/* Right: Star Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = stats?.rating_breakdown?.[s] || 0;
            const total = stats?.review_count || (reviews.length || 1);
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <span style={{ width: '40px', fontWeight: 600, color: 'var(--color-brown)' }}>{s} ★</span>
                <div style={{ flex: 1, height: '8px', background: '#E2D9C8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: s >= 4 ? 'var(--color-primary-dark)' : s === 3 ? '#F5A623' : '#E57373',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ width: '36px', textAlign: 'right', color: 'var(--color-gray-mid)', fontSize: '0.78rem' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Review Form ── */}
      <div style={{
        background: '#FAF7F0',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        marginBottom: '36px',
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '16px' }}>
          Gửi Đánh Giá Của Bạn
        </h4>

        {user ? (
          <form onSubmit={handleSubmit}>
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                color: message.type === 'success' ? '#2E7D32' : '#C62828',
                border: `1px solid ${message.type === 'success' ? '#C8E6C9' : '#FFCDD2'}`,
              }}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Mức độ hài lòng của bạn:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= s ? '#F5A623' : '#E0E0E0'}
                      color={(hoverRating || rating) >= s ? '#F5A623' : '#BDBDBD'}
                    />
                  </button>
                ))}
                <span style={{ alignSelf: 'center', marginLeft: '12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  {rating === 5 && 'Tuyệt vời, nông sản rất tươi ngon!'}
                  {rating === 4 && 'Hài lòng, chất lượng tốt'}
                  {rating === 3 && 'Bình thường'}
                  {rating === 2 && 'Chưa thực sự ưng ý'}
                  {rating === 1 && 'Rất thất vọng'}
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Nhận xét chi tiết:
              </label>
              <textarea
                rows={3}
                placeholder="Chia sẻ cảm nhận về độ tươi ngon, cách đóng gói và thời gian giao hàng của nông sản..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--color-border)',
                  background: '#FFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.9rem',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Send size={16} /> {isSubmitting ? 'Đang gửi...' : 'Gửi Nhận Xét'}
            </button>
          </form>
        ) : (
          <div style={{
            padding: '18px',
            borderRadius: '8px',
            background: '#FFF',
            border: '1px dashed var(--color-primary)',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}>
            Vui lòng <Link href="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 700, textDecoration: 'underline' }}>Đăng nhập</Link> để viết nhận xét và đánh giá cho nông sản này.
          </div>
        )}
      </div>

      {/* ── Reviews List ── */}
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '20px' }}>
          Các Nhận Xét ({reviews.length})
        </h4>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-gray-mid)', fontSize: '0.9rem' }}>
            Đang tải nhận xét...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-gray-mid)', fontSize: '0.9rem' }}>
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm và chia sẻ!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FFF',
                  border: '1px solid var(--color-gray-light)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--color-cream)',
                      color: 'var(--color-brown-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: '1px solid var(--color-border)',
                    }}>
                      {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'K'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-brown-dark)' }}>
                        {rev.user?.name || 'Khách hàng'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', color: '#F5A623' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= rev.rating ? '#F5A623' : '#E0E0E0'}
                              color={s <= rev.rating ? '#F5A623' : '#BDBDBD'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <CheckCircle2 size={12} /> Đã mua hàng
                        </span>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)' }}>
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </span>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--color-gray-dark)', lineHeight: 1.6, margin: '8px 0 0 0' }}>
                  {rev.comment}
                </p>

                {rev.images && rev.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {rev.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Ảnh đánh giá"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
