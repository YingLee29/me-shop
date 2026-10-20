import { expect, test } from '@playwright/test';

const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5002';

test.use({ storageState: 'e2e/.auth/state.json' });

test.describe('Admin smoke', () => {
  test('mở sản phẩm và thêm nhiều ảnh', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/products`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('aside')).toBeVisible();

    await page.getByRole('button', { name: /Thêm Sản Phẩm Mới/i }).click();
    await expect(page.getByRole('heading', { name: /Thêm Nông Sản Mới/i })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles([
      { name: 'anh-1.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nK0AAAAASUVORK5CYII=', 'base64') },
      { name: 'anh-2.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nK0AAAAASUVORK5CYII=', 'base64') },
    ]);

    await expect(page.getByText('2/6 ảnh')).toBeVisible();
    await expect(page.getByText('★ Ảnh chính')).toBeVisible();
    await expect(page.getByText('Ảnh phụ', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Bỏ ảnh này' }).first().click();
    await expect(page.getByText('1/6 ảnh')).toBeVisible();
  });

  test('các trang quản trị chính tải được', async ({ page }) => {
    for (const path of ['/products', '/orders', '/categories', '/roles']) {
      await page.goto(`${ADMIN_URL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    }
  });

  for (const width of [375, 768, 1440]) {
    test(`admin không tràn ngang tại ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${ADMIN_URL}/products`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main')).toBeVisible();

      if (width <= 900) {
        await expect(page.getByRole('button', { name: 'Mở menu' })).toBeVisible();
      }

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth;
      });

      expect(overflow, `Admin tràn ngang ${overflow}px`).toBeLessThanOrEqual(2);
    });
  }
});
