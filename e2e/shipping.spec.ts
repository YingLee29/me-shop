import { APIRequestContext, expect, test } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost/api/v1';
const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5002';
const WEBHOOK_SECRET = process.env.GHN_WEBHOOK_SECRET || 'demo-ghn-secret';

async function login(request: APIRequestContext, email: string, password: string) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
    headers: { Accept: 'application/json' },
  });

  expect(response.ok(), await response.text()).toBeTruthy();
  const body = await response.json();
  expect(body.access_token).toBeTruthy();

  return body.access_token as string;
}

test.describe('Checkout shipping quote', () => {
  test('tự tính phí GHN theo tỉnh/thành', async ({ page }) => {
    await page.goto('/products/banh-tet', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Thêm Vào Giỏ/i }).click();

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Thanh Toán Đơn Hàng/i })).toBeVisible();

    await page.getByLabel(/Họ và tên người nhận/i).fill('Khách Test GHN');
    await page.getByLabel(/Số điện thoại/i).fill('0909123456');
    await page.getByLabel(/Tỉnh \/ Thành phố/i).fill('TP. Hồ Chí Minh');
    await page.getByLabel(/Quận \/ Huyện/i).fill('Quận 1');
    await page.getByLabel(/Phường \/ Xã/i).fill('Bến Nghé');
    await page.getByLabel(/Địa chỉ giao hàng chi tiết/i).fill('12 Lê Lợi');

    await expect(page.getByText(/GHN dự kiến 1–2 ngày/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/22\.000/).first()).toBeVisible();
  });
});

test.describe('Shipping lifecycle', () => {
  test.use({ storageState: 'e2e/.auth/state.json' });

  test('xác nhận đơn tạo vận đơn, webhook cập nhật timeline và admin xem tracking', async ({ page, request }) => {
    const [customerToken, adminToken] = await Promise.all([
      login(request, 'khach@example.com', 'password'),
      login(request, 'admin@nongsan.vn', 'Admin@123456'),
    ]);

    const productResponse = await request.get(`${API_URL}/products/banh-tet`, {
      headers: { Accept: 'application/json' },
    });
    expect(productResponse.ok()).toBeTruthy();
    const product = (await productResponse.json()).data;

    const createResponse = await request.post(`${API_URL}/orders`, {
      data: {
        shipping_name: 'Khách Test GHN',
        shipping_phone: '0909123456',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Bến Nghé',
        shipping_address: '12 Lê Lợi',
        payment_method: 'cod',
        items: [{ product_id: product.id, quantity: 1 }],
      },
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
    });
    expect([200, 201], await createResponse.text()).toContain(createResponse.status());
    const created = await createResponse.json();
    const orderCode = created.data?.order_code || created.order_code;
    expect(orderCode).toMatch(/^NS/);

    const guestDetail = await request.get(`${API_URL}/orders/${orderCode}`, {
      headers: { Accept: 'application/json' },
    });
    const guestOrder = (await guestDetail.json()).data;
    expect(guestOrder.shipping_province).toBe('TP. Hồ Chí Minh');
    expect(Number(guestOrder.shipping_fee)).toBe(22000);

    const searchResponse = await request.get(`${API_URL}/admin/orders?search=${orderCode}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${adminToken}` },
    });
    const searchBody = await searchResponse.json();
    expect(searchBody.data.length).toBeGreaterThan(0);
    const orderId = searchBody.data[0].id;

    const confirmResponse = await request.patch(`${API_URL}/admin/orders/${orderId}/status`, {
      data: { status: 'confirmed', note: 'Xác nhận đơn E2E' },
      headers: { Accept: 'application/json', Authorization: `Bearer ${adminToken}` },
    });
    expect(confirmResponse.ok(), await confirmResponse.text()).toBeTruthy();
    const confirmed = await confirmResponse.json();
    const trackingCode = confirmed.data?.tracking_code;
    expect(trackingCode).toMatch(/^GHND/);

    const stamp = Date.now();
    const pickedResponse = await request.post(`${API_URL}/webhooks/ghn`, {
      data: {
        order_code: orderCode,
        tracking_code: trackingCode,
        event_id: `e2e-picked-${stamp}`,
        status: 'picked',
        description: 'Đã lấy hàng tại kho E2E',
        occurred_at: new Date().toISOString(),
      },
      headers: { Accept: 'application/json', 'X-GHN-Webhook-Secret': WEBHOOK_SECRET },
    });
    expect(pickedResponse.ok(), await pickedResponse.text()).toBeTruthy();

    const deliveredResponse = await request.post(`${API_URL}/webhooks/ghn`, {
      data: {
        order_code: orderCode,
        event_id: `e2e-delivered-${stamp}`,
        status: 'delivered',
        description: 'Giao hàng thành công E2E',
        occurred_at: new Date(Date.now() + 60_000).toISOString(),
      },
      headers: { Accept: 'application/json', 'X-GHN-Webhook-Secret': WEBHOOK_SECRET },
    });
    expect(deliveredResponse.ok(), await deliveredResponse.text()).toBeTruthy();

    const detailResponse = await request.get(`${API_URL}/orders/${orderCode}`, {
      headers: { Accept: 'application/json' },
    });
    const detail = (await detailResponse.json()).data;
    expect(detail.status).toBe('delivered');
    expect(detail.shipping_status).toBe('delivered');
    expect(detail.tracking_events.length).toBeGreaterThanOrEqual(3);

    // Storefront tracking timeline
    await page.goto(`/orders/${orderCode}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Theo Dõi Vận Chuyển GHN/i)).toBeVisible();
    await expect(page.getByText(trackingCode).first()).toBeVisible();
    await expect(page.getByText('Đã lấy hàng tại kho E2E')).toBeVisible();
    await expect(page.getByText('Giao hàng thành công E2E')).toBeVisible();

    // Admin shipment panel
    await page.goto(`${ADMIN_URL}/orders`, { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/Tìm theo mã đơn/i).fill(orderCode);
    await page.getByRole('button', { name: /Tìm/i }).click();
    await expect(page.getByText(orderCode)).toBeVisible();

    await page.getByRole('button', { name: /Xử lý đơn/i }).first().click();
    await expect(page.getByText(/Vận Chuyển GHN/i)).toBeVisible();
    await expect(page.getByText(trackingCode).first()).toBeVisible();
    await expect(page.getByText('Giao hàng thành công E2E')).toBeVisible();
  });
});
