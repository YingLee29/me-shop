# 🌾 KẾ HOẠCH TRIỂN KHAI – WEBSITE BÁN NÔNG SẢN SẠCH
> **Step-by-step Implementation Plan** | Laravel 11 + Next.js 14 + Bootstrap + Ant Design

---

## 📌 THÔNG TIN DỰ ÁN

| Mục | Nội dung |
|-----|----------|
| **Tên dự án** | Website Bán Nông Sản Sạch |
| **Tech Stack** | PHP Laravel 11 + Next.js 14 (React) + Bootstrap 5 + Ant Design 5 |
| **Database** | MySQL 8 + Redis |
| **Auth** | Laravel Sanctum (SPA Token) |
| **Tổng thời gian** | ~12 tuần (3 tháng) |
| **Cấu trúc repo** | Monorepo: `backend/` + `frontend/` + `admin/` |

---

## 🗂️ CẤU TRÚC THƯ MỤC DỰ ÁN

```
my-shop/
├── backend/          Laravel 11 – REST API
├── frontend/         Next.js 14 – Website bán hàng (Port 3000)
├── admin/            Next.js 14 – Admin Dashboard (Port 3001)
├── docs/             Tài liệu dự án
│   ├── DESIGN_CONCEPT.md
│   └── IMPLEMENTATION_PLAN.md   (file này)
└── docker-compose.yml
```

---

## ✅ LEGEND – KÝ HIỆU

```
[ ] Chưa làm
[/] Đang làm
[x] Hoàn thành
[!] Cần chú ý / Review
```

---

# PHASE 1 – MVP (Tuần 1–4)
> **Mục tiêu**: Có thể đặt hàng COD cơ bản, admin xem và cập nhật đơn hàng

---

## TUẦN 1 – Setup Môi Trường & Backend Foundation

### 🐳 Bước 1.0 – Docker Setup (Chạy trước tiên)

**Yêu cầu trên máy host (chỉ cần cài 2 thứ này):**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) >= 24.x
- `make` (Linux/Mac có sẵn; Windows dùng Git Bash hoặc WSL2)

**Cấu trúc Docker đã tạo sẵn:**
```
my-shop/
├── docker-compose.yml          Định nghĩa tất cả services
├── .env.example                Biến môi trường mẫu
├── Makefile                    Lệnh tiện dụng
└── docker/
    ├── php/
    │   ├── Dockerfile          PHP 8.2-FPM + extensions
    │   └── php.ini             Cấu hình PHP (memory, upload, opcache)
    ├── nginx/
    │   └── conf.d/
    │       └── backend.conf    Nginx → PHP-FPM config
    ├── mysql/
    │   └── init.sql            Tạo database test khi khởi động
    └── node/
        ├── Dockerfile.frontend Next.js Frontend (port 3000)
        └── Dockerfile.admin    Next.js Admin (port 3001)
```

**Services sẽ được khởi động:**

| Container | Image | Port | Mô tả |
|-----------|-------|------|-------|
| `nongsan_nginx` | nginx:1.25-alpine | 80 | Reverse proxy → Laravel |
| `nongsan_php` | php:8.2-fpm (custom) | 9000 | Laravel API |
| `nongsan_mysql` | mysql:8.0 | 3306 | Database |
| `nongsan_redis` | redis:7-alpine | 6379 | Cache & Queue |
| `nongsan_frontend` | node:20-alpine | 3000 | Next.js Frontend |
| `nongsan_admin` | node:20-alpine | 3001 | Next.js Admin |
| `nongsan_mailpit` | mailpit:latest | 8025 | Email testing UI |
| `nongsan_queue` | php:8.2-fpm (custom) | — | Laravel Queue Worker |

**Setup lần đầu (chạy 1 lần duy nhất):**
```bash
cd my-shop

# 1. Copy file env
cp .env.example .env

# 2. Setup toàn bộ (build image + start + migrate + seed)
make setup
```

**Các lệnh thường dùng hàng ngày:**
```bash
make up            # Bật tất cả services
make down          # Tắt tất cả services
make logs          # Xem logs realtime
make shell         # Vào terminal PHP container

make artisan CMD="migrate"          # Chạy migration
make artisan CMD="make:controller X" # Tạo controller
make composer CMD="require pkg/name" # Cài package PHP
make migrate-fresh                   # Reset DB + seed lại
make cache-clear                     # Xóa cache Laravel
```

**Truy cập sau khi chạy:**
```
http://localhost:3000   → Website bán hàng (Frontend)
http://localhost:3001   → Admin Dashboard
http://localhost/api/v1 → Laravel API
http://localhost:8025   → Mailpit (xem email test)
localhost:3306          → MySQL (dùng TablePlus)
localhost:6379          → Redis (dùng RedisInsight)
```

