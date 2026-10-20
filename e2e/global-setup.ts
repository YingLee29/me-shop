import fs from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost/api/v1';
const AUTH_DIR = path.join(process.cwd(), 'e2e', '.auth');
const STATE_FILE = path.join(AUTH_DIR, 'state.json');

async function getToken(email: string, password: string) {
  const api = await request.newContext();
  const response = await api.post(`${API_URL}/auth/login`, {
    data: { email, password },
    headers: { Accept: 'application/json' },
  });

  if (!response.ok()) {
    throw new Error(`Không đăng nhập được ${email}: HTTP ${response.status()} – ${await response.text()}`);
  }

  const body = await response.json();
  await api.dispose();

  if (!body?.access_token) {
    throw new Error(`API không trả access_token cho ${email}`);
  }

  return body.access_token as string;
}

async function globalSetup() {
  const [customerToken, adminToken] = await Promise.all([
    getToken('khach@example.com', 'password'),
    getToken('admin@nongsan.vn', 'Admin@123456'),
  ]);

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        cookies: [],
        origins: [
          {
            origin: 'http://localhost:5000',
            localStorage: [{ name: 'nongsan_token', value: customerToken }],
          },
          {
            origin: 'http://localhost:5002',
            localStorage: [{ name: 'nongsan_admin_token', value: adminToken }],
          },
        ],
      },
      null,
      2,
    ),
  );
}

export default globalSetup;
