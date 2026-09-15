# 📊 TIẾN ĐỘ DỰ ÁN – WEBSITE BÁN NÔNG SẢN SẠCH

> **File này dùng để team cập nhật tiến độ hàng ngày.**
> Khi hoàn thành một task, đổi `[ ]` → `[x]` và ghi ngày + tên người thực hiện.

**📋 Chi tiết đầy đủ:** xem [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## 🗓️ CẬP NHẬT LẦN CUỐI

| Thông tin | Nội dung |
|-----------|----------|
| **Cập nhật lúc** | 14/09/2026 |
| **Người cập nhật** | _(điền tên)_ |
| **Trạng thái chung** | 🟡 Đang thực hiện Phase 1 |

---

## 📈 TỔNG QUAN TIẾN ĐỘ

| Phase | Tổng tasks | Hoàn thành | Đang làm | Tiến độ |
|-------|-----------|-----------|---------|---------|
| **Phase 1** – MVP (Tuần 1–4) | 56 | 9 | 0 | 16% |
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
| `docker-compose.yml` đã tạo | ✅ Xong | — | 14/09/2026 |
| `docker/php/Dockerfile` đã tạo | ✅ Xong | — | 14/09/2026 |
| `docker/php/php.ini` đã tạo | ✅ Xong | — | 14/09/2026 |
| `docker/nginx/conf.d/backend.conf` đã tạo | ✅ Xong | — | 14/09/2026 |
| `docker/node/Dockerfile.frontend` đã tạo | ✅ Xong | — | 14/09/2026 |
| `docker/node/Dockerfile.admin` đã tạo | ✅ Xong | — | 14/09/2026 |
| `docker/mysql/init.sql` đã tạo | ✅ Xong | — | 14/09/2026 |
| `.env.example` đã tạo | ✅ Xong | — | 14/09/2026 |
| `Makefile` đã tạo | ✅ Xong | — | 14/09/2026 |
| Cài Docker Desktop trên máy (nếu chưa có) | ⬜ Chưa | — | — |
| Chạy `make setup` lần đầu | ⬜ Chưa | — | — |
| Xác nhận tất cả containers `Up` bằng `make ps` | ⬜ Chưa | — | — |

### 📦 Bước 1.1 – Khởi tạo dự án

- [ ] Tạo project Laravel 11 trong thư mục `backend/`
- [ ] Cài đặt Laravel Sanctum
- [ ] Cài đặt Spatie Permission
- [ ] Cấu hình `.env`: DB, Redis, Mail
- [ ] Cấu hình CORS cho phép Next.js frontend gọi API
- [ ] Setup Git repository + `.gitignore`

### 📦 Bước 1.2 – Database Migration

- [ ] Viết migration `categories`
- [ ] Viết migration `products`
- [ ] Viết migration `product_images`
- [ ] Viết migration `product_variants`
- [ ] Viết migration `orders`
- [ ] Viết migration `order_items`
- [ ] Viết migration `order_status_logs`
- [ ] Viết migration `banners` + `settings`
- [ ] Chạy `php artisan migrate`
- [ ] Tạo Seeder dữ liệu mẫu (3 danh mục, 10 sản phẩm)

### 📦 Bước 1.3 – Models & Relationships

- [ ] Model `Category`: `hasMany(Product)`, children, parent
- [ ] Model `Product`: `belongsTo(Category)`, images, variants
- [ ] Model `Order`: `belongsTo(User)`, items, status logs
- [ ] Model `OrderItem`: `belongsTo(Order)`, `belongsTo(Product)`, variant
- [ ] Model `User`: thêm quan hệ `hasMany(Order)`
- [ ] Thêm `$fillable`, `$hidden`, `$casts` cho tất cả models

### 📦 Bước 1.4 – Auth API (Sanctum)

- [ ] Tạo `AuthController` với method: `register`, `login`, `logout`, `me`
- [ ] Validation: email unique, password min:8, confirm password
- [ ] Trả về `access_token` dạng Bearer
- [ ] Cấu hình `routes/api.php` với prefix `v1`
- [ ] Test API bằng Postman/Insomnia

---

## 📅 TUẦN 2 – Product API & Category API

### 📦 Bước 2.1 – Category API

- [ ] `CategoryController@index`: trả về cây danh mục đệ quy (nested)
- [ ] `CategoryResource`: format JSON output
- [ ] Cache danh mục 1 giờ bằng Redis

### 📦 Bước 2.2 – Product API (Public)

- [ ] `ProductController@index`: filter, sort, paginate
- [ ] `ProductController@show`: eager load images, variants, category
- [ ] `ProductController@featured`: is_featured = true, giới hạn 10
- [ ] `ProductController@flashSale`
- [ ] `ProductController@search`: LIKE search
- [ ] `ProductResource`: format đầy đủ
- [ ] Tính `discount_percentage` trong Resource

### 📦 Bước 2.3 – Admin Product API

- [ ] CRUD đầy đủ cho sản phẩm (kèm upload ảnh)
- [ ] `StoreProductRequest`: validate tên, giá, danh mục, ảnh
- [ ] Xử lý upload ảnh: lưu vào `storage/app/public/products/`
- [ ] Tạo slug tự động từ tên (unique)
- [ ] Middleware `admin` bảo vệ route admin
- [ ] Bulk delete nhiều sản phẩm

---

## 📅 TUẦN 3 – Cart, Order & Frontend Setup

### 📦 Bước 3.1 – Cart API

- [ ] Migration bảng `carts`
- [ ] Kiểm tra tồn kho khi thêm vào giỏ
- [ ] Tính tổng tiền realtime (bao gồm biến thể)

### 📦 Bước 3.2 – Order API

- [ ] `PlaceOrderRequest`: validate địa chỉ, SĐT, payment_method
- [ ] Transaction DB để đảm bảo toàn vẹn dữ liệu
- [ ] Sinh `order_code` tự động (format: `NS` + timestamp + random 4 số)
- [ ] `OrderController@cancel`: chỉ hủy được khi status = pending/confirmed

### 📦 Bước 3.3 – Admin Order API

- [ ] Filter đơn theo: status, ngày tạo, tên khách, mã đơn
- [ ] Cập nhật status + ghi `OrderStatusLog` + ghi admin_note
- [ ] Tính tổng doanh thu dashboard

### 📦 Bước 3.4 – Khởi tạo Next.js Frontend

- [ ] Xóa Tailwind (không dùng), cài Bootstrap 5
- [ ] Cấu hình `next.config.js`: `images.domains`
- [ ] Tạo `styles/variables.css` với CSS variables màu vàng đất
- [ ] Tạo `styles/globals.css` import Bootstrap + custom styles
- [ ] Tạo `lib/axios.ts`: axios instance với baseURL từ env
- [ ] Tạo `lib/queryClient.ts`: React Query client config
- [ ] Tạo `store/cartStore.ts`: Zustand store
- [ ] Tạo `store/authStore.ts`: Zustand store

---

## 📅 TUẦN 4 – Frontend UI & Admin Setup

### 📦 Bước 4.1 – Layout Components (Frontend)

- [ ] `Topbar`: text vàng trên nền `#C8A45A`, responsive
- [ ] `Header`: Logo + Search + Cart + User
- [ ] `Navbar`: bg gradient nâu vàng, dropdown mega menu
- [ ] Cart icon badge số lượng realtime từ Zustand
- [ ] `Footer`: 4 cột thông tin, social icons, copyright

### 📦 Bước 4.2 – Trang Chủ (Homepage)

- [ ] `HeroBanner`: Swiper.js với autoplay, dots navigation
- [ ] `TrustBadges`: 4 items dạng row, responsive 2x2
- [ ] `CategoryGrid`: 6 icon + tên danh mục, hover scale
- [ ] `ProductSection`: component tái sử dụng
- [ ] Gọi API: `/products/featured`, `/products/flash-sale`, `/categories`
- [ ] Loading skeleton khi fetch data

### 📦 Bước 4.3 – Product Card & Grid

- [ ] `ProductCard`: badge % giảm, wishlist heart, hover zoom
- [ ] Nút "Mua Ngay": màu `#C8A45A`, hover animation
- [ ] Format giá VNĐ: `Intl.NumberFormat('vi-VN')`

### 📦 Bước 4.4 – Trang Danh Sách & Chi Tiết Sản Phẩm

- [ ] Sidebar filter: danh mục, khoảng giá, sắp xếp
- [ ] Grid 4 cột + phân trang + URL sync
- [ ] Gallery ảnh: ảnh chính + thumbnails
- [ ] Chọn biến thể cập nhật giá realtime
- [ ] Nút thêm giỏ hàng → toast notification
- [ ] Tab: Mô tả | Thông số | Đánh giá
- [ ] Schema JSON-LD cho SEO

### 📦 Bước 4.5 – Khởi tạo Admin Dashboard

- [ ] `AdminLayout`: Ant Design `Layout` với `Sider` + `Header`
- [ ] Sidebar màu `#2C1A0E`, menu items với icons
- [ ] Trang login admin riêng biệt
- [ ] Dashboard page: 4 stat cards + placeholder charts
- [ ] Protected routes: redirect về login nếu chưa auth

### 📦 Bước 4.6 – Phase 1 Acceptance Criteria

- [ ] ✅ Người dùng có thể đăng ký / đăng nhập
- [ ] ✅ Trang chủ hiển thị banner + danh mục + sản phẩm
- [ ] ✅ Danh sách sản phẩm có thể lọc và phân trang
- [ ] ✅ Chi tiết sản phẩm hiển thị đầy đủ thông tin
- [ ] ✅ Thêm sản phẩm vào giỏ hàng thành công
- [ ] ✅ Đặt hàng COD hoàn chỉnh (nhận order_code)
- [ ] ✅ Admin xem danh sách đơn hàng
- [ ] ✅ Admin cập nhật trạng thái đơn hàng
- [ ] ✅ Admin thêm/sửa/xóa sản phẩm

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