**Tasks Docker:**
- [x] `docker-compose.yml` đã tạo
- [x] `docker/php/Dockerfile` đã tạo
- [x] `docker/php/php.ini` đã tạo
- [x] `docker/nginx/conf.d/backend.conf` đã tạo
- [x] `docker/node/Dockerfile.frontend` đã tạo
- [x] `docker/node/Dockerfile.admin` đã tạo
- [x] `docker/mysql/init.sql` đã tạo
- [x] `.env.example` đã tạo
- [x] `Makefile` đã tạo
- [ ] Cài Docker Desktop trên máy (nếu chưa có)
- [ ] Chạy `make setup` lần đầu
- [ ] Xác nhận tất cả containers `Up` bằng `make ps`

---

### 📦 Bước 1.1 – Khởi tạo dự án

```bash
# Tạo cấu trúc thư mục
mkdir -p my-shop/docs
cd my-shop

# Khởi tạo Laravel backend
composer create-project laravel/laravel backend
cd backend

# Cài đặt packages cần thiết
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require intervention/image
composer require barryvdh/laravel-cors

# Cấu hình Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

**Tasks:**
- [ ] Tạo project Laravel 11 trong thư mục `backend/`
- [ ] Cài đặt Laravel Sanctum
- [ ] Cài đặt Spatie Permission
- [ ] Cấu hình `.env`: DB, Redis, Mail
- [ ] Cấu hình CORS cho phép Next.js frontend gọi API
- [ ] Setup Git repository + `.gitignore`

---

### 📦 Bước 1.2 – Database Migration

```bash
# Chạy migration mặc định
php artisan migrate

