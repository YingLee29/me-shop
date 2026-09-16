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
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>Giao Hàng Nhanh 2H</div>
              <div style={{ fontSize: '0.8rem', color: '#9A8878' }}>Đảm bảo nông sản tươi mới</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(200, 164, 90, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>100% Hữu Cơ & VietGAP</div>
              <div style={{ fontSize: '0.8rem', color: '#9A8878' }}>Kiểm định nguồn gốc rõ ràng</div>
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
              <span style={{ fontSize: '1.8rem' }}>🌾</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>NÔNG SẢN VIỆT</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.7', color: '#C8B8A6', marginBottom: '20px' }}>
              Chuỗi cung ứng nông sản hữu cơ sạch, canh tác thuận tự nhiên từ các nông hộ Đà Lạt, miền Tây và Tây Nguyên đến tận tay người tiêu dùng.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--color-primary)" /> 123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--color-primary)" /> Hotline: 1900 6868 (8:00 - 21:00)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--color-primary)" /> cskh@nongsanviet.vn
              </span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '18px', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
              Danh Mục Sản Phẩm
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/products?category=rau-cu" style={{ color: '#C8B8A6' }}>🥦 Rau Củ Hữu Cơ</Link></li>
              <li><Link href="/products?category=trai-cay" style={{ color: '#C8B8A6' }}>🍎 Trái Cây Miền Tây & Đà Lạt</Link></li>
              <li><Link href="/products?category=gao-ngu-coc" style={{ color: '#C8B8A6' }}>🌾 Gạo ST25 & Ngũ Cốc Dinh Dưỡng</Link></li>
              <li><Link href="/products?category=nam-tuoi" style={{ color: '#C8B8A6' }}>🍄 Nấm Tươi & Nấm Khô</Link></li>
              <li><Link href="/products?category=dac-san-vung-mien" style={{ color: '#C8B8A6' }}>🍯 Đặc Sản Vùng Miền</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700, marginBottom: '18px', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
              Chăm Sóc Khách Hàng
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/orders" style={{ color: '#C8B8A6' }}>Tra cứu đơn hàng</Link></li>
              <li><span style={{ color: '#C8B8A6' }}>Chính sách giao hàng 2h</span></li>
              <li><span style={{ color: '#C8B8A6' }}>Chính sách đổi trả & hoàn tiền</span></li>
              <li><span style={{ color: '#C8B8A6' }}>Tiêu chuẩn chứng nhận VietGAP</span></li>
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
          © {new Date().getFullYear()} Nông Sản Việt. Tất cả bản quyền được bảo lưu. Thiết kế & Phát triển với chuẩn nông sản hữu cơ sạch.
        </div>
      </div>
    </footer>
  );
}
