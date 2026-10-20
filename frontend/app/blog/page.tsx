import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, ArrowRight, Search, BookOpen } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Tin Tức & Mẹo Nấu Ăn',
  description: 'Kiến thức chọn và bảo quản nông sản, mẹo nấu ăn, dinh dưỡng và câu chuyện nhà nông.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Tin Tức & Mẹo Nấu Ăn | Nông Sản Sạch',
    description: 'Kiến thức chọn và bảo quản nông sản, mẹo nấu ăn và dinh dưỡng mỗi ngày.',
    url: '/blog',
    type: 'website',
  },
};

interface BlogCard {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
  category?: { name: string; slug: string } | null;
  published_at?: string;
  view_count?: number;
}

async function getBlogs(params: { page?: string; category?: string; search?: string }) {
  try {
    const query = new URLSearchParams({ per_page: '9' });
    if (params.page) query.set('page', params.page);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);

    const [blogsRes, categoriesRes] = await Promise.all([
      fetchApi(`/blogs?${query.toString()}`, { next: { revalidate: 300 } }),
      fetchApi('/blogs/categories', { next: { revalidate: 300 } }),
    ]);

    return {
      blogs: (blogsRes?.data || []) as BlogCard[],
      meta: blogsRes?.meta || {},
      categories: categoriesRes?.data || [],
    };
  } catch (error) {
    console.error('Error loading blogs:', error);
    return { blogs: [], meta: {}, categories: [] };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string };
}) {
  const { blogs, meta, categories } = await getBlogs(searchParams);

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return query.toString() ? `?${query.toString()}` : '';
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ background: 'linear-gradient(135deg, #3E6B3A, #6B4226)', borderRadius: 'var(--radius-lg)', padding: '44px 36px', color: '#FFF', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', opacity: 0.85, marginBottom: '10px' }}>
            <BookOpen size={17} /> Cẩm nang nông sản
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Tin Tức & Mẹo Nấu Ăn</h1>
          <p style={{ maxWidth: '620px', opacity: 0.9, lineHeight: 1.7 }}>
            Chia sẻ cách chọn thực phẩm tươi ngon, bảo quản đúng chuẩn và những câu chuyện từ nông trại.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '26px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/blog" style={{ padding: '8px 15px', borderRadius: '999px', fontWeight: 700, fontSize: '0.83rem', background: !searchParams.category ? 'var(--color-brown)' : '#FFF', color: !searchParams.category ? '#FFF' : 'var(--color-gray-dark)', border: '1px solid var(--color-border)' }}>
              Tất cả
            </Link>
            {categories.map((category: any) => (
              <Link key={category.id} href={`/blog${buildQuery({ category: category.slug, page: undefined })}`} style={{ padding: '8px 15px', borderRadius: '999px', fontWeight: 700, fontSize: '0.83rem', background: searchParams.category === category.slug ? 'var(--color-brown)' : '#FFF', color: searchParams.category === category.slug ? '#FFF' : 'var(--color-gray-dark)', border: '1px solid var(--color-border)' }}>
                {category.name} ({category.blogs_count || 0})
              </Link>
            ))}
          </div>

          <form action="/blog" method="get" style={{ display: 'flex', gap: '8px' }}>
            {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
            <input name="search" defaultValue={searchParams.search || ''} placeholder="Tìm bài viết..." style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', width: '200px' }} />
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}><Search size={16} /></button>
          </form>
        </div>

        {blogs.length === 0 ? (
          <div style={{ background: '#FFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', color: 'var(--color-gray-mid)' }}>
            Chưa có bài viết phù hợp.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
            {blogs.map((blog) => (
              <article key={blog.id} style={{ background: '#FFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Link href={`/blog/${blog.slug}`} style={{ display: 'block', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--color-cream)' }}>
                  <img
                    src={blog.thumbnail || 'https://placehold.co/800x450/FAF7F0/6B4226?text=Nong+San'}
                    alt={blog.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Link>
                <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {blog.category && (
                    <Link href={`/blog?category=${blog.category.slug}`} style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '7px' }}>
                      {blog.category.name}
                    </Link>
                  )}
                  <h2 style={{ fontSize: '1.03rem', fontWeight: 800, lineHeight: 1.4, color: 'var(--color-brown-dark)', marginBottom: '8px' }}>
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-gray-mid)', lineHeight: 1.6, flex: 1 }}>{blog.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.76rem', color: 'var(--color-gray-mid)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><CalendarDays size={13} /> {blog.published_at}</span>
                    <Link href={`/blog/${blog.slug}`} style={{ color: 'var(--color-primary-dark)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      Đọc tiếp <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {meta.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px', flexWrap: 'wrap' }}>
            {Array.from({ length: meta.last_page }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                key={pageNumber}
                href={`/blog${buildQuery({ page: String(pageNumber) })}`}
                style={{
                  minWidth: 38, height: 38, padding: '0 10px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem',
                  background: pageNumber === (meta.current_page || 1) ? 'var(--color-brown)' : '#FFF',
                  color: pageNumber === (meta.current_page || 1) ? '#FFF' : 'var(--color-gray-dark)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {pageNumber}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