# Tạo các migration theo thứ tự
php artisan make:migration create_categories_table
php artisan make:migration create_products_table
php artisan make:migration create_product_images_table
php artisan make:migration create_product_variants_table
php artisan make:migration create_orders_table
php artisan make:migration create_order_items_table
php artisan make:migration create_order_status_logs_table
php artisan make:migration create_banners_table
php artisan make:migration create_settings_table
```

**Thứ tự migration (quan trọng – dependency):**
1. `users` (đã có mặc định)
2. `categories` (parent_id tự tham chiếu)
3. `products` (FK: category_id)
4. `product_images` (FK: product_id)
5. `product_variants` (FK: product_id)
6. `orders` (FK: user_id)
7. `order_items` (FK: order_id, product_id, variant_id)
8. `order_status_logs` (FK: order_id)
9. `banners`
10. `settings`

**Tasks:**
- [ ] Viết migration `categories` (id, parent_id, name, slug, image, sort_order, is_active)
- [ ] Viết migration `products` (id, category_id, name, slug, sku, description, price, sale_price, stock_quantity, is_active, is_featured)
- [ ] Viết migration `product_images` (id, product_id, url, is_primary, sort_order)
- [ ] Viết migration `product_variants` (id, product_id, name, value, price, stock_quantity, sku)
- [ ] Viết migration `orders` (id, user_id, order_code, status, subtotal, shipping_fee, total, payment_method, shipping_*)
- [ ] Viết migration `order_items` (id, order_id, product_id, variant_id, product_name, price, quantity, subtotal)
- [ ] Viết migration `order_status_logs`
- [ ] Viết migration `banners` + `settings`
- [ ] Chạy `php artisan migrate`
- [ ] Tạo Seeder dữ liệu mẫu (3 danh mục, 10 sản phẩm)

---

### 📦 Bước 1.3 – Models & Relationships

```bash
php artisan make:model Category
php artisan make:model Product
php artisan make:model ProductImage
php artisan make:model ProductVariant
php artisan make:model Order
php artisan make:model OrderItem
php artisan make:model OrderStatusLog
php artisan make:model Banner
php artisan make:model Setting
```

**Tasks:**
- [ ] Model `Category`: `hasMany(Product)`, `hasMany(Category, 'parent_id')` (children), `belongsTo(Category, 'parent_id')` (parent)
- [ ] Model `Product`: `belongsTo(Category)`, `hasMany(ProductImage)`, `hasMany(ProductVariant)`
- [ ] Model `Order`: `belongsTo(User)`, `hasMany(OrderItem)`, `hasMany(OrderStatusLog)`
- [ ] Model `OrderItem`: `belongsTo(Order)`, `belongsTo(Product)`, `belongsTo(ProductVariant)`
- [ ] Model `User`: thêm quan hệ `hasMany(Order)`
- [ ] Thêm `$fillable`, `$hidden`, `$casts` cho tất cả models

---

### 📦 Bước 1.4 – Auth API (Sanctum)

```bash
php artisan make:controller Api/AuthController
```

**Endpoints cần xây dựng:**
```
POST /api/v1/auth/register   → Đăng ký
POST /api/v1/auth/login      → Đăng nhập → trả token
POST /api/v1/auth/logout     → Xóa token
GET  /api/v1/auth/me         → Lấy thông tin user hiện tại
```

**Tasks:**
- [ ] Tạo `AuthController` với các method: `register`, `login`, `logout`, `me`
- [ ] Validation: email unique, password min:8, confirm password
- [ ] Trả về `access_token` dạng Bearer
- [ ] Cấu hình `routes/api.php` với prefix `v1`
- [ ] Test API bằng Postman/Insomnia

---

## TUẦN 2 – Product API & Category API

### 📦 Bước 2.1 – Category API

```bash
php artisan make:controller Api/CategoryController
php artisan make:resource CategoryResource
php artisan make:resource CategoryCollection
```

**Endpoints:**
```
GET  /api/v1/categories              → Danh sách dạng tree
GET  /api/v1/categories/{slug}       → Chi tiết 1 danh mục
GET  /api/v1/categories/{slug}/products → Sản phẩm thuộc danh mục
```

**Tasks:**
- [ ] `CategoryController@index`: trả về cây danh mục đệ quy (nested)
- [ ] `CategoryResource`: format JSON output (id, name, slug, image, children)
- [ ] Cache danh mục 1 giờ bằng Redis (ít thay đổi)

---

### 📦 Bước 2.2 – Product API

```bash
php artisan make:controller Api/ProductController
php artisan make:resource ProductResource
php artisan make:resource ProductCollection
```

**Endpoints:**
```
GET /api/v1/products               → Danh sách (filter + sort + paginate)
GET /api/v1/products/{slug}        → Chi tiết sản phẩm
GET /api/v1/products/featured      → Sản phẩm nổi bật
GET /api/v1/products/flash-sale    → Flash sale
GET /api/v1/products/search?q=     → Tìm kiếm (LIKE query)
```

**Query Parameters cho listing:**
```
?category={slug}     Lọc theo danh mục
?price_min={number}  Lọc giá tối thiểu
?price_max={number}  Lọc giá tối đa
?sort={newest|price_asc|price_desc|popular}
?per_page={number}   Số item/trang (default: 20)
?page={number}       Trang hiện tại
```

**Tasks:**
- [ ] `ProductController@index`: filter, sort, paginate với Eloquent
- [ ] `ProductController@show`: eager load images, variants, category
- [ ] `ProductController@featured`: is_featured = true, giới hạn 10
- [ ] `ProductController@flashSale`: is_flash_sale = true, flash_sale_end_at > now()
- [ ] `ProductController@search`: LIKE search trên name, sku
- [ ] `ProductResource`: format đầy đủ (tên, giá, % giảm, ảnh, biến thể)
- [ ] Tính `discount_percentage` trong Resource

---

### 📦 Bước 2.3 – Admin Product API

```bash
php artisan make:controller Admin/ProductManageController
php artisan make:request StoreProductRequest
php artisan make:request UpdateProductRequest
```

**Endpoints (Admin):**
```
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/{id}
PUT    /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}
POST   /api/v1/admin/products/bulk-delete
```

**Tasks:**
- [ ] CRUD đầy đủ cho sản phẩm (kèm upload ảnh)
- [ ] `StoreProductRequest`: validate tên, giá, danh mục, ảnh
- [ ] Xử lý upload ảnh: lưu vào `storage/app/public/products/`
- [ ] Tạo slug tự động từ tên (unique)
- [ ] Middleware `admin` bảo vệ route admin
- [ ] Bulk delete nhiều sản phẩm

---

## TUẦN 3 – Cart, Order & Frontend Setup

### 📦 Bước 3.1 – Cart API

```bash
php artisan make:controller Api/CartController
php artisan make:migration create_carts_table
php artisan make:model Cart
```

**Chiến lược giỏ hàng:**
- **Guest**: Lưu trong localStorage (Next.js side)
- **Logged in**: Đồng bộ lên DB, merge khi login

**Endpoints:**
```
GET    /api/v1/cart           → Lấy giỏ hàng hiện tại
POST   /api/v1/cart/add       → Thêm sản phẩm
PUT    /api/v1/cart/{id}      → Cập nhật số lượng
DELETE /api/v1/cart/{id}      → Xóa 1 item
DELETE /api/v1/cart           → Xóa toàn bộ giỏ
POST   /api/v1/cart/sync      → Đồng bộ giỏ từ localStorage khi login
```

**Tasks:**
- [ ] Migration bảng `carts` (user_id nullable, session_id, product_id, variant_id, quantity)
- [ ] Kiểm tra tồn kho khi thêm vào giỏ
- [ ] Tính tổng tiền realtime (bao gồm biến thể)

---

### 📦 Bước 3.2 – Order API

```bash
php artisan make:controller Api/OrderController
php artisan make:request PlaceOrderRequest
```

**Endpoints:**
```
GET  /api/v1/orders          → Danh sách đơn hàng của user
POST /api/v1/orders          → Đặt hàng mới
GET  /api/v1/orders/{id}     → Chi tiết đơn hàng
POST /api/v1/orders/{id}/cancel → Hủy đơn
```

**Logic đặt hàng (PlaceOrder flow):**
```
1. Validate thông tin giao hàng
2. Kiểm tra tồn kho tất cả sản phẩm trong giỏ
3. Tính tổng tiền (subtotal + shipping_fee - discount)
4. Tạo Order với status = 'pending'
5. Tạo OrderItems từ giỏ hàng
6. Trừ tồn kho sản phẩm
7. Xóa giỏ hàng
8. Tạo OrderStatusLog (pending)
9. Trả về order_code
```

**Tasks:**
- [ ] `PlaceOrderRequest`: validate địa chỉ, SĐT, payment_method
- [ ] Transaction DB để đảm bảo toàn vẹn dữ liệu
- [ ] Sinh `order_code` tự động (format: `NS` + timestamp + random 4 số)
- [ ] `OrderController@cancel`: chỉ hủy được khi status = pending/confirmed

---

### 📦 Bước 3.3 – Admin Order API

```bash
php artisan make:controller Admin/OrderManageController
```

**Endpoints (Admin):**
```
GET /api/v1/admin/orders              → Danh sách đơn (filter status, date)
GET /api/v1/admin/orders/{id}         → Chi tiết đơn
PUT /api/v1/admin/orders/{id}/status  → Cập nhật trạng thái
```

**Tasks:**
- [ ] Filter đơn theo: status, ngày tạo, tên khách, mã đơn
- [ ] Cập nhật status + ghi `OrderStatusLog` + ghi admin_note
- [ ] Tính tổng doanh thu dashboard

---

### 📦 Bước 3.4 – Khởi tạo Next.js Frontend

```bash
cd my-shop
npx create-next-app@latest frontend --typescript --tailwind=false --eslint --app --src-dir=false

