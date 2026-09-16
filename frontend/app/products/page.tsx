import React from 'react';
import Link from 'next/link';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard, { Product } from '../../components/ProductCard';
import { fetchApi } from '../../lib/api';

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  is_flash_sale?: string;
  is_featured?: string;
  page?: string;
}

async function getProductsData(searchParams: SearchParams) {
  try {
    const params = new URLSearchParams();
    if (searchParams.category) params.append('category', searchParams.category);
    if (searchParams.search) params.append('search', searchParams.search);
    if (searchParams.sort) params.append('sort', searchParams.sort);
    if (searchParams.is_flash_sale) params.append('is_flash_sale', searchParams.is_flash_sale);
    if (searchParams.is_featured) params.append('is_featured', searchParams.is_featured);
    if (searchParams.page) params.append('page', searchParams.page);

    const [productsRes, categoriesRes] = await Promise.all([
      fetchApi(`/products?${params.toString()}`),
      fetchApi('/categories'),
    ]);

    return {
      products: productsRes?.data || [],
      meta: productsRes?.meta || {},
      categories: categoriesRes?.data || [],
    };
  } catch (err) {
    console.error('Error loading products:', err);
    return { products: [], meta: {}, categories: [] };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, meta, categories } = await getProductsData(searchParams);

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-mid)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--color-brown)' }}>Trang chủ</Link> / <span>Sản phẩm</span>
          {searchParams.category && <span> / Danh mục: <strong>{searchParams.category}</strong></span>}
          {searchParams.search && <span> / Từ khóa: <strong>"{searchParams.search}"</strong></span>}
        </div>

        {/* Page Title & Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)', margin: 0 }}>
              {searchParams.search ? `Kết quả tìm kiếm cho "${searchParams.search}"` : 'Tất Cả Nông Sản Sạch'}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-mid)', marginTop: '4px' }}>
              Hiển thị {products.length} sản phẩm tươi ngon
            </div>
          </div>

          {/* Sort bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)', fontWeight: 600 }}>Sắp xếp:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href={`/products?${new URLSearchParams({ ...searchParams, sort: 'latest' }).toString()}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: (!searchParams.sort || searchParams.sort === 'latest') ? 'var(--color-brown)' : '#FFF',
                  color: (!searchParams.sort || searchParams.sort === 'latest') ? '#FFF' : 'var(--color-gray-dark)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Mới nhất
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...searchParams, sort: 'price_asc' }).toString()}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: searchParams.sort === 'price_asc' ? 'var(--color-brown)' : '#FFF',
                  color: searchParams.sort === 'price_asc' ? '#FFF' : 'var(--color-gray-dark)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Giá tăng dần
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...searchParams, sort: 'price_desc' }).toString()}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: searchParams.sort === 'price_desc' ? 'var(--color-brown)' : '#FFF',
                  color: searchParams.sort === 'price_desc' ? '#FFF' : 'var(--color-gray-dark)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Giá giảm dần
              </Link>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Sidebar Filters */}
          <aside style={{
            background: '#FFF',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Filter size={18} color="var(--color-primary-dark)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-brown)' }}>Danh Mục</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              <Link
                href="/products"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: !searchParams.category ? 700 : 500,
                  background: !searchParams.category ? 'var(--color-cream)' : 'transparent',
                  color: !searchParams.category ? 'var(--color-primary-dark)' : 'var(--color-gray-dark)',
                }}
              >
                🌟 Tất cả sản phẩm
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: searchParams.category === cat.slug ? 700 : 500,
                    background: searchParams.category === cat.slug ? 'var(--color-cream)' : 'transparent',
                    color: searchParams.category === cat.slug ? 'var(--color-primary-dark)' : 'var(--color-gray-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{cat.icon} {cat.name}</span>
                </Link>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '12px' }}>
                Lọc Nhanh
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href="/products?is_flash_sale=1"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: searchParams.is_flash_sale ? 'var(--color-red)' : 'var(--color-gray-dark)',
                    fontWeight: searchParams.is_flash_sale ? 700 : 500,
                  }}
                >
                  ⚡ Giảm giá sâu (Flash Sale)
                </Link>
                <Link
                  href="/products?is_featured=1"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: searchParams.is_featured ? 'var(--color-primary-dark)' : 'var(--color-gray-dark)',
                    fontWeight: searchParams.is_featured ? 700 : 500,
                  }}
                >
                  🏆 Sản phẩm bán chạy
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {products.length === 0 ? (
              <div style={{
                background: '#FFF',
                padding: '60px 20px',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🥕</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-brown)' }}>Không tìm thấy sản phẩm nào!</h3>
                <p style={{ color: 'var(--color-gray-mid)', marginTop: '8px' }}>Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc danh mục.</p>
                <Link href="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
                  Xem tất cả sản phẩm
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '24px',
              }}>
                {products.map((p: Product) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
