const isServer = typeof window === 'undefined';

export const API_BASE_URL = isServer
  ? (process.env.INTERNAL_API_URL || 'http://nginx/api/v1')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1');

export async function fetchAdminApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!isServer) {
    const token = localStorage.getItem('nongsan_admin_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Lỗi ${response.status}: Yêu cầu thất bại`;
    throw new Error(errorMsg);
  }

  return data;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}