cd frontend
npm install axios @tanstack/react-query zustand
npm install bootstrap react-bootstrap
npm install antd @ant-design/icons
npm install swiper framer-motion
npm install react-hook-form zod @hookform/resolvers
```

**Cấu hình:**
- [ ] Xóa Tailwind (không dùng), cài Bootstrap 5
- [ ] Cấu hình `next.config.js`: `images.domains` thêm domain API
- [ ] Tạo `styles/variables.css` với CSS variables màu vàng đất
- [ ] Tạo `styles/globals.css` import Bootstrap + custom styles
- [ ] Tạo `lib/axios.ts`: axios instance với baseURL từ env
- [ ] Tạo `lib/queryClient.ts`: React Query client config
- [ ] Tạo `store/cartStore.ts`: Zustand store cho giỏ hàng
- [ ] Tạo `store/authStore.ts`: Zustand store cho auth

---

## TUẦN 4 – Frontend UI & Admin Setup

### 📦 Bước 4.1 – Layout Components (Frontend)

**Components cần tạo:**

```
components/layout/
├── Header.tsx        Logo, Search bar, User menu, Cart icon
├── Topbar.tsx        Freeship banner + Hotline
├── Navbar.tsx        Navigation menu + Mega menu danh mục
├── Footer.tsx        Links + Social + Địa chỉ
└── PageLayout.tsx    Wrapper layout tổng thể
```

**Tasks:**
- [ ] `Topbar`: text vàng trên nền `#C8A45A`, responsive ẩn trên mobile
- [ ] `Header`: Logo (trái), Search input (giữa, rounded-full, border vàng đất), Cart + User (phải)
- [ ] `Navbar`: bg gradient nâu vàng, dropdown mega menu "Chuyên Mục"
- [ ] Cart icon hiển thị badge số lượng realtime từ Zustand store
- [ ] `Footer`: 4 cột thông tin, social icons, copyright

---

### 📦 Bước 4.2 – Trang Chủ (Homepage)

```
app/(shop)/page.tsx
components/home/
├── HeroBanner.tsx       Swiper slider 3 slide
├── TrustBadges.tsx      4 badge: Sạch | VietGAP | Giao nhanh | Đổi trả
├── CategoryGrid.tsx     6 danh mục icon card
├── ProductSection.tsx   Section có tab + product grid (dùng lại nhiều lần)
└── BlogSection.tsx      Grid 3 bài viết mới nhất
```

**Tasks:**
- [ ] `HeroBanner`: Swiper.js với autoplay, dots navigation, lazy load ảnh
- [ ] `TrustBadges`: 4 items dạng row, responsive 2x2 trên mobile
- [ ] `CategoryGrid`: 6 icon + tên danh mục, hover scale animation
- [ ] `ProductSection`: component tái sử dụng (props: title, tabs, apiEndpoint)
- [ ] Gọi API: `/products/featured`, `/products/flash-sale`, `/categories`
- [ ] Loading skeleton khi fetch data

---

### 📦 Bước 4.3 – Product Card & Grid

