import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock, Leaf } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import { fetchApi } from '../lib/api';

async function getHomePageData() {
  try {
    const [categoriesRes, featuredRes, flashSaleRes] = await Promise.all([
      fetchApi('/categories'),
      fetchApi('/products/featured'),
      fetchApi('/products/flash-sale'),
    ]);

    return {
      categories: categoriesRes?.data || [],
      featuredProducts: featuredRes?.data || [],
      flashSaleProducts: flashSaleRes?.data || [],
    };
  } catch (err) {
    console.error('Error fetching homepage data:', err);
    return {
      categories: [],
      featuredProducts: [],
      flashSaleProducts: [],
    };
  }
}

export default async function HomePage() {
  const { categories, featuredProducts, flashSaleProducts } = await getHomePageData();

  return (
    <div>
      {/* ── Hero Banner Section ── */}
      <section style={{
        background: 'linear-gradient(135deg, #FBF8F2 0%, #F5EDD6 50%, #E8DFC8 100%)',
        padding: '60px 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '40px',
        }}>
          {/* Left Column Text */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(200, 164, 90, 0.25)',
              color: 'var(--color-brown-dark)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              <Leaf size={16} color="var(--color-green)" /> NÔNG SẢN HỮU CƠ 100% VIETGAP
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
              fontWeight: 800,
              color: 'var(--color-brown-dark)',
              lineHeight: 1.18,
              letterSpacing: '-1px',
              marginBottom: '20px',
            }}>
              Nông Sản Tươi Lành <br />
              <span style={{
                background: 'linear-gradient(90deg, #A0783A 0%, #6B4226 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Thu Hoạch Tận Vườn
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--color-gray-dark)',
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '520px',
            }}>
              Cam kết không thuốc trừ sâu, không chất bảo quản. Đưa rau củ quả tươi sạch từ các nông trại Đà Lạt & Miền Tây đến bàn ăn gia đình bạn trong vòng 2 giờ.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Mua Ngay Hôm Nay <ArrowRight size={18} />
              </Link>
              <Link href="/products?is_flash_sale=1" className="btn-outline" style={{ padding: '14px 24px', fontSize: '1rem' }}>
                ⚡ Xem Flash Sale
              </Link>
            </div>

            {/* Mini Trust Stats */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(107, 66, 38, 0.15)',
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brown)' }}>15.000+</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>Khách hàng hài lòng</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brown)' }}>100%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>Chuẩn VietGAP</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brown)' }}>2H</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>Giao nội thành</div>
              </div>
            </div>
          </div>

          {/* Right Column Visual Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: '#FFF',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: 'var(--shadow-hover)',
              border: '2px solid var(--color-border)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80"
                alt="Rau củ hữu cơ tươi sạch"
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  borderRadius: '16px',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 28,
                left: 28,
                background: 'rgba(44, 26, 14, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '12px 20px',
                borderRadius: '14px',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>TƯƠI MỖI SÁNG</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>Hái tại vườn lúc 5h sáng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Highlights ── */}
      <section style={{ padding: '50px 0', background: '#FFF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                KHÁM PHÁ DANH MỤC
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>
                Nông Sản Tuyển Chọn
              </h2>
            </div>
            <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
          }}>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="card"
                style={{
                  padding: '20px 14px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'var(--color-cream)',
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '10px',
                  lineHeight: 1,
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))',
                }}>
                  {cat.icon || '🥬'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-brown-dark)' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-mid)', marginTop: '4px' }}>
                  {cat.products_count ? `${cat.products_count} sản phẩm` : 'Tươi ngon'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flash Sale Section ── */}
      {flashSaleProducts.length > 0 && (
        <section style={{ padding: '60px 0', background: 'linear-gradient(180deg, #FAF7F0 0%, #F5EDD6 100%)' }}>
          <div className="container">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #D32F2F 100%)',
                  color: '#FFF',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  ⚡ GIỜ VÀNG GIÁ SỐC
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)', margin: 0 }}>
                  Flash Sale Hôm Nay
                </h2>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-brown)', fontWeight: 600 }}>
                Số lượng có hạn trong ngày!
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '24px',
            }}>
              {flashSaleProducts.slice(0, 4).map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products Section ── */}
      <section style={{ padding: '60px 0', background: '#FFF' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                KHUYÊN DÙNG HÔM NAY
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>
                Sản Phẩm Bán Chạy Nhất
              </h2>
            </div>
            <Link href="/products" className="btn-outline" style={{ fontSize: '0.88rem' }}>
              Xem Toàn Bộ <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {featuredProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Commitment Banner ── */}
      <section style={{
        padding: '70px 0',
        background: 'linear-gradient(135deg, #6B4226 0%, #4A2E1B 100%)',
        color: '#FFF',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            TIÊU CHUẨN NÔNG SẢN SẠCH
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '14px 0 20px', lineHeight: 1.3 }}>
            Tử Tế Từ Đồng Ruộng Tới Mâm Cơm
          </h2>
          <p style={{ color: '#E5DFC8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '32px' }}>
            Mỗi bó rau, quả cà chua hay cân gạo đều được kiểm tra dư lượng nitrat và kim loại nặng theo quy trình nghiêm ngặt của Bộ Y Tế. Đảm bảo sức khỏe tuyệt đối cho mẹ và bé.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600 }}>
              🌿 Không Thuốc Trừ Sâu Hóa Học
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600 }}>
              💧 Nguồn Nước Tưới Đạt Chuẩn
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600 }}>
              🚚 Vận Chuyển Giữ Lạnh
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
