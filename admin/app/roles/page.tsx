'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Save, Lock, Users } from 'lucide-react';
import { fetchAdminApi } from '../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface Role {
  id: number;
  name: string;
  permissions: string[];
  user_count: number;
}

const ROLE_LABELS: Record<string, string> = {
  'super-admin': 'Super Admin',
  admin: 'Quản trị viên',
  warehouse: 'Thủ kho',
  support: 'Chăm sóc khách hàng',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

const GROUP_LABELS: Record<string, string> = {
  products: 'Sản phẩm',
  inventory: 'Kho hàng',
  orders: 'Đơn hàng',
  coupons: 'Mã giảm giá',
  'flash-sales': 'Flash Sale',
  users: 'Người dùng',
  roles: 'Phân quyền',
  reports: 'Báo cáo',
  settings: 'Cài đặt',
};

const PERMISSION_LABELS: Record<string, string> = {
  'products.view': 'Xem sản phẩm',
  'products.create': 'Tạo sản phẩm',
  'products.update': 'Cập nhật sản phẩm',
  'products.delete': 'Xóa sản phẩm',
  'inventory.view': 'Xem tồn kho',
  'inventory.update': 'Cập nhật tồn kho',
  'orders.view': 'Xem đơn hàng',
  'orders.update-status': 'Cập nhật trạng thái đơn',
  'coupons.view': 'Xem mã giảm giá',
  'coupons.manage': 'Quản lý mã giảm giá',
  'flash-sales.view': 'Xem flash sale',
  'flash-sales.manage': 'Quản lý flash sale',
  'users.view': 'Xem người dùng',
  'users.manage': 'Quản lý người dùng',
  'roles.manage': 'Quản lý phân quyền',
  'reports.view': 'Xem báo cáo',
  'settings.manage': 'Quản lý cài đặt',
};

export default function AdminRolesPage() {
  const { user } = useAdminAuth();
  const canManage = user?.permissions?.includes('roles.manage') ?? false;

  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchAdminApi('/admin/roles'),
      fetchAdminApi('/admin/roles/permissions'),
    ])
      .then(([rolesRes, permsRes]) => {
        const roleList: Role[] = rolesRes?.data || [];
        setRoles(roleList);
        setGroups(permsRes?.groups || {});
        setDraft(
          Object.fromEntries(roleList.map((role) => [role.id, [...role.permissions]]))
        );
      })
      .catch((err) => setError(err?.message || 'Không tải được dữ liệu phân quyền.'))
      .finally(() => setLoading(false));
  }, [canManage]);

  const togglePermission = (roleId: number, permission: string) => {
    setDraft((prev) => {
      const current = prev[roleId] || [];
      const next = current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission];
      return { ...prev, [roleId]: next };
    });
  };

  const saveRole = async (role: Role) => {
    setSavingId(role.id);
    setMessage(null);
    setError(null);

    try {
      const res = await fetchAdminApi(`/admin/roles/${role.id}`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: draft[role.id] || [] }),
      });
      setRoles((prev) =>
        prev.map((item) =>
          item.id === role.id ? { ...item, permissions: res?.data?.permissions || [] } : item
        )
      );
      setMessage(res?.message || 'Đã lưu phân quyền.');
    } catch (err: any) {
      setError(err?.message || 'Lưu phân quyền thất bại.');
    } finally {
      setSavingId(null);
    }
  };

  if (!canManage) {
    return (
      <div className="table-container" style={{ padding: '48px', textAlign: 'center' }}>
        <Lock size={42} color="var(--color-red)" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontWeight: 800, color: 'var(--admin-brown-dark)' }}>Không có quyền truy cập</h2>
        <p style={{ color: 'var(--admin-text-muted)', marginTop: '6px' }}>
          Chỉ Super Admin mới được phép quản lý vai trò và quyền.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ShieldCheck size={28} color="var(--admin-primary-dark)" />
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-brown-dark)' }}>
            Phân Quyền Vai Trò
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Bật/tắt quyền cho từng vai trò. Super Admin luôn có toàn quyền.
          </p>
        </div>
      </div>

      {message && (
        <div style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontWeight: 600 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Đang tải...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {roles.map((role) => {
            const locked = role.name === 'super-admin';
            const selected = draft[role.id] || [];

            return (
              <div key={role.id} className="table-container" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-brown-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {locked && <Lock size={15} />} {ROLE_LABELS[role.name] || role.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={13} /> {role.user_count} tài khoản · {selected.length} quyền
                    </div>
                  </div>
                  {!locked && (
                    <button
                      onClick={() => saveRole(role)}
                      disabled={savingId === role.id}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      <Save size={14} /> {savingId === role.id ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  )}
                </div>

                {Object.entries(groups).map(([group, permissions]) => (
                  <div key={group} style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--admin-primary-dark)', marginBottom: '6px' }}>
                      {GROUP_LABELS[group] || group}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '4px 10px' }}>
                      {permissions.map((permission) => (
                        <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: 'var(--admin-text)', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.65 : 1 }}>
                          <input
                            type="checkbox"
                            checked={locked || selected.includes(permission)}
                            disabled={locked}
                            onChange={() => togglePermission(role.id, permission)}
                            style={{ accentColor: 'var(--admin-primary-dark)', width: 15, height: 15 }}
                          />
                          {PERMISSION_LABELS[permission] || permission}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
