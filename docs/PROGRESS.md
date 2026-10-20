# 📊 TIẾN ĐỘ DỰ ÁN – WEBSITE BÁN NÔNG SẢN SẠCH

> **File này dùng để team cập nhật tiến độ hàng ngày.**
> Khi hoàn thành một task, đổi `[ ]` → `[x]` và ghi ngày + tên người thực hiện.

**📋 Chi tiết đầy đủ:** xem [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## 🗓️ CẬP NHẬT LẦN CUỐI

| Thông tin | Nội dung |
|-----------|----------|
| **Cập nhật lúc** | 20/10/2026 |
| **Người cập nhật** | AI Pair Programmer |
| **Trạng thái chung** | 🟢 Phase 1–3 hoàn thành về chức năng; thanh toán online ở mức minh hoạ, còn Lighthouse/device test |

---

## 📈 TỔNG QUAN TIẾN ĐỘ

| Phase | Tổng tasks | Hoàn thành | Đang làm | Tiến độ |
|-------|-----------|-----------|---------|---------|
| **Phase 1** – MVP (Tuần 1–4) | 56 | 56 | 0 | 100% |
| **Phase 2** – Core Features (Tuần 5–8) | 28 | 28 | 0 | 100% |
| **Phase 3** – Enhancement (Tuần 9–12) | 50 | 48 | 0 | 96% |
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

## 🔧 HOTFIX & HẠ TẦNG (20/10/2026)

| # | Vấn đề | Cách xử lý | Trạng thái |
|---|--------|-----------|-----------|
| 1 | `DELETE /admin/products/bulk-delete` bị route `{id}` che mất | Đưa route `bulk-delete` lên trước `{id}` + thêm `whereNumber` | ✅ |
| 2 | Giỏ hàng guest bị mất khi đăng nhập | Thêm `POST /cart/sync` + merge localStorage trong `CartContext` | ✅ |
| 3 | File `.env` (chứa credential) bị track trong git | `git rm --cached .env`, cập nhật `.gitignore` | ✅ |
| 4 | Toàn bộ API admin trả 500 `Target class [role] does not exist` | Spatie v8 không tự đăng ký alias → khai báo middleware alias trong `bootstrap/app.php` | ✅ |
| 5 | Giá flash sale chỉ đúng ở endpoint flash-sale, đặt hàng dùng giá cũ | Thêm quan hệ `activeFlashSaleItem` + áp dụng trong `Product::current_price` cho mọi API | ✅ |
| 6 | Guest checkout không gửi `items` nên không đặt được đơn | Checkout gửi kèm `items[]`; server kiểm tra lại variant/giá/tồn kho | ✅ |
| 7 | `make setup` fail do port 6379/3001 bị project khác chiếm | Đổi host port: Redis `6380`, Admin `5002` (container giữ nguyên) | ✅ |
| 8 | Chuẩn hoá URL truy cập frontend/admin | Frontend `5000 → 3000`, Admin `5002 → 3001`; cập nhật CORS, Sanctum, SEO URL, payment return URL và tài liệu | ✅ |
| 9 | Container PHP (UID 1000) không ghi được file mount | Truyền `PHP_UID/PHP_GID` của host qua compose (Makefile tự export) | ✅ |
| 10 | `localhost:5000/5002` trả 502 sau khi recreate frontend/admin | Nginx cache IP cũ của container → dùng Docker DNS resolver `127.0.0.11` + biến upstream để tự phân giải lại | ✅ |
| 11 | Ảnh sản phẩm upload hiển thị ở admin nhưng lỗi trên frontend | Next Image optimizer trong container gọi `localhost` (không phải nginx) → bỏ optimize với ảnh local, cho trình duyệt tải trực tiếp | ✅ |
| 12 | Bổ sung quản lý nhiều ảnh sản phẩm | 1 ảnh chính + tối đa 5 ảnh phụ; admin đặt ảnh chính/xóa ảnh; chi tiết có next/prev và hover zoom | ✅ |

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

- [x] Tạo project Laravel 12 trong thư mục `backend/`
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
- [x] Xử lý upload ảnh: lưu vào `storage/app/public/products/`, tối đa 6 ảnh/sản phẩm (1 chính + 5 phụ), có đặt ảnh chính và xóa ảnh
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

- [x] `app/products/page.tsx`: Sidebar lọc theo danh mục, lọc flash sale, khoảng giá, tìm kiếm, sắp xếp mới nhất / giá tăng / giảm, phân trang
- [x] `app/products/[slug]/page.tsx`: Gallery ảnh chính + thumbnails, nút chuyển ảnh trước/sau, hover zoom ảnh chính, chọn quy cách/biến thể tính giá realtime, bộ đếm số lượng, cam kết chuẩn VietGAP
- [x] Mua ngay chuyển thẳng đến Checkout

### 📦 Bước 4.5 – Giỏ Hàng & Đặt Hàng COD

- [x] `app/cart/page.tsx`: Bảng mặt hàng, tăng/giảm số lượng, xóa sản phẩm, tính toán phí ship (miễn phí từ 300k)
- [x] `app/checkout/page.tsx`: Form thông tin người nhận (tên, SĐT, địa chỉ, ghi chú), chọn phương thức thanh toán (COD / Chuyển khoản ngân hàng)
- [x] `app/orders/[code]/page.tsx`: Trang xác nhận đơn hàng thành công, hiển thị timeline trạng thái đơn, chi tiết thanh toán và sản phẩm
- [x] `app/orders/page.tsx`: Lịch sử đơn hàng của khách (phân trang, trạng thái, hủy đơn, trạng thái đăng nhập)
- [x] `app/login/page.tsx` & `app/register/page.tsx`: Đăng nhập, đăng ký tài khoản khách hàng

### 📦 Bước 4.6 – Khởi tạo Admin Dashboard

- [x] `admin/components/AdminLayoutWrapper.tsx`: Sidebar màu nâu đậm (#2C1A0E), icon điều hướng
- [x] `admin/app/login/page.tsx`: Trang đăng nhập admin riêng biệt (mặc định admin@nongsan.vn)
- [x] `admin/app/page.tsx`: Bảng điều khiển KPI (Tổng doanh thu, Đơn chờ xử lý, Tổng sản phẩm) + Bảng 10 đơn hàng gần nhất
- [x] `admin/app/orders/page.tsx`: Bộ lọc trạng thái đơn, tìm kiếm mã đơn/SĐT, modal xem chi tiết và cập nhật trạng thái đơn (Pending -> Confirmed -> Preparing -> Shipping -> Completed / Cancelled) kèm ghi chú
- [x] `admin/app/products/page.tsx`: Danh sách nông sản, modal thêm/sửa sản phẩm đầy đủ thông tin, upload nhiều ảnh, đặt ảnh chính/xóa từng ảnh, xóa từng sản phẩm và xóa hàng loạt
- [x] `admin/app/categories/page.tsx`: CRUD danh mục nhiều cấp, icon, thứ tự, trạng thái hiển thị

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

- [x] Migration `flash_sales` + `flash_sale_products`
- [x] Model `FlashSale` / `FlashSaleProduct` + scope `running()`
- [x] API `GET /api/v1/products/flash-sale` (kèm `meta.flash_sale` + thời gian kết thúc)
- [x] Giá flash sale áp dụng thống nhất ở mọi API qua `Product::current_price`
- [x] Frontend: `FlashSaleSection` với countdown timer (ngày/giờ/phút/giây)
- [x] Admin: CRUD Flash Sale + thêm/bớt sản phẩm, bật/tắt đợt sale
- [x] Admin API: `GET/POST/PUT/DELETE /api/v1/admin/flash-sales`
- [x] Seeder `FlashSaleSeeder`

### 📦 Bước 5.2 – Coupon System

- [x] Migration `coupons` + `coupon_usages`
- [x] `CouponService` dùng chung cho validate và đặt hàng
- [x] API `POST /api/v1/coupons/validate` (rate limit 30/phút)
- [x] Logic: kiểm tra starts_at, expired_at, usage_limit, user_limit, min_order_amount
- [x] Đặt hàng: server tự tính lại, ghi `coupon_usages`, tăng `used_count`
- [x] Admin: CRUD coupon + thống kê lượt dùng
- [x] Admin API: `GET/POST/PUT/DELETE /api/v1/admin/coupons`
- [x] Frontend: nhập mã trong Cart, hiển thị giảm giá ở Cart + Checkout
- [x] Quy tắc ship tập trung: freeship từ 300.000đ, ngược lại 25.000đ
- [x] Seeder `CouponSeeder` (SALE10, FREESHIP, GIAM20K)

---

## 📅 TUẦN 6 – Thanh Toán Online

### 📦 Bước 6.1 – Tích hợp MoMo

- [x] Khung cấu hình MoMo trong `.env.example` – chế độ minh hoạ, không cần credentials thật
- [x] `PaymentController@createMoMo` (HMAC SHA256, lưu `payment_transactions`)
- [x] `PaymentController@momoIpn` + `momoReturn`: xác thực chữ ký HMAC, idempotent
- [x] Cập nhật `Order.payment_status` = `paid`, ghi log và `paid_at`
- [x] Frontend: tạo URL thanh toán, redirect, nút thanh toán lại và trạng thái chờ xác nhận

### 📦 Bước 6.2 – Tích hợp VNPAY

- [x] Khung cấu hình VNPAY trong `.env.example` – chế độ minh hoạ, không cần credentials thật
- [x] Tạo URL thanh toán với checksum SHA512
- [x] Xử lý Return URL + IPN từ VNPAY, kiểm tra số tiền và trạng thái giao dịch
- [x] Frontend: chuyển hướng cổng VNPAY / hiển thị hướng dẫn thanh toán lại
- [x] Thanh toán online chỉ để tượng trưng: khi chưa cấu hình, hệ thống tạo đơn và hướng dẫn COD/chuyển khoản

---

## 📅 TUẦN 7 – Review System & Blog

### 📦 Bước 7.1 – Review & Rating

- [x] Migration `reviews` + model + quan hệ Product/OrderItem/User
- [x] Chỉ cho phép review khi đơn đã giao/hoàn thành và chưa đánh giá
- [x] API: `GET /api/v1/products/{slug}/reviews` (phân trang, thống kê theo số sao)
- [x] API: `GET /api/v1/products/{slug}/review-eligibility` + `POST /api/v1/products/{slug}/reviews`
- [x] Tự động tính lại `avg_rating` và `review_count` khi duyệt/bỏ duyệt/xóa
- [x] Admin: danh sách chờ duyệt, duyệt/bỏ duyệt, xóa review vi phạm
- [x] Frontend: Form review với star rating + upload tối đa 5 ảnh, danh sách đánh giá

### 📦 Bước 7.2 – Blog / CMS

- [x] Migration `blog_categories` + `blogs`
- [x] API public: danh sách + chi tiết + theo danh mục + tìm kiếm
- [x] Admin: CRUD bài viết với TipTap rich text editor, quản lý danh mục bài viết
- [x] Frontend: Trang `/blog` + `/blog/[slug]` (bài liên quan, phân trang)
- [x] SEO: generateMetadata dynamic, JSON-LD Article, canonical, sitemap

---

## 📅 TUẦN 8 – Search Nâng Cao & Admin Features

### 📦 Bước 8.1 – Tìm Kiếm Nâng Cao

- [x] Chọn Option A (MySQL FULLTEXT) + fallback LIKE, migration index `products_fulltext`
- [x] API `GET /api/v1/products/search?q=...` (hỗ trợ `category`, `limit`)
- [x] Autocomplete với debounce 300ms
- [x] Frontend: Search bar dropdown kết quả gợi ý + xem tất cả kết quả
- [x] `GET /api/v1/products?search=...` cũng áp dụng tìm kiếm FULLTEXT

### 📦 Bước 8.2 – Admin: Báo Cáo Doanh Thu

- [x] API `GET /api/v1/admin/reports/revenue` (doanh thu, số đơn, AOV, sản phẩm bán, chuỗi ngày/tháng)
- [x] API `GET /api/v1/admin/reports/top-products`
- [x] Admin frontend: biểu đồ doanh thu plain CSS, top sản phẩm, xuất CSV
- [x] Filter theo khoảng ngày + preset 7/30/90 ngày

### 📦 Bước 8.3 – Admin: Quản Lý Kho

- [x] API `GET /api/v1/admin/inventory`
- [x] Filter: sắp hết hàng, hết hàng, còn nhiều + ngưỡng cảnh báo
- [x] Cập nhật tồn kho inline (từng sản phẩm hoặc lưu hàng loạt)
- [x] Xuất báo cáo tồn kho ra CSV (mở được bằng Excel, UTF-8 BOM)

### 📦 Bước 8.4 – Phase 2 Acceptance Criteria

- [x] ✅ Flash sale hoạt động với countdown timer
- [x] ✅ Mã giảm giá được validate và áp dụng đúng
- [x] ✅ Thanh toán MoMo / VNPAY: giao diện + luồng xử lý minh hoạ, chưa kết nối cổng thật
- [x] ✅ Người dùng có thể viết review sau khi mua hàng, admin duyệt trước khi hiển thị
- [x] ✅ Blog hiển thị và SEO tốt (metadata động, JSON-LD, sitemap)
- [x] ✅ Tìm kiếm nhanh và có autocomplete (FULLTEXT + debounce 300ms)
- [x] ✅ Admin xem báo cáo doanh thu theo ngày/tháng
- [x] ✅ Admin quản lý kho và cảnh báo hàng sắp hết

---

# PHASE 3 – ENHANCEMENT (Tuần 9–12)

---

## 📅 TUẦN 9 – Wishlist & Loyalty Points

### 📦 Bước 9.1 – Wishlist

- [x] Migration `wishlists` (unique user_id + product_id)
- [x] Model `Wishlist` + quan hệ User/Product
- [x] API: `GET /wishlists`, `GET /wishlists/ids`, `POST /wishlists`, `DELETE /wishlists/{product}`
- [x] Frontend: Nút ♡ trên ProductCard (optimistic toggle, yêu cầu đăng nhập)
- [x] `WishlistContext` + badge số lượng trên Header
- [x] Trang `/account/wishlist`

### 📦 Bước 9.2 – Loyalty Points

- [x] Migration `users.loyalty_points` + `loyalty_transactions`
- [x] `LoyaltyService`: 10.000đ = 1 điểm, 1 điểm = 100đ, tối thiểu 10 điểm
- [x] Tự động cộng điểm khi đơn hàng `completed` (idempotent)
- [x] Hoàn điểm khi hủy đơn, thu hồi điểm khi refund
- [x] Cho phép dùng điểm để giảm giá khi checkout (server kiểm tra số dư)
- [x] API `GET /loyalty` + trang `/account/points`: lịch sử giao dịch điểm

---

## 📅 TUẦN 10 – Email Notifications & SEO

### 📦 Bước 10.1 – Email System

- [x] Thiết kế email template HTML (branding vàng đất): layout dùng chung + 5 mẫu mail
- [x] Queue emails với Laravel Queue (`ShouldQueue`, Redis queue)
- [x] `OrderObserver`: nghe `created`/`updated` → dispatch mail sau khi transaction commit
- [x] Mail: Welcome, Order Confirmation, Shipping, Cancelled, Completed
- [x] Test email với Mailpit (xác nhận đủ 4 trigger + welcome)

### 📦 Bước 10.2 – SEO Optimization

- [x] `generateMetadata()` cho trang chủ, danh sách sản phẩm, chi tiết sản phẩm
- [x] JSON-LD Schema: `Product`, `BreadcrumbList`, `Organization` + `WebSite`
- [x] JSON-LD `Article` cho chi tiết bài viết blog
- [x] `sitemap.xml` tự động sinh từ sản phẩm + danh mục + bài viết blog
- [x] `robots.txt` cấu hình đúng (chặn cart/checkout/account/orders)
- [x] Open Graph tags (title, description, image 1200×630)
- [x] Canonical URL cho trang chủ, danh sách, chi tiết sản phẩm và blog

---

## 📅 TUẦN 11 – Performance & Mobile

### 📦 Bước 11.1 – Performance Optimization

**Backend:**
- [x] Cache API responses với Redis (categories 1h; featured 10 phút; flash sale 5 phút; tự xóa cache khi SP/Flash Sale thay đổi)
- [x] Config/route/view cache cho production (`make optimize` / `make optimize-clear`)
- [x] Database indexes: slug/category_id/user_id (đã có) + `products(is_active, created_at)`, `products.sold_count`, `banners(is_active, sort_order)`
- [x] Eager loading tránh N+1 (admin orders dùng `withCount('items')`)

**Frontend:**
- [x] `next/image` với lazy loading + WebP (ProductCard, gallery, cart)
- [x] Code splitting: dynamic import `FlashSaleSection`
- [x] Static generation / ISR: trang chủ (300s), danh sách (60s), chi tiết SP (600s)
- [x] `React.memo` cho `ProductCard` + `useMemo` cho WishlistContext
- [x] Bundle analyzer: `npm run analyze` / `make analyze-fe`

### 📦 Bước 11.2 – Mobile Responsiveness

- [!] Kiểm tra trên 320px, 375px, 425px, 768px, 1024px, 1440px – **chưa test trên thiết bị thật/DevTools**
- [x] Header mobile: hamburger menu + drawer navigation
- [x] ProductGrid responsive (2 cột mobile → auto-fill tablet/desktop)
- [x] Trang checkout: single column trên mobile
- [x] Nút "Mua Ngay" fixed bottom trên trang chi tiết sản phẩm (mobile)
- [x] Touch-friendly: CTA chính + nút mobile min 44px

---

## 📅 TUẦN 12 – Admin Advanced & RBAC

### 📦 Bước 12.1 – Phân Quyền RBAC

- [x] Seeder roles + permissions: Super Admin, Admin, Kho (warehouse), CSKH (support), Nhân viên, Khách hàng
- [x] Admin UI `/roles`: matrix checkbox theo nhóm quyền, lưu từng vai trò
- [x] Middleware `permission:*` cho toàn bộ Admin API + alias `role`/`permission` trong `bootstrap/app.php`
- [x] Frontend admin: ẩn menu + nút thao tác không có quyền; chặn role ngoài danh sách khi đăng nhập

### 📦 Bước 12.2 – Phase 3 Acceptance Criteria

- [x] ✅ Wishlist hoạt động cho user đã đăng nhập (thêm/xóa/đồng bộ icon)
- [x] ✅ Điểm thưởng cộng/trừ chính xác (13 điểm cho đơn 139.000đ; hoàn điểm khi hủy)
- [x] ✅ Email gửi đúng trigger, đúng template (xác nhận qua Mailpit)
- [!] ⏳ LCP < 2.5s trên Lighthouse (mobile) – **chưa chạy Lighthouse**
- [!] ⏳ Responsive tốt trên iPhone SE (320px) – **đã có CSS breakpoint 320/640/768/900 nhưng chưa test thiết bị thật**
- [!] ⏳ SEO score Lighthouse > 90 – **chưa chạy Lighthouse**
- [x] ✅ Phân quyền admin hoạt động đúng (warehouse bị 403 khi tạo SP/quản lý role)

> **Ghi chú Phase 3:**
> - Wishlist: `wishlists` + `WishlistContext` (optimistic toggle), badge Header, trang `/account/wishlist`.
> - Loyalty: 10.000đ = 1 điểm, 1 điểm = 100đ, tối thiểu 10 điểm; `loyalty_transactions` lưu earn/redeem/refund/adjust.
> - Email queue qua Redis; Mailpit dùng để kiểm thử.
> - SEO: metadata động, JSON-LD Product/Breadcrumb/Organization/Article, sitemap + robots.
> - RBAC: super-admin (toàn bộ quyền), admin, warehouse, support được cập nhật thêm quyền categories/reviews/blogs; menu admin ẩn theo quyền.
> - Thanh toán online: giữ ở mức tượng trưng/minh hoạ, không cần cấu hình `MOMO_*` / `VNPAY_*`.

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
| 20/10/2026 | AI | Fix 4 bug Phase 1 (bulk-delete, guest cart, `.env` tracked, middleware `role`) + 2 bug giá/checkout. |
| 20/10/2026 | AI | Hạ tầng: đổi host port Redis → 6380, Admin → 5002, Frontend → 5000; container dùng UID/GID host; `make setup` chạy thành công, 8/8 container Up. |
| 20/10/2026 | AI | Hoàn thành Tuần 5 Phase 2: Flash Sale (migrations, models, API, countdown, admin CRUD) + Coupon (migrations, service, validate, usage tracking, admin CRUD, UI Cart/Checkout). |
| 20/10/2026 | AI | Verify: PHP lint OK, route list OK, `tsc --noEmit` sạch (frontend + admin), test API end-to-end (guest order, coupon limit, cart sync, admin CRUD). |
| 20/10/2026 | AI | Phase 3 Tuần 9: Wishlist (API + context + trang account) và Loyalty Points (tích/hoàn/thu hồi điểm, dùng điểm khi checkout, trang lịch sử). |
| 20/10/2026 | AI | Phase 3 Tuần 10: 5 email template + queue + OrderObserver; SEO metadata động, JSON-LD, sitemap, robots, OG, canonical. |
| 20/10/2026 | AI | Phase 3 Tuần 11: Redis cache + indexes + eager loading; next/image, dynamic import, ISR, bundle analyzer, React.memo; mobile drawer, grid 2 cột, checkout 1 cột, sticky Mua Ngay. |
| 20/10/2026 | AI | Phase 3 Tuần 12: RBAC đầy đủ (roles/permissions seeder, API quản lý quyền, middleware permission, trang `/roles`, ẩn menu/nút theo quyền). |
| 20/10/2026 | AI | Rà soát & bổ sung Phase 1: trang `/orders`, lọc khoảng giá + phân trang sản phẩm, admin sửa SP/upload ảnh/xóa hàng loạt, CRUD danh mục. |
| 20/10/2026 | AI | Bổ sung Phase 2 Tuần 6–8: MoMo/VNPAY + `payment_transactions`, review & duyệt review, blog/CMS + TipTap, FULLTEXT autocomplete, báo cáo doanh thu, quản lý tồn kho/CSV. |
| 20/10/2026 | AI | Verify: PHP lint, route cache, `tsc --noEmit`, `next build` (frontend + admin), smoke test API/CRUD/trang mới; thêm seeder review mẫu. |
| 20/10/2026 | AI | Chốt thanh toán online ở mức tượng trưng/minh hoạ, không yêu cầu credentials sandbox; cập nhật UI và tài liệu. |
| 20/10/2026 | AI | Chuẩn hoá URL truy cập: Frontend `http://localhost:5000`, Admin `http://localhost:5002`; cập nhật Docker port mapping, CORS, Sanctum, SEO và tài liệu. |
| 20/10/2026 | AI | Fix 502 Bad Gateway sau khi recreate container: nginx dùng Docker DNS resolver thay vì cache IP upstream lúc khởi động. |
| 20/10/2026 | AI | Fix ảnh upload không hiển thị trên frontend: bỏ Next Image optimizer cho URL `localhost`, giữ optimize cho ảnh remote. |
| 20/10/2026 | AI | Bổ sung gallery nhiều ảnh: ảnh chính + tối đa 5 ảnh phụ, đặt/xóa ảnh trong admin, next/prev và hover zoom ở trang chi tiết. |
| 20/10/2026 | AI | Cải thiện upload ảnh admin: thêm nhiều ô ảnh, chọn nhiều lần để cộng dồn, xem trước và bỏ chọn trước khi lưu. |

---

*📅 Tạo: 14/09/2026 | Cập nhật: 20/10/2026*
*🌾 Dự án: Website bán Nông Sản Sạch*
