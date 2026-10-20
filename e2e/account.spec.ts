import { expect, test } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/state.json' });

test.describe('Customer account', () => {
  test('xem wishlist và điểm thưởng', async ({ page }) => {
    await page.goto('/account/wishlist', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: /Sản Phẩm Yêu Thích/i })).toBeVisible();

    await page.goto('/account/points', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Điểm Thưởng Của Tôi/i })).toBeVisible();
    await expect(page.getByText(/Điểm hiện có/i)).toBeVisible();
  });

  test('wishlist toggle đồng bộ với API', async ({ page }) => {
    const wishlistLoaded = page.waitForResponse(
      (response) => response.url().includes('/wishlists/ids') && response.ok(),
      { timeout: 15_000 },
    );
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await wishlistLoaded;

    const heart = page.getByRole('button', { name: /Thêm vào yêu thích|Bỏ khỏi yêu thích/ }).first();
    await expect(heart).toBeVisible();

    const wasSaved = (await heart.getAttribute('aria-label')) === 'Bỏ khỏi yêu thích';
    const updateResponse = page.waitForResponse((response) => {
      const pathname = new URL(response.url()).pathname;
      return /\/wishlists(\/\d+)?$/.test(pathname)
        && ['POST', 'DELETE'].includes(response.request().method());
    });

    await heart.click();
    expect((await updateResponse).ok()).toBeTruthy();

    if (wasSaved) {
      await expect(heart).toHaveAttribute('aria-label', 'Thêm vào yêu thích');
    } else {
      await expect(heart).toHaveAttribute('aria-label', 'Bỏ khỏi yêu thích');

      const restoreResponse = page.waitForResponse((response) => {
        const pathname = new URL(response.url()).pathname;
        return /\/wishlists(\/\d+)?$/.test(pathname)
          && ['POST', 'DELETE'].includes(response.request().method());
      });
      await heart.click();
      expect((await restoreResponse).ok()).toBeTruthy();
      await expect(heart).toHaveAttribute('aria-label', 'Thêm vào yêu thích');
    }
  });
});
