import { expect, Page, test } from '@playwright/test';

const VIEWPORTS = [320, 375, 425, 768, 1024, 1440];
const PUBLIC_PAGES = ['/', '/products', '/products/banh-tet', '/cart', '/checkout', '/blog', '/account/wishlist', '/account/points'];

async function assertNoHorizontalOverflow(page: Page) {
  await page.waitForTimeout(500);
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth;
  });

  expect(overflow, `Trang bị tràn ngang ${overflow}px`).toBeLessThanOrEqual(2);
}

test.describe('Storefront responsive', () => {
  for (const width of VIEWPORTS) {
    test(`không tràn ngang tại ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of PUBLIC_PAGES) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('header')).toBeVisible();
        await assertNoHorizontalOverflow(page);
      }
    });
  }

  test('mobile menu mở/đóng được', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const menuButton = page.getByRole('button', { name: 'Mở menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.locator('.mobile-drawer')).toBeVisible();
    await menuButton.click();
    await expect(page.locator('.mobile-drawer')).toHaveCount(0);
  });
});

test.describe('Storefront smoke', () => {
  test('trang chủ, danh sách và chi tiết sản phẩm', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Nông Sản Tươi Lành/i })).toBeVisible();

    const title = await page.title();
    expect(title).toContain('Nông Sản Việt');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /localhost:5000|nongsan/i);
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();

    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    const firstProduct = page.locator('.card').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/products\/.+/);
    await expect(page.getByRole('button', { name: /Thêm Vào Giỏ/i })).toBeVisible();
  });

  test('thêm sản phẩm vào giỏ hàng', async ({ page }) => {
    await page.goto('/products/banh-tet', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Thêm Vào Giỏ/i }).click();
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Bánh tét').first()).toBeVisible();
  });

  test('trang blog và bài viết có SEO', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(/Blog|Bài viết|Cẩm nang|Tin Tức/i);

    const firstPost = page.locator('a[href^="/blog/"]').first();
    if (await firstPost.count()) {
      await firstPost.click();
      await expect(page).toHaveURL(/\/blog\/.+/);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/blog\//);
    }
  });
});
