'use client';

import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@nongsan.vn');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập quản trị viên thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2C1A0E 0%, #1A0F08 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#FFF',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-brown) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.8rem',
            color: '#FFF',
          }}>
            🌾
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            Nông Sản Việt Admin
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Hệ thống quản lý bán hàng & kho vận
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
              Email Quản Trị Viên
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--admin-border)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <Mail size={18} color="#9A8878" style={{ position: 'absolute', left: 14, top: 14 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-brown)', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--admin-border)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <Lock size={18} color="#9A8878" style={{ position: 'absolute', left: 14, top: 14 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '14px',
              fontSize: '1rem',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          padding: '14px',
          background: '#FAF7F0',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--admin-border)',
          fontSize: '0.8rem',
          color: 'var(--admin-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <ShieldCheck size={20} color="var(--admin-primary-dark)" />
          <div>
            Tài khoản mẫu: <strong>admin@nongsan.vn</strong> / <strong>Admin@123456</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
