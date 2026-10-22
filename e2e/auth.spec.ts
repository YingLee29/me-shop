import { expect, test } from '@playwright/test';

const CUSTOMER_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:5000';
const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5002';

test.describe('Đăng nhập', () => {
  test('khách hàng đăng nhập bằng form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel(/Địa chỉ Email/i).fill('khach@example.com');
    await page.getByLabel(/Mật khẩu/i).fill('password');
    await page.getByRole('button', { name: /^Đăng Nhập$/ }).click();

    await expect(page).toHaveURL(`${CUSTOMER_URL}/`, { timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Nguyễn' })).toBeVisible();
  });

  test('quản trị viên đăng nhập bằng form', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel(/Email Quản Trị Viên/i).fill('admin@nongsan.vn');
    await page.getByLabel(/Mật khẩu/i).fill('Admin@123456');
    await page.getByRole('button', { name: /Đăng Nhập Quản Trị/i }).click();

    await expect(page).toHaveURL(`${ADMIN_URL}/`, { timeout: 15_000 });
    await expect(page.locator('aside')).toBeVisible();
  });
});