```
components/product/
├── ProductCard.tsx     Card sản phẩm với badge, giá, nút mua
├── ProductGrid.tsx     Grid responsive (5 cột desktop, 2 cột mobile)
├── ProductSkeleton.tsx Loading placeholder
└── PriceDisplay.tsx    Hiển thị giá gốc + giá bán + % giảm
```

**Tasks:**
- [ ] `ProductCard`: ảnh 1:1 aspect ratio, badge % giảm (đỏ), wishlist heart, hover zoom
- [ ] Nút "Mua Ngay": màu `#C8A45A`, hover `#A0783A`, transition 0.2s
- [ ] Format giá VNĐ: `Intl.NumberFormat('vi-VN')`

---

### 📦 Bước 4.4 – Trang Danh Sách & Chi Tiết Sản Phẩm

**Trang danh sách** (`app/(shop)/products/page.tsx`):
- [ ] Sidebar filter: danh mục, khoảng giá (range slider), sắp xếp
- [ ] Grid 4 cột + phân trang
- [ ] URL sync: `?category=rau-cu&sort=price_asc&page=2`
- [ ] SEO metadata động

**Trang chi tiết** (`app/(shop)/products/[slug]/page.tsx`):
- [ ] `generateStaticParams` hoặc SSR
- [ ] Gallery ảnh: ảnh chính + thumbnails
- [ ] Chọn biến thể (nếu có): cập nhật giá realtime
- [ ] Nút thêm giỏ hàng → toast notification
- [ ] Tab: Mô tả | Thông số | Đánh giá
- [ ] Schema JSON-LD cho SEO

---

### 📦 Bước 4.5 – Khởi tạo Admin Dashboard

```bash
cd my-shop
npx create-next-app@latest admin --typescript --eslint --app

cd admin
npm install antd @ant-design/icons @ant-design/charts
npm install axios @tanstack/react-query zustand
npm install dayjs
```

**Layout Admin:**
```
admin/app/
├── layout.tsx             Root layout
├── (auth)/
│   └── login/page.tsx     Trang đăng nhập admin
└── (dashboard)/
    ├── layout.tsx          Admin layout (Sidebar + Header)
    └── dashboard/page.tsx  Trang chính
```

**Tasks:**
- [ ] `AdminLayout`: Ant Design `Layout` với `Sider` + `Header` + `Content`
- [ ] Sidebar màu `#2C1A0E`, menu items với icons
- [ ] Trang login admin riêng biệt
- [ ] Dashboard page: 4 stat cards + placeholder charts
- [ ] Protected routes: redirect về login nếu chưa auth

---

### 📦 Bước 4.6 – Phase 1 Testing & Checklist

**Acceptance Criteria Phase 1:**
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
> **Mục tiêu**: Flash sale, Coupon, Thanh toán online, Review, Blog, Tìm kiếm nâng cao

---

## TUẦN 5 – Flash Sale & Coupon System

### 📦 Bước 5.1 – Flash Sale

```bash
# Thêm cột flash sale vào products (nếu chưa có)
php artisan make:migration add_flash_sale_to_products_table
php artisan make:migration create_flash_sales_table  # Bảng riêng nếu cần quản lý nhiều đợt
```

**Tasks:**
- [ ] Migration: `flash_sales` (id, name, start_at, end_at, is_active)
- [ ] Migration: `flash_sale_products` (flash_sale_id, product_id, sale_price, limit_quantity)
- [ ] API: `GET /api/v1/products/flash-sale` → trả về sản phẩm + thời gian còn lại
- [ ] Frontend: Component `FlashSaleSection` với countdown timer (cập nhật mỗi giây)
- [ ] Admin: CRUD Flash Sale + thêm/bớt sản phẩm vào đợt sale

---

### 📦 Bước 5.2 – Coupon System

```bash
php artisan make:controller Api/CouponController
php artisan make:migration create_coupons_table
php artisan make:model Coupon
```

**Tasks:**
- [ ] Migration `coupons` (code, type: percent/fixed/freeship, value, min_order, max_discount, usage_limit, expired_at)
- [ ] API `POST /api/v1/coupons/validate`: kiểm tra hợp lệ + trả về discount amount
- [ ] Logic: kiểm tra expired_at, usage_limit, min_order_amount
- [ ] Admin: CRUD coupon (tạo mã, set điều kiện, thống kê sử dụng)
- [ ] Frontend: Input mã giảm giá trong trang Cart → hiển thị giảm bao nhiêu

---

## TUẦN 6 – Thanh Toán Online

### 📦 Bước 6.1 – Tích hợp MoMo

```bash
composer require momo/momo-payment  # hoặc tự implement
```

**Flow MoMo:**
```
1. Frontend gọi POST /api/v1/payment/momo/create (kèm order_id)
2. Laravel gọi MoMo API → nhận payUrl
3. Trả payUrl về Frontend → redirect người dùng
4. MoMo redirect về /payment/momo/callback?... 
5. Laravel verify callback → cập nhật payment_status = paid
```

