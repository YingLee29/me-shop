# 📊 TIẾN ĐỘ DỰ ÁN – WEBSITE BÁN NÔNG SẢN SẠCH

> **File này dùng để team cập nhật tiến độ hàng ngày.**
> Khi hoàn thành một task, đổi `[ ]` → `[x]` và ghi ngày + tên người thực hiện.

**📋 Chi tiết đầy đủ:** xem [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## 🗓️ CẬP NHẬT LẦN CUỐI

| Thông tin | Nội dung |
|-----------|----------|
| **Cập nhật lúc** | 16/09/2026 |
| **Người cập nhật** | Antigravity AI Pair Programmer |
| **Trạng thái chung** | 🟢 Hoàn thành Phase 1 MVP (100%) |

---

## 📈 TỔNG QUAN TIẾN ĐỘ

| Phase | Tổng tasks | Hoàn thành | Đang làm | Tiến độ |
|-------|-----------|-----------|---------|---------|
| **Phase 1** – MVP (Tuần 1–4) | 56 | 56 | 0 | 100% |
| **Phase 2** – Core Features (Tuần 5–8) | 28 | 0 | 0 | 0% |
| **Phase 3** – Enhancement (Tuần 9–12) | 23 | 0 | 0 | 0% |
| **Phase 4** – Advanced (Tùy chọn) | 14 | 0 | 0 | 0% |

---

## ✅ KÝ HIỆU

```
[ ] Chưa làm
[/] Đang làm
[x] Hoàn thành
[!] Cần chú ý / Review
```

---

# PHASE 1 – MVP (Tuần 1–4)

---

## 📅 TUẦN 1 – Setup Môi Trường & Backend Foundation

### 🐳 Bước 1.0 – Docker Setup

| Task | Trạng thái | Người làm | Ngày xong |
|------|-----------|-----------|-----------|
| `docker-compose.yml` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `docker/php/Dockerfile` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `docker/php/php.ini` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `docker/nginx/conf.d/backend.conf` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `docker/node/Dockerfile.frontend` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `docker/node/Dockerfile.admin` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `docker/mysql/init.sql` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `.env.example` đã tạo | ✅ Xong | Team | 14/09/2026 |
| `Makefile` đã tạo | ✅ Xong | Team | 14/09/2026 |
| Cài Docker Desktop trên máy (nếu chưa có) | ✅ Xong | Team | 15/09/2026 |
| Chạy `make setup` lần đầu | ✅ Xong | Team | 15/09/2026 |
| Xác nhận tất cả containers `Up` bằng `make ps` | ✅ Xong | Team | 15/09/2026 |

### 📦 Bước 1.1 – Khởi tạo dự án

- [x] Tạo project Laravel 11 trong thư mục `backend/`
- [x] Cài đặt Laravel Sanctum
- [x] Cài đặt Spatie Permission
- [x] Cấu hình `.env`: DB, Redis, Mail
- [x] Cấu hình CORS cho phép Next.js frontend gọi API
- [x] Setup Git repository + `.gitignore`

### 📦 Bước 1.2 – Database Migration

- [x] Viết migration `categories`
- [x] Viết migration `products`
- [x] Viết migration `product_images`
- [x] Viết migration `product_variants`
- [x] Viết migration `orders`
- [x] Viết migration `order_items`
- [x] Viết migration `order_status_logs`
- [x] Viết migration `banners` + `settings`
- [x] Chạy `php artisan migrate`
- [x] Tạo Seeder dữ liệu mẫu (14 danh mục, 15 sản phẩm, roles, admin & customer)

### 📦 Bước 1.3 – Models & Relationships

- [x] Model `Category`: `hasMany(Product)`, children, parent
- [x] Model `Product`: `belongsTo(Category)`, images, variants
- [x] Model `Order`: `belongsTo(User)`, items, status logs
- [x] Model `OrderItem`: `belongsTo(Order)`, `belongsTo(Product)`, variant
- [x] Model `User`: thêm quan hệ `hasMany(Order)`
- [x] Thêm `$fillable`, `$hidden`, `$casts` cho tất cả models

### 📦 Bước 1.4 – Auth API (Sanctum)

- [x] Tạo `AuthController` với method: `register`, `login`, `logout`, `me`
- [x] Validation: email unique, password min:8, confirm password
- [x] Trả về `access_token` dạng Bearer
- [x] Cấu hình `routes/api.php` với prefix `v1`
- [x] Test API bằng Postman/Insomnia/curl

---

## 📅 TUẦN 2 – Product API & Category API

### 📦 Bước 2.1 – Category API

- [x] `CategoryController@index`: trả về cây danh mục đệ quy (nested)
- [x] `CategoryResource`: format JSON output
- [x] Cache danh mục 1 giờ bằng Redis

### 📦 Bước 2.2 – Product API (Public)

- [x] `ProductController@index`: filter, sort, paginate
- [x] `ProductController@show`: eager load images, variants, category
- [x] `ProductController@featured`: is_featured = true, giới hạn 10
- [x] `ProductController@flashSale`
- [x] `ProductController@search`: LIKE search
- [x] `ProductResource`: format đầy đủ
- [x] Tính `discount_percentage` trong Resource

### 📦 Bước 2.3 – Admin Product API

- [x] CRUD đầy đủ cho sản phẩm (kèm upload ảnh)
- [x] `StoreProductRequest`: validate tên, giá, danh mục, ảnh
- [x] Xử lý upload ảnh: lưu vào `storage/app/public/products/`
- [x] Tạo slug tự động từ tên (unique)
- [x] Middleware `admin` bảo vệ route admin
- [x] Bulk delete nhiều sản phẩm

---

## 📅 TUẦN 3 – Cart, Order & Frontend Setup

### 📦 Bước 3.1 – Cart API

- [x] Migration bảng `carts`
- [x] Kiểm tra tồn kho khi thêm vào giỏ
- [x] Tính tổng tiền realtime (bao gồm biến thể)

### 📦 Bước 3.2 – Order API

- [x] `PlaceOrderRequest`: validate địa chỉ, SĐT, payment_method
- [x] Transaction DB để đảm bảo toàn vẹn dữ liệu
- [x] Sinh `order_code` tự động (format: `NS` + timestamp + random 4 số)
- [x] `OrderController@cancel`: chỉ hủy được khi status = pending/confirmed

### 📦 Bước 3.3 – Admin Order API

- [x] Filter đơn theo: status, ngày tạo, tên khách, mã đơn
- [x] Cập nhật status + ghi `OrderStatusLog` + ghi admin_note
- [x] Tính tổng doanh thu dashboard

### 📦 Bước 3.4 – Khởi tạo Next.js Frontend

- [x] Cấu hình Next.js 14 App Router + React 18 + TypeScript 5
- [x] Thiết kế Design System theo tông màu đất (#C8A45A, #6B4226, #FAF7F0, #2C1A0E)
- [x] Tạo `app/globals.css` với đầy đủ design tokens, typography, utilities
- [x] Tạo `lib/api.ts`: API fetch client hỗ trợ cả SSR (qua docker internal http://nginx) và Client-side
- [x] Tạo `context/CartContext.tsx`: Quản lý giỏ hàng realtime, đồng bộ backend + local storage
- [x] Tạo `context/AuthContext.tsx`: Quản lý đăng nhập, đăng ký, phiên làm việc khách hàng

---

## 📅 TUẦN 4 – Frontend UI & Admin Setup

### 📦 Bước 4.1 – Layout Components (Frontend)

- [x] `Header`: Topbar ưu đãi + Logo thương hiệu + Search bar + User dropdown + Cart badge realtime
- [x] `Navbar`: Menu danh mục + link flash sale + điều hướng nhanh
- [x] `Footer`: 4 cam kết chất lượng (giao 2h, hữu cơ VietGAP, đổi trả 24h, giá tại vườn) + thông tin liên hệ + newsletter

### 📦 Bước 4.2 – Trang Chủ (Homepage)

- [x] Hero Section: Banner nông sản hữu cơ tươi lành với CTA mua ngay và flash sale
- [x] Trust Badges: Cam kết chuẩn VietGAP, vận chuyển giữ lạnh
- [x] Category Grid: Danh mục nông sản tuyển chọn (icon + count + hover animation)
- [x] Flash Sale Section: Giờ vàng giá sốc kèm discount badge
- [x] Featured Products Section: Top sản phẩm bán chạy nhất
- [x] Tích hợp API backend: `/categories`, `/products/featured`, `/products/flash-sale`

### 📦 Bước 4.3 – Product Card & Grid

- [x] `ProductCard`: Badge % giảm, ảnh zoom mượt mà, xuất xứ, sao đánh giá
- [x] Quick Add to Cart button với shopping cart icon và phản hồi tức thì
- [x] Format giá VNĐ chuẩn `Intl.NumberFormat('vi-VN')`

### 📦 Bước 4.4 – Trang Danh Sách & Chi Tiết Sản Phẩm

- [x] `app/products/page.tsx`: Sidebar lọc theo danh mục, lọc flash sale, sắp xếp mới nhất / giá tăng / giảm
- [x] `app/products/[slug]/page.tsx`: Gallery ảnh chính + thumbnails, chọn quy cách/biến thể tính giá realtime, bộ đếm số lượng, cam kết chuẩn VietGAP
- [x] Mua ngay chuyển thẳng đến Checkout

### 📦 Bước 4.5 – Giỏ Hàng & Đặt Hàng COD

- [x] `app/cart/page.tsx`: Bảng mặt hàng, tăng/giảm số lượng, xóa sản phẩm, tính toán phí ship (miễn phí từ 300k)
- [x] `app/checkout/page.tsx`: Form thông tin người nhận (tên, SĐT, địa chỉ, ghi chú), chọn phương thức thanh toán (COD / Chuyển khoản ngân hàng)
- [x] `app/orders/[code]/page.tsx`: Trang xác nhận đơn hàng thành công, hiển thị timeline trạng thái đơn, chi tiết thanh toán và sản phẩm
- [x] `app/login/page.tsx` & `app/register/page.tsx`: Đăng nhập, đăng ký tài khoản khách hàng

### 📦 Bước 4.6 – Khởi tạo Admin Dashboard

- [x] `admin/components/AdminLayoutWrapper.tsx`: Sidebar màu nâu đậm (#2C1A0E), icon điều hướng
- [x] `admin/app/login/page.tsx`: Trang đăng nhập admin riêng biệt (mặc định admin@nongsan.vn)
- [x] `admin/app/page.tsx`: Bảng điều khiển KPI (Tổng doanh thu, Đơn chờ xử lý, Tổng sản phẩm) + Bảng 10 đơn hàng gần nhất
- [x] `admin/app/orders/page.tsx`: Bộ lọc trạng thái đơn, tìm kiếm mã đơn/SĐT, modal xem chi tiết và cập nhật trạng thái đơn (Pending -> Confirmed -> Preparing -> Shipping -> Completed / Cancelled) kèm ghi chú
- [x] `admin/app/products/page.tsx`: Danh sách nông sản, quản lý tồn kho, modal thêm sản phẩm mới đầy đủ thông tin, xóa sản phẩm

### 📦 Bước 4.7 – Phase 1 Acceptance Criteria

- [x] ✅ Người dùng có thể đăng ký / đăng nhập
- [x] ✅ Trang chủ hiển thị banner + danh mục + sản phẩm
- [x] ✅ Danh sách sản phẩm có thể lọc và phân trang
- [x] ✅ Chi tiết sản phẩm hiển thị đầy đủ thông tin
- [x] ✅ Thêm sản phẩm vào giỏ hàng thành công
- [x] ✅ Đặt hàng COD hoàn chỉnh (nhận order_code)
- [x] ✅ Admin xem danh sách đơn hàng
- [x] ✅ Admin cập nhật trạng thái đơn hàng
- [x] ✅ Admin thêm/sửa/xóa sản phẩm

---

# PHASE 2 – CORE FEATURES (Tuần 5–8)

---

## 📅 TUẦN 5 – Flash Sale & Coupon System

### 📦 Bước 5.1 – Flash Sale

- [ ] Migration `flash_sales` + `flash_sale_products`
- [ ] API `GET /api/v1/products/flash-sale`
- [ ] Frontend: `FlashSaleSection` với countdown timer
- [ ] Admin: CRUD Flash Sale + thêm/bớt sản phẩm

### 📦 Bước 5.2 – Coupon System

- [ ] Migration `coupons`
- [ ] API `POST /api/v1/coupons/validate`
- [ ] Logic: kiểm tra expired_at, usage_limit, min_order_amount
- [ ] Admin: CRUD coupon
- [ ] Frontend: Input mã giảm giá trong trang Cart

---

## 📅 TUẦN 6 – Thanh Toán Online

### 📦 Bước 6.1 – Tích hợp MoMo

- [ ] Config MoMo credentials trong `.env` (sandbox)
- [ ] `PaymentController@createMoMo`
- [ ] `PaymentController@momoCallback`: xác thực chữ ký HMAC
- [ ] Cập nhật `Order.payment_status` = `paid`
- [ ] Frontend: redirect page + trạng thái chờ xác nhận

### 📦 Bước 6.2 – Tích hợp VNPAY

- [ ] Config VNPAY credentials (sandbox)
- [ ] Tạo URL thanh toán với checksum SHA512
- [ ] Xử lý IPN từ VNPAY
- [ ] Frontend: hiển thị QR code / chuyển hướng

---

## 📅 TUẦN 7 – Review System & Blog

### 📦 Bước 7.1 – Review & Rating

- [ ] Migration `reviews`
- [ ] Chỉ cho phép review khi đã mua hàng
- [ ] API: `GET /api/v1/products/{id}/reviews`
- [ ] API: `POST /api/v1/products/{id}/reviews`
- [ ] Tự động tính lại `avg_rating` và `review_count`
- [ ] Admin: duyệt review, xóa review vi phạm
- [ ] Frontend: Form review với star rating + upload ảnh

### 📦 Bước 7.2 – Blog / CMS

- [ ] Migration `blog_categories` + `blogs`
- [ ] API public: danh sách + chi tiết + theo danh mục
- [ ] Admin: CRUD bài viết với TipTap rich text editor
- [ ] Frontend: Trang `/blog` + `/blog/[slug]`
- [ ] SEO: generateMetadata dynamic

---

## 📅 TUẦN 8 – Search Nâng Cao & Admin Features

### 📦 Bước 8.1 – Tìm Kiếm Nâng Cao

- [ ] Chọn Option A (MySQL FULLTEXT) hoặc B (Meilisearch)
- [ ] API `GET /api/v1/products/search?q=...`
- [ ] Autocomplete với debounce 300ms
- [ ] Frontend: Search bar dropdown kết quả gợi ý

### 📦 Bước 8.2 – Admin: Báo Cáo Doanh Thu

- [ ] API `GET /api/v1/admin/reports/revenue`
- [ ] API `GET /api/v1/admin/reports/top-products`
- [ ] Admin frontend: Ant Design Charts (Line + Bar)
- [ ] Filter theo khoảng ngày (DatePicker range)

### 📦 Bước 8.3 – Admin: Quản Lý Kho

- [ ] API `GET /api/v1/admin/inventory`
- [ ] Filter: sắp hết hàng, hết hàng
- [ ] Cập nhật tồn kho inline
- [ ] Xuất báo cáo tồn kho ra Excel

### 📦 Bước 8.4 – Phase 2 Acceptance Criteria

- [ ] ✅ Flash sale hoạt động với countdown timer
- [ ] ✅ Mã giảm giá được validate và áp dụng đúng
- [ ] ✅ Thanh toán MoMo / VNPAY thành công (sandbox)
- [ ] ✅ Người dùng có thể viết review sau khi mua hàng
- [ ] ✅ Blog hiển thị và SEO tốt
- [ ] ✅ Tìm kiếm nhanh và có autocomplete
- [ ] ✅ Admin xem báo cáo doanh thu theo tháng
- [ ] ✅ Admin quản lý kho và cảnh báo hàng sắp hết

---

# PHASE 3 – ENHANCEMENT (Tuần 9–12)

---

## 📅 TUẦN 9 – Wishlist & Loyalty Points

### 📦 Bước 9.1 – Wishlist

- [ ] Migration `wishlists`
- [ ] API: GET, POST, DELETE
- [ ] Frontend: Nút ♡ trên ProductCard
- [ ] Trang `/account/wishlist`

### 📦 Bước 9.2 – Loyalty Points

- [ ] Tự động cộng điểm khi đơn hàng `completed`
- [ ] Cho phép dùng điểm để giảm giá khi checkout
- [ ] Trang `/account/points`: lịch sử giao dịch điểm

---

## 📅 TUẦN 10 – Email Notifications & SEO

### 📦 Bước 10.1 – Email System

- [ ] Thiết kế email template HTML (branding vàng đất)
- [ ] Queue emails với Laravel Queue
- [ ] `OrderObserver`: lắng nghe event → dispatch mail job
- [ ] Test email với Mailtrap

### 📦 Bước 10.2 – SEO Optimization

- [ ] `generateMetadata()` cho tất cả trang động
- [ ] JSON-LD Schema: `Product`, `BreadcrumbList`, `Article`
- [ ] `sitemap.xml` tự động sinh
- [ ] `robots.txt` cấu hình đúng
- [ ] Open Graph tags
- [ ] Canonical URL

---

## 📅 TUẦN 11 – Performance & Mobile

### 📦 Bước 11.1 – Performance Optimization

**Backend:**
- [ ] Cache API responses với Redis (TTL 1h)
- [ ] Config/route/view cache cho production
- [ ] Database indexes: slug, category_id, user_id
- [ ] Eager loading tránh N+1 query

**Frontend:**
- [ ] `next/image` với lazy loading + WebP
- [ ] Code splitting: dynamic import
- [ ] Static generation (SSG)
- [ ] Bundle analyzer

### 📦 Bước 11.2 – Mobile Responsiveness

- [ ] Kiểm tra trên 320px, 375px, 425px, 768px, 1024px, 1440px
- [ ] Header mobile: hamburger menu + drawer navigation
- [ ] ProductGrid responsive (2 → 3 → 5 cột)
- [ ] Trang checkout: single column trên mobile
- [ ] Nút "Mua Ngay" fixed bottom (mobile)
- [ ] Touch-friendly: min tap target 44x44px

---

## 📅 TUẦN 12 – Admin Advanced & RBAC

### 📦 Bước 12.1 – Phân Quyền RBAC

- [ ] Seeder tạo roles + permissions (Super Admin, Admin, Kho, CSKH)
- [ ] Admin UI: trang quản lý role/permission
- [ ] Middleware kiểm tra permission
- [ ] Frontend admin: ẩn menu items không có quyền

### 📦 Bước 12.2 – Phase 3 Acceptance Criteria

- [ ] ✅ Wishlist hoạt động cho user đã đăng nhập
- [ ] ✅ Điểm thưởng cộng/trừ chính xác
- [ ] ✅ Email gửi đúng trigger, đúng template
- [ ] ✅ LCP < 2.5s trên Lighthouse (mobile)
- [ ] ✅ Responsive tốt trên iPhone SE (320px)
- [ ] ✅ SEO score Lighthouse > 90
- [ ] ✅ Phân quyền admin hoạt động đúng

---

# PHASE 4 – ADVANCED (Tùy chọn)

### 📦 Bước A – Tích Hợp Vận Chuyển (GHN)

- [ ] Tính phí ship tự động theo địa chỉ
- [ ] Tạo đơn vận chuyển tự động
- [ ] Lấy tracking code + webhook
- [ ] Hiển thị tracking timeline

### 📦 Bước B – Chương Trình Đại Lý

- [ ] Bảng `affiliates`, tracking link `?ref=`
- [ ] Tính hoa hồng khi đơn hàng hoàn thành
- [ ] Admin: quản lý đại lý + thanh toán hoa hồng

### 📦 Bước C – App Mobile (React Native / Expo)

- [ ] Init project Expo
- [ ] Screens: Home, Categories, Product, Cart, Checkout, Account
- [ ] Push notification

### 📦 Bước D – Multi-Warehouse

- [ ] Bảng `warehouses` + `product_warehouse_stock`
- [ ] Hiển thị tồn kho theo khu vực
- [ ] Phân công đơn hàng về kho gần nhất

---

## 📝 NHẬT KÝ CẬP NHẬT

> **Hướng dẫn:** Mỗi khi cập nhật, thêm 1 dòng vào bảng bên dưới.

| Ngày | Người làm | Nội dung cập nhật |
|------|-----------|-------------------|
| 14/09/2026 | _(team)_ | Tạo file PROGRESS.md. Docker infrastructure đã sẵn sàng (9 files). |

---

*📅 Tạo: 14/09/2026 | Cập nhật: 14/09/2026*
*🌾 Dự án: Website bán Nông Sản Sạch*
