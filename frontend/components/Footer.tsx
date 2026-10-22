'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#2C1A0E', color: '#E8E0D5', marginTop: '60px', paddingTop: '50px' }}>
      <div className="container">
        {/* ── 4 Features Bar ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(229, 223, 200, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(200, 164, 90, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>Giao Hàng Toàn Quốc</div>
              <div style={{ fontSize: '0.8rem', color: '#9A8878' }}>Đóng gói cẩn thận, giao tận tay</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(200, 164, 90, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>100% Tự Nhiên</div>
              <div style={{ fontSize: '0.8rem', color: '#9A8878' }}>Nguồn gốc rõ ràng, không hương liệu</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(200, 164, 90, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>Đổi Trả Trong 24h</div>
              <div style={{ fontSize: '0.8rem', color: '#9A8878' }}>Nếu dập nát, không hài lòng</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(200, 164, 90, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>Giá Tại Vườn</div>
              <div style={{ fontSize: '0.8rem', color: '#9A8878' }}>Tiết kiệm không qua trung gian</div>
            </div>
          </div>
        </div>

        {/* ── Main Footer Columns ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          padding: '50px 0 40px 0',
        }}>
          {/* Col 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.8rem' }}>🌿</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>MOCSON FARM</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: '#C8B8A6', marginBottom: '20px' }}>
              Đặc sản Nghệ An từ gừng Kỳ Sơn, tinh bột nghệ, trà Shan Tuyết đến mật ong rừng – chế biến thủ công, giữ trọn vị núi rừng.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--color-primary)" /> TP. Vinh, Nghệ An
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--color-primary)" /> Hotline: 1900 6868 (8:00 - 21:00)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--color-primary)" /> hello@mocsonfarm.vn
              </span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '18px', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
              Danh Mục Sản Phẩm
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/products?category=gung-ky-son" style={{ color: '#C8B8A6' }}>🌿 Gừng Kỳ Sơn</Link></li>
              <li><Link href="/products?category=nghe-thao-moc" style={{ color: '#C8B8A6' }}>🌱 Nghệ & Thảo Mộc</Link></li>
              <li><Link href="/products?category=mat-ong-duong-phen" style={{ color: '#C8B8A6' }}>🍯 Mật Ong & Đường Phèn</Link></li>
              <li><Link href="/products?category=dac-san-nghe-an" style={{ color: '#C8B8A6' }}>🏞️ Đặc Sản Nghệ An</Link></li>
              <li><Link href="/products?category=combo-qua-tang" style={{ color: '#C8B8A6' }}>🎁 Combo Quà Tặng</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '18px', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
              Chăm Sóc Khách Hàng
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/blog" style={{ color: '#C8B8A6' }}>Tin tức & mẹo nấu ăn</Link></li>
              <li><Link href="/orders" style={{ color: '#C8B8A6' }}>Tra cứu đơn hàng</Link></li>
              <li><span style={{ color: '#C8B8A6' }}>Chính sách giao hàng toàn quốc</span></li>
              <li><span style={{ color: '#C8B8A6' }}>Chính sách đổi trả & hoàn tiền</span></li>
              <li><span style={{ color: '#C8B8A6' }}>Cam kết chất lượng & nguồn gốc</span></li>
              <li><span style={{ color: '#C8B8A6' }}>Hướng dẫn mua hàng & thanh toán COD</span></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '18px', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
              Nhận Khuyến Mãi Mới
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#C8B8A6', marginBottom: '14px' }}>
              Đăng ký email để nhận voucher 50.000đ cho đơn hàng đầu tiên:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Email của bạn..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#FFF',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button className="btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                Đăng Ký
              </button>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge badge-gold">COD Toàn Quốc</span>
              <span className="badge badge-organic">Chuyển Khoản 24/7</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{
          borderTop: '1px solid rgba(229, 223, 200, 0.15)',
          padding: '22px 0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#8B7B6D',
        }}>
          © {new Date().getFullYear()} MocSon Farm. Tất cả bản quyền được bảo lưu. Đặc sản Nghệ An – trọn vị núi rừng.
        </div>
      </div>
    </footer>
  );
}