**Tasks:**
- [ ] Config MoMo credentials trong `.env` (sandbox trước)
- [ ] `PaymentController@createMoMo`: tạo QR/link thanh toán
- [ ] `PaymentController@momoCallback`: xác thực chữ ký HMAC
- [ ] Cập nhật `Order.payment_status` = `paid` sau khi xác nhận
- [ ] Frontend: redirect page + trạng thái chờ xác nhận

### 📦 Bước 6.2 – Tích hợp VNPAY

**Flow VNPAY tương tự MoMo.**

**Tasks:**
- [ ] Config VNPAY credentials (sandbox)
- [ ] Tạo URL thanh toán VNPAY với checksum SHA512
- [ ] Xử lý IPN (Instant Payment Notification) từ VNPAY
- [ ] Frontend: hiển thị QR code / chuyển hướng cổng VNPAY

---

## TUẦN 7 – Review System & Blog

### 📦 Bước 7.1 – Review & Rating

```bash
php artisan make:controller Api/ReviewController
php artisan make:migration create_reviews_table
php artisan make:model Review
```

**Tasks:**
- [ ] Migration `reviews` (product_id, user_id, order_item_id, rating 1-5, title, content, images json, is_approved)
- [ ] Chỉ cho phép review khi đã mua hàng (check order_item_id)
- [ ] API: `GET /api/v1/products/{id}/reviews` (phân trang, lọc theo rating)
- [ ] API: `POST /api/v1/products/{id}/reviews` (auth required)
- [ ] Tự động tính lại `avg_rating` và `review_count` trên bảng `products`
- [ ] Admin: duyệt review (is_approved), xóa review vi phạm
- [ ] Frontend: Form review với star rating + upload ảnh, hiển thị danh sách reviews

---

### 📦 Bước 7.2 – Blog / CMS

```bash
php artisan make:controller Api/BlogController
php artisan make:controller Admin/BlogManageController
php artisan make:migration create_blog_categories_table
php artisan make:migration create_blogs_table
php artisan make:model BlogCategory
php artisan make:model Blog
```

**Tasks:**
- [ ] Migration `blog_categories` (id, name, slug)
- [ ] Migration `blogs` (id, blog_category_id, author_id, title, slug, excerpt, content, thumbnail, is_published, views_count, seo_*, published_at)
- [ ] API public: danh sách bài viết + chi tiết + theo danh mục
- [ ] Admin: CRUD bài viết với TipTap rich text editor
- [ ] Frontend: Trang `/blog` (grid 3 cột) + `/blog/[slug]` (chi tiết)
- [ ] SEO: generateMetadata dynamic từ blog data

---

## TUẦN 8 – Search Nâng Cao & Admin Features

### 📦 Bước 8.1 – Tìm Kiếm Nâng Cao

**Option A (đơn giản):** MySQL FULLTEXT search
```bash
php artisan make:migration add_fulltext_index_to_products
# ALTER TABLE products ADD FULLTEXT(name, description, sku)
```

**Option B (mạnh hơn):** Meilisearch + Laravel Scout
```bash
composer require laravel/scout
composer require meilisearch/meilisearch-php
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
php artisan scout:import "App\Models\Product"
```

**Tasks:**
- [ ] Chọn Option A hoặc B tùy infrastructure
- [ ] API `GET /api/v1/products/search?q=cải bó xôi&category=rau-cu`
- [ ] Autocomplete: trả về gợi ý khi gõ (debounce 300ms phía frontend)
- [ ] Frontend: Search bar trong Header với dropdown kết quả gợi ý

---

### 📦 Bước 8.2 – Admin: Báo Cáo Doanh Thu

```bash
php artisan make:controller Admin/ReportController
```

**Tasks:**
- [ ] `GET /api/v1/admin/reports/revenue?period=monthly&year=2026`
- [ ] Trả về: tổng doanh thu, số đơn, đơn trung bình theo từng ngày/tuần/tháng
- [ ] `GET /api/v1/admin/reports/top-products?period=this_month&limit=10`
- [ ] Admin frontend: Ant Design Charts (Line + Bar) render báo cáo
- [ ] Filter theo khoảng ngày tùy chỉnh (DatePicker range)

---

### 📦 Bước 8.3 – Admin: Quản Lý Kho

**Tasks:**
- [ ] `GET /api/v1/admin/inventory` → sản phẩm kèm tồn kho
- [ ] Filter: sắp hết hàng (stock < threshold), hết hàng (stock = 0)
- [ ] Cập nhật tồn kho inline trong bảng (editable cell)
- [ ] Xuất báo cáo tồn kho ra Excel (Laravel Excel)

---

### 📦 Bước 8.4 – Phase 2 Testing & Checklist

