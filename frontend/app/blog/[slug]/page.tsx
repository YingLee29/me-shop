import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Eye, User, ArrowLeft, Share2, BookOpen, Clock, Tag } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

async function getBlogDetail(slug: string) {
  try {
    const res = await fetchApi(`/blogs/${slug}`);
    return res || null;
  } catch (err) {
    console.error('Error fetching blog detail:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await getBlogDetail(params.slug);
  const blog = res?.data;
  if (!blog) {
    return { title: 'Bài viết không tồn tại' };
  }
  return {
    title: `${blog.title} | Cẩm Nang Nông Sản Sạch`,
    description: blog.summary || blog.title,
    openGraph: {
      title: blog.title,
      description: blog.summary,
      images: [blog.thumbnail || ''],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await getBlogDetail(params.slug);
  const blog = result?.data;
  const related = result?.related || [];

  if (!blog) {
    notFound();
  }

  return (
    <div style={{ padding: '40px 0 80px', background: '#FAF7F0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Breadcrumb & Back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--color-primary-dark)',
            }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách bài viết
          </Link>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-mid)' }}>
            <Link href="/" style={{ color: 'var(--color-brown)' }}>Trang chủ</Link> /{' '}
            <Link href="/blog" style={{ color: 'var(--color-brown)' }}>Cẩm nang</Link> /{' '}
            <span>{blog.category?.name || 'Bài viết'}</span>
          </div>
        </div>

        {/* Article Container */}
        <article style={{
          background: '#FFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          padding: '44px',
          marginBottom: '40px',
        }}>
          {/* Category badge */}
          {blog.category && (
            <span className="badge badge-organic" style={{ marginBottom: '16px' }}>
              {blog.category.name}
            </span>
          )}

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            fontWeight: 800,
            color: 'var(--color-brown-dark)',
            lineHeight: 1.3,
            marginBottom: '20px',
          }}>
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--color-gray-light)',
            marginBottom: '30px',
            fontSize: '0.85rem',
            color: 'var(--color-gray-mid)',
            flexWrap: 'wrap',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-brown)' }}>
              <User size={16} color="var(--color-primary-dark)" /> {blog.author?.name || 'Ban Biên Tập Nông Sản Việt'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> {blog.published_at ? new Date(blog.published_at).toLocaleDateString('vi-VN') : 'Mới xuất bản'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={15} /> {blog.views_count || 150} lượt đọc
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> 4 phút đọc
            </span>
          </div>

          {/* Summary Callout Box */}
          {blog.summary && (
            <div style={{
              background: 'var(--color-cream)',
              borderLeft: '4px solid var(--color-primary)',
              padding: '18px 22px',
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic',
              fontSize: '1.02rem',
              color: 'var(--color-brown-dark)',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}>
              {blog.summary}
            </div>
          )}

          {/* Thumbnail Banner */}
          {blog.thumbnail && (
            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '36px',
              maxHeight: '440px',
            }}>
              <img
                src={blog.thumbnail}
                alt={blog.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Main Article Content */}
          <div
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.9,
              color: 'var(--color-gray-dark)',
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Author footer banner */}
          <div style={{
            marginTop: '48px',
            paddingTop: '28px',
            borderTop: '1px solid var(--color-gray-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#FAF7F0',
            padding: '20px',
            borderRadius: '12px',
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
            }}>
              🌾
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-brown-dark)' }}>
                Ban Biên Tập Nông Sản Việt
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-gray-mid)' }}>
                Chia sẻ kiến thức nông nghiệp sạch, chế độ ăn uống lành mạnh và đồng hành cùng người nông dân Việt Nam.
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '20px' }}>
              Bài Viết Cùng Chuyên Mục
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}>
              {related.map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFF',
                  }}
                >
                  <img
                    src={rel.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'}
                    alt={rel.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                  />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-brown-dark)', lineHeight: 1.4 }}>
                    {rel.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)', marginTop: '8px' }}>
                    {rel.published_at ? new Date(rel.published_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
