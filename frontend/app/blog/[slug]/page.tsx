import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, User, Eye, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';

async function getBlog(slug: string) {
  try {
    const res = await fetchApi(`/blogs/${slug}`, { next: { revalidate: 300 } });
    return { blog: res?.data || null, related: res?.related || [] };
  } catch {
    return { blog: null, related: [] };
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { blog } = await getBlog(params.slug);

  if (!blog) return { title: 'Không tìm thấy bài viết' };

  const description = blog.meta_description || blog.excerpt || 'Tin tức và kiến thức nông sản.';
  const image = blog.thumbnail || undefined;

  return {
    title: blog.meta_title || blog.title,
    description,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      type: 'article',
      url: `/blog/${blog.slug}`,
      title: blog.meta_title || blog.title,
      description,
      images: image ? [{ url: image, alt: blog.title }] : undefined,
      publishedTime: blog.published_at || undefined,
      authors: blog.author ? [blog.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.meta_title || blog.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const { blog, related } = await getBlog(params.slug);

  if (!blog) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || blog.meta_description,
    image: blog.thumbnail ? [blog.thumbnail] : undefined,
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    author: { '@type': 'Person', name: blog.author || 'Nông Sản Sạch' },
    publisher: {
      '@type': 'Organization',
      name: 'Nông Sản Sạch',
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${blog.slug}`,
  };

  return (
    <div style={{ padding: '34px 0 80px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="container" style={{ maxWidth: '920px' }}>
        <div style={{ fontSize: '0.83rem', color: 'var(--color-gray-mid)', marginBottom: '18px' }}>
          <Link href="/" style={{ color: 'var(--color-brown)' }}>Trang chủ</Link> /{' '}
          <Link href="/blog" style={{ color: 'var(--color-brown)' }}>Tin tức</Link> /{' '}
          <span>{blog.title}</span>
        </div>

        <article style={{ background: '#FFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {blog.thumbnail && (
            <div style={{ aspectRatio: '16 / 7', maxHeight: '440px', overflow: 'hidden' }}>
              <img src={blog.thumbnail} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ padding: '32px clamp(20px, 5vw, 48px) 44px' }}>
            {blog.category && (
              <Link href={`/blog?category=${blog.category.slug}`} style={{ display: 'inline-block', fontSize: '0.73rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-dark)', background: 'var(--color-cream)', padding: '5px 11px', borderRadius: '999px', marginBottom: '14px' }}>
                {blog.category.name}
              </Link>
            )}

            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', lineHeight: 1.3, fontWeight: 900, color: 'var(--color-brown-dark)', marginBottom: '16px' }}>
              {blog.title}
            </h1>

            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--color-gray-mid)', paddingBottom: '20px', borderBottom: '1px solid var(--color-gray-light)', marginBottom: '26px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><CalendarDays size={14} /> {blog.published_at}</span>
              {blog.author && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><User size={14} /> {blog.author}</span>}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Eye size={14} /> {blog.view_count || 0} lượt xem</span>
            </div>

            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--color-gray-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/blog" className="btn-outline" style={{ padding: '9px 16px' }}>
                <ArrowLeft size={16} /> Về trang tin tức
              </Link>
              <Link href="/products" className="btn-primary" style={{ padding: '10px 18px' }}>
                Mua nông sản sạch <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-brown)', marginBottom: '18px' }}>
              <BookOpen size={20} /> Bài viết liên quan
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
              {related.map((item: any) => (
                <Link key={item.id} href={`/blog/${item.slug}`} style={{ background: '#FFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={item.thumbnail || 'https://placehold.co/600x340/FAF7F0/6B4226?text=Nong+San'} alt={item.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-dark)', fontWeight: 700, marginBottom: '5px' }}>{item.category?.name || 'Tin tức'}</div>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.45, color: 'var(--color-brown-dark)' }}>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