**Acceptance Criteria Phase 2:**
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
> **Mục tiêu**: Tối ưu UX, SEO, Performance, Loyalty Points, Email, Mobile

---

## TUẦN 9 – Wishlist & Loyalty Points

### 📦 Bước 9.1 – Wishlist

```bash
php artisan make:migration create_wishlists_table
php artisan make:model Wishlist
php artisan make:controller Api/WishlistController
```

**Tasks:**
- [ ] Migration `wishlists` (user_id, product_id)
- [ ] API: GET (danh sách), POST (thêm), DELETE (xóa)
- [ ] Frontend: Nút ♡ trên ProductCard → toggle thêm/bỏ wishlist
- [ ] Trang `/account/wishlist` hiển thị tất cả sản phẩm đã lưu

### 📦 Bước 9.2 – Loyalty Points (Điểm thưởng)

```bash
php artisan make:migration add_loyalty_points_to_users_table
php artisan make:migration create_loyalty_transactions_table
php artisan make:model LoyaltyTransaction
```

**Rules:**
```
- Mỗi 10.000đ mua hàng = 1 điểm
- 100 điểm = giảm 10.000đ
- Điểm cộng sau khi đơn hàng Hoàn thành
- Điểm trừ khi dùng để thanh toán
```

**Tasks:**
- [ ] Tự động cộng điểm khi đơn hàng chuyển sang `completed`
- [ ] Cho phép dùng điểm để giảm giá khi checkout
- [ ] Trang `/account/points`: lịch sử giao dịch điểm

---

## TUẦN 10 – Email Notifications & SEO

### 📦 Bước 10.1 – Email System

```bash
php artisan make:mail OrderConfirmationMail
php artisan make:mail OrderShippingMail
php artisan make:mail OrderCancelledMail
php artisan make:mail WelcomeMail
```

**Config Mailer:** SMTP (Brevo / SendGrid / Gmail SMTP)

**Emails cần gửi:**
| Trigger | Email |
|---------|-------|
| Đăng ký | Welcome + Xác thực email |
| Đặt hàng thành công | Xác nhận đơn hàng + chi tiết |
| Đơn hàng đang giao | Thông báo vận chuyển + tracking |
| Đơn hàng hủy | Thông báo hủy + lý do |
| Đơn hoàn thành | Mời viết review |

**Tasks:**
- [ ] Thiết kế email template HTML (branding vàng đất)
- [ ] Queue emails với Laravel Queue (không block request)
- [ ] `OrderObserver`: lắng nghe event status change → dispatch mail job
- [ ] Test email với Mailtrap (sandbox)

---

### 📦 Bước 10.2 – SEO Optimization

**Tasks:**
- [ ] `generateMetadata()` cho tất cả trang động (product, category, blog)
- [ ] JSON-LD Schema: `Product`, `BreadcrumbList`, `Article` cho blog
- [ ] `sitemap.xml`: tự động sinh từ sản phẩm + danh mục + blog
- [ ] `robots.txt`: cấu hình đúng
- [ ] Open Graph tags: og:title, og:description, og:image
- [ ] Canonical URL: tránh duplicate content
- [ ] Breadcrumb structured data

---

## TUẦN 11 – Performance & PWA

### 📦 Bước 11.1 – Performance Optimization

**Backend (Laravel):**
- [ ] Cache API responses với Redis (products, categories: TTL 1h)
- [ ] `php artisan config:cache` + `route:cache` + `view:cache` cho production
- [ ] Database indexes: `products.slug`, `products.category_id`, `orders.user_id`
- [ ] Eager loading để tránh N+1 query

**Frontend (Next.js):**
- [ ] `next/image` với `lazy` loading + WebP format + kích thước tối ưu
- [ ] Code splitting: dynamic import cho các component nặng
- [ ] Static generation (SSG) cho trang chủ, danh mục, sản phẩm
- [ ] `React.memo` + `useMemo` tránh re-render không cần thiết
- [ ] Bundle analyzer: `@next/bundle-analyzer`

**Target metrics:**
```
LCP (Largest Contentful Paint) < 2.5s
FID (First Input Delay)        < 100ms
CLS (Cumulative Layout Shift)  < 0.1
```

---

### 📦 Bước 11.2 – Mobile Responsiveness

**Tasks:**
- [ ] Kiểm tra toàn bộ trang trên: 320px, 375px, 425px, 768px, 1024px, 1440px
- [ ] Header mobile: hamburger menu + drawer navigation
- [ ] ProductGrid: 2 cột mobile, 3 cột tablet, 4-5 cột desktop
- [ ] Trang checkout: single column trên mobile
- [ ] Nút "Mua Ngay" fixed bottom trên trang chi tiết sản phẩm (mobile)
- [ ] Touch-friendly: min tap target 44x44px

---

## TUẦN 12 – Admin Advanced & RBAC

### 📦 Bước 12.1 – Phân Quyền RBAC

