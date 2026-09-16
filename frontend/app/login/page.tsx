'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0 100px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
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
              Đăng Nhập Tài Khoản
            </h1>
            <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.88rem', marginTop: '6px' }}>
              Truy cập giỏ hàng và theo dõi đơn hàng nông sản
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '6px' }}>
                Địa chỉ Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                marginTop: '10px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Seed demo quick fill */}
          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: 'var(--color-gray-dark)',
          }}>
            <div><strong>Tài khoản mẫu:</strong></div>
            <div style={{ marginTop: '4px' }}>
              👤 Khách: <button
                type="button"
                onClick={() => { setEmail('khach@example.com'); setPassword('password'); }}
                style={{ color: 'var(--color-primary-dark)', textDecoration: 'underline', fontWeight: 600 }}
              >
                khach@example.com / password
              </button>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--color-gray-dark)' }}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
