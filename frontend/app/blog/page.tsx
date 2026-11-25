import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Eye, User, ArrowRight, Sparkles } from 'lucide-react';
import { fetchApi } from '../../lib/api';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  blogs_count?: number;
}

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  views_count: number;
  published_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    name: string;
  };
}

async function getBlogData(category?: string, search?: string) {
  try {
    let url = '/blogs';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    const [blogsRes, categoriesRes] = await Promise.all([
      fetchApi(url),
      fetchApi('/blog-categories'),
    ]);

    return {
      blogs: blogsRes?.data || [],
      categories: categoriesRes?.data || [],
      pagination: {
        current_page: blogsRes?.current_page || 1,
        last_page: blogsRes?.last_page || 1,
        total: blogsRes?.total || 0,
      },
    };
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return { blogs: [], categories: [], pagination: { current_page: 1, last_page: 1, total: 0 } };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string; search?: string };
}) {
  const currentCategory = searchParams?.category || '';
  const currentSearch = searchParams?.search || '';
  const { blogs, categories, pagination } = await getBlogData(currentCategory, currentSearch);

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const regularBlogs = blogs.length > 1 ? blogs.slice(1) : blogs;

  return (
    <div style={{ padding: '40px 0 80px', background: '#FAF7F0' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(200, 164, 90, 0.25)',
            color: 'var(--color-brown-dark)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '14px',
          }}>
            <BookOpen size={16} color="var(--color-primary-dark)" /> KIẾN THỨC & CẨM NANG NÔNG NGHIỆP
          </div>
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--color-brown-dark)',
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            Bí Quyết Sống Khỏe & Dinh Dưỡng Sạch
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-gray-dark)', lineHeight: 1.6 }}>
            Tổng hợp các bài viết hướng dẫn chọn rau củ tươi, công thức món ngon organic, và câu chuyện canh tác sạch từ nông dân Việt.
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '36px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link
            href="/blog"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: !currentCategory ? 'var(--color-primary-dark)' : '#FFF',
              color: !currentCategory ? '#FFF' : 'var(--color-brown)',
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s ease',
            }}
          >
            Tất Cả Bài Viết
          </Link>

          {categories.map((cat: BlogCategory) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: isActive ? 'var(--color-primary-dark)' : '#FFF',
                  color: isActive ? '#FFF' : 'var(--color-brown)',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.name} {cat.blogs_count ? `(${cat.blogs_count})` : ''}
              </Link>
            );
          })}
        </div>

        {/* Featured Post (Hero card) */}
        {!currentCategory && featuredBlog && (
          <div style={{
            background: '#FFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          }}>
            <div style={{ height: '380px', position: 'relative' }}>
              <img
                src={featuredBlog.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                alt={featuredBlog.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'var(--color-primary-dark)',
                color: '#FFF',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                ⭐ BÀI VIẾT NỔI BẬT
              </div>
            </div>

            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {featuredBlog.category && (
                <span className="badge badge-organic" style={{ alignSelf: 'flex-start', marginBottom: '14px' }}>
                  {featuredBlog.category.name}
                </span>
              )}
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '16px', lineHeight: 1.3 }}>
                <Link href={`/blog/${featuredBlog.slug}`} style={{ color: 'inherit' }}>
                  {featuredBlog.title}
                </Link>
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-gray-dark)', lineHeight: 1.7, marginBottom: '24px' }}>
                {featuredBlog.summary}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-gray-light)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {featuredBlog.published_at ? new Date(featuredBlog.published_at).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} /> {featuredBlog.views_count || 120} lượt xem
                  </span>
                </div>
                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  Đọc tiếp <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '28px',
        }}>
          {regularBlogs.map((blog: BlogItem) => (
            <article
              key={blog.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: '#FFF',
              }}
            >
              <Link href={`/blog/${blog.slug}`} style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                <img
                  src={blog.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                  alt={blog.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
                {blog.category && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(44, 26, 14, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}>
                    {blog.category.name}
                  </span>
                )}
              </Link>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--color-gray-mid)', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {blog.published_at ? new Date(blog.published_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={13} /> {blog.views_count || 45} xem
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '10px', lineHeight: 1.4 }}>
                  <Link href={`/blog/${blog.slug}`} style={{ color: 'inherit' }}>
                    {blog.title}
                  </Link>
                </h3>

                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-gray-dark)',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {blog.summary}
                </p>

                <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-brown)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> {blog.author?.name || 'Ban Biên Tập'}
                  </span>
                  <Link href={`/blog/${blog.slug}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Xem bài viết <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {blogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📖</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-brown-dark)', marginBottom: '8px' }}>
              Không tìm thấy bài viết nào
            </h3>
            <p style={{ color: 'var(--color-gray-mid)', fontSize: '0.9rem' }}>
              Hãy thử chọn danh mục khác hoặc quay lại danh sách bài viết chính.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