```bash
# Sử dụng Spatie Permission (đã cài Phase 1)
php artisan make:seeder RolesAndPermissionsSeeder
```

**Roles & Permissions:**
```
Super Admin  → toàn quyền
Admin        → quản lý SP, đơn hàng, khuyến mãi, blog; xem báo cáo
Kho          → xem/cập nhật tồn kho, xem đơn hàng
CSKH         → xem/cập nhật trạng thái đơn hàng, chat support
```

**Tasks:**
- [ ] Seeder tạo roles + permissions
- [ ] Admin UI: trang quản lý role/permission (matrix checkbox)
- [ ] Middleware kiểm tra permission trước mỗi Admin API endpoint
- [ ] Frontend admin: ẩn menu items không có quyền

---

### 📦 Bước 12.2 – Phase 3 Testing & Checklist

**Acceptance Criteria Phase 3:**
- [ ] ✅ Wishlist hoạt động cho user đã đăng nhập
- [ ] ✅ Điểm thưởng cộng/trừ chính xác
- [ ] ✅ Email gửi đúng trigger, đúng template
- [ ] ✅ LCP < 2.5s trên Lighthouse (mobile)
- [ ] ✅ Responsive tốt trên iPhone SE (320px)
- [ ] ✅ SEO score Lighthouse > 90
- [ ] ✅ Phân quyền admin hoạt động đúng

---

# PHASE 4 – ADVANCED (Tùy chọn, Không có timeline cố định)
> **Mục tiêu**: Mở rộng tích hợp, nâng cao nghiệp vụ

---

### 📦 Bước A – Tích Hợp Vận Chuyển

**GHN (Giao Hàng Nhanh) API:**
- [ ] Tính phí ship tự động theo địa chỉ người nhận
- [ ] Tạo đơn vận chuyển tự động khi xác nhận đơn hàng
- [ ] Lấy tracking code + cập nhật trạng thái đơn theo webhook GHN
- [ ] Hiển thị tracking timeline cho người dùng

---

### 📦 Bước B – Chương Trình Đại Lý

- [ ] Bảng `affiliates` (user_id, code, commission_rate)
- [ ] Tracking link giới thiệu: `?ref=ABC123`
- [ ] Tính hoa hồng khi đơn hàng hoàn thành
- [ ] Admin: quản lý đại lý + thanh toán hoa hồng

---

### 📦 Bước C – App Mobile (React Native)

- [ ] Init project Expo (React Native)
- [ ] Tái sử dụng API layer từ Next.js (custom hooks)
- [ ] Screens: Home, Categories, Product Detail, Cart, Checkout, Account
- [ ] Push notification (Expo Notifications)

---

### 📦 Bước D – Multi-Warehouse

- [ ] Bảng `warehouses` (id, name, province)
- [ ] `product_warehouse_stock` (product_id, warehouse_id, quantity)
- [ ] Hiển thị tồn kho theo khu vực người dùng
- [ ] Phân công đơn hàng về kho gần nhất

---

# 📊 TỔNG KẾT TIMELINE

```
PHASE 1 (MVP)
Tuần 1: Setup Laravel + DB Migration + Auth API
Tuần 2: Category API + Product API + Admin Product API
Tuần 3: Cart + Order API + Next.js Frontend Setup
Tuần 4: Header/Footer + Trang chủ + Trang SP + Admin Setup
────────────────────────────────────────────────────────
PHASE 2 (Core Features)
Tuần 5: Flash Sale + Coupon System
Tuần 6: Thanh toán MoMo + VNPAY
Tuần 7: Review System + Blog/CMS
Tuần 8: Search nâng cao + Báo cáo + Quản lý kho
────────────────────────────────────────────────────────
PHASE 3 (Enhancement)
Tuần 9:  Wishlist + Loyalty Points
Tuần 10: Email Notifications + SEO
Tuần 11: Performance + Mobile Responsive
Tuần 12: Admin RBAC + Final Testing
────────────────────────────────────────────────────────
PHASE 4 (Advanced – tùy chọn)
         Vận chuyển GHN/GHTK + Đại lý + App Mobile
```

---

# 🔧 SETUP MÔI TRƯỜNG YÊU CẦU

| Tool | Version |
|------|---------|
| PHP | >= 8.2 |
| Composer | >= 2.x |
| Node.js | >= 20.x (LTS) |
| npm | >= 10.x |
| MySQL | >= 8.0 |
| Redis | >= 7.x |
| Git | >= 2.x |

**Recommended Development Tools:**
- IDE: VS Code + PHP Intelephense + ESLint
- API Testing: Postman hoặc Bruno
- DB Client: TablePlus hoặc DBeaver
- Redis Client: RedisInsight

---

*📅 Tài liệu tạo: 14/09/2026 | Version: 1.0.0*
*🌾 Dự án: Website bán Nông Sản Sạch*
