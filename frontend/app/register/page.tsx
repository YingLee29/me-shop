'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0 100px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{
          background: '#FFF',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🌾</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brown-dark)' }}>
              Đăng Ký Thành Viên
            </h1>
            <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.88rem', marginTop: '6px' }}>
              Nhận ngay voucher 50.000đ và tích điểm mua nông sản sạch
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--color-red-light)',
              border: '1px solid var(--color-red)',
              color: 'var(--color-red)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Họ và tên <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lê Thị Mai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <User size={18} color="var(--color-gray-mid)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Địa chỉ Email <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <Mail size={18} color="var(--color-gray-mid)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Số điện thoại
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <Phone size={18} color="var(--color-gray-mid)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Địa chỉ giao hàng mặc định
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Số nhà, đường, quận/huyện, TP..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <MapPin size={18} color="var(--color-gray-mid)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Mật khẩu <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <Lock size={18} color="var(--color-gray-mid)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Xác nhận mật khẩu <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <Lock size={18} color="var(--color-gray-mid)" style={{ position: 'absolute', left: 14, top: 14 }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '14px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)',
                marginTop: '12px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Đang Tạo Tài Khoản...' : 'Đăng Ký Ngay'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--color-gray-dark)' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
