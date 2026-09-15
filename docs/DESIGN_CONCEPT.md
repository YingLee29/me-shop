# 🌾 THIẾT KẾ WEBSITE BÁN NÔNG SẢN SẠCH
> **Ý tưởng & Kiến trúc hệ thống tổng thể**

---

## 📋 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Bảng màu & Design Token](#3-bảng-màu--design-token)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Cấu trúc dự án](#5-cấu-trúc-dự-án)
6. [Trang Website Chính (Frontend)](#6-trang-website-chính-frontend)
7. [Trang Admin Dashboard](#7-trang-admin-dashboard)
8. [API Backend – Laravel](#8-api-backend--laravel)
9. [Database Schema](#9-database-schema)
10. [Lộ trình phát triển](#10-lộ-trình-phát-triển)

---

## 1. TỔNG QUAN DỰ ÁN

### 🎯 Mục tiêu
Xây dựng hệ thống thương mại điện tử bán **nông sản sạch** chuyên nghiệp, bao gồm:
- **Website bán hàng (B2C)**: Giao diện thân thiện, tốc độ cao, tối ưu SEO
- **Trang quản trị (Admin Dashboard)**: Quản lý toàn diện hàng hóa, đơn hàng, khách hàng

### 🏪 Các tính năng cốt lõi

| Nhóm | Tính năng |
|------|-----------|
| **Sản phẩm** | Danh mục đa cấp, biến thể sản phẩm (trọng lượng/đơn vị), ảnh gallery |
| **Mua sắm** | Giỏ hàng, wishlist, so sánh sản phẩm, tìm kiếm nâng cao |
| **Đơn hàng** | COD, chuyển khoản, Momo/VNPAY, theo dõi đơn hàng real-time |
| **Khuyến mãi** | Mã giảm giá, flash sale, freeship, combo sản phẩm |
| **Người dùng** | Đăng ký/đăng nhập, lịch sử mua hàng, điểm thưởng |
| **Nội dung** | Blog nông sản, kiến thức sức khỏe, chứng nhận VietGAP |
| **Admin** | Quản lý kho, báo cáo doanh thu, phân quyền nhân viên |

---

## 2. CÔNG NGHỆ SỬ DỤNG

### Stack kỹ thuật

```
FRONTEND
  Next.js 14 (App Router) + React 18 + TypeScript
  Ant Design 5.x | Bootstrap 5 | SCSS
  Axios | React Query | Zustand (state management)
  Framer Motion (animation) | Swiper.js (slider)

BACKEND
  PHP Laravel 11 (API Server)
  Laravel Sanctum (Authentication / JWT)
  Spatie Permissions (Phân quyền role/permission)
  Laravel Scout + Meilisearch (Tìm kiếm full-text)
  Laravel Horizon + Queue (Xử lý async jobs)

DATABASE & STORAGE
  MySQL 8.x (Primary Database)
  Redis (Cache, Session, Queue)
  Cloudinary / MinIO (Image & File Storage)
```

### Lý do chọn công nghệ

| Công nghệ | Lý do |
|-----------|-------|
| **Next.js 14** | SSR/SSG tối ưu SEO trang sản phẩm, tốc độ tải nhanh |
| **Laravel 11** | Framework PHP mạnh mẽ, hệ sinh thái phong phú, dễ mở rộng |
| **Ant Design** | Bộ UI component phong phú, phù hợp cho Admin Dashboard |
| **Bootstrap 5** | Grid system linh hoạt, responsive tốt cho frontend |
| **Laravel Sanctum** | Xác thực API đơn giản, bảo mật cho SPA |
| **Redis** | Cache sản phẩm, session, hàng đợi xử lý đơn hàng |

---

## 3. BẢNG MÀU & DESIGN TOKEN

### 🎨 Color Palette – Tông Vàng Đất (Earth Tone)

```css
/* ===== PRIMARY COLORS ===== */
--color-primary:       #C8A45A;   /* Vàng đất chủ đạo */
--color-primary-dark:  #A0783A;   /* Vàng đất đậm – hover/active */
--color-primary-light: #E8C98A;   /* Vàng đất nhạt – accent */

/* ===== SECONDARY / EARTH TONES ===== */
--color-brown:         #6B4226;   /* Nâu đất đậm */
--color-brown-mid:     #8B5A2B;   /* Nâu trung */
--color-beige:         #F5EDD6;   /* Be nhạt – background page */
--color-cream:         #FAF6EC;   /* Kem trắng – card background */
--color-sand:          #D4B896;   /* Cát vàng – divider/border */

/* ===== NEUTRAL ===== */
--color-dark:          #2C1A0E;   /* Nâu rất đậm – text heading */
--color-gray-dark:     #5C4A3A;   /* Xám nâu – text body */
--color-gray-mid:      #9A8878;   /* Xám trung – placeholder */
--color-gray-light:    #E8E0D5;   /* Xám nhạt – border, divider */
--color-white:         #FFFFFF;

/* ===== FUNCTIONAL ===== */
--color-success:       #4CAF50;   /* Xanh lá – trạng thái OK */
--color-danger:        #E53935;   /* Đỏ – giá giảm, cảnh báo */
--color-info:          #1976D2;   /* Xanh dương – thông báo */
--color-warning:       #F9A825;   /* Vàng cam – cảnh báo */

/* ===== GRADIENTS ===== */
--gradient-primary:    linear-gradient(135deg, #C8A45A 0%, #A0783A 100%);
--gradient-hero:       linear-gradient(180deg, #FAF6EC 0%, #F5EDD6 100%);
--gradient-navbar:     linear-gradient(90deg, #A0783A 0%, #8B5A2B 100%);
```

### 🔤 Typography

```css
/* Font chính – Google Fonts */
--font-heading:  'Playfair Display', serif;    /* Tiêu đề – sang trọng */
--font-body:     'Be Vietnam Pro', sans-serif; /* Nội dung – dễ đọc */
--font-accent:   'Dancing Script', cursive;    /* Tagline, slogan */

/* Scale */
--text-xs:    0.75rem;   /* 12px */
--text-sm:    0.875rem;  /* 14px */
--text-base:  1rem;      /* 16px */
--text-lg:    1.125rem;  /* 18px */
--text-xl:    1.25rem;   /* 20px */
--text-2xl:   1.5rem;    /* 24px */
--text-3xl:   1.875rem;  /* 30px */
--text-4xl:   2.25rem;   /* 36px */
--text-5xl:   3rem;      /* 48px */
```

### 📐 Spacing & Shadows

```css
/* Border Radius */
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-full: 9999px;

/* Shadows – Warm tone */
--shadow-card:   0 2px 12px rgba(168, 120, 58, 0.12);
--shadow-hover:  0 8px 24px rgba(168, 120, 58, 0.22);
--shadow-header: 0 2px 8px rgba(44, 26, 14, 0.10);
```

---

## 4. KIẾN TRÚC HỆ THỐNG

```
┌──────────────────────────────────────────────────────┐
│                     NGƯỜI DÙNG                        │
│   Khách hàng (Browser)    Nhân viên/Admin (Browser)   │
└───────────┬──────────────────────────┬───────────────┘
            │                          │
            ▼                          ▼
┌───────────────────┐      ┌───────────────────────┐
│  Next.js Frontend │      │  Next.js Admin Panel  │
│  (Port 3000)      │      │  (Port 3001)           │
│  /app/shop/*      │      │  /app/admin/*          │
└─────────┬─────────┘      └──────────┬────────────┘
          │                           │
          └───────────┬───────────────┘
                      │  HTTPS / REST API
                      ▼
          ┌───────────────────────┐
          │   Laravel API Server  │
          │   (Port 8000)         │
          │   /api/v1/*           │
          └───────────┬───────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      ┌───────┐   ┌───────┐  ┌────────┐
      │ MySQL │   │ Redis │  │  S3 /  │
      │  DB   │   │ Cache │  │ MinIO  │
      └───────┘   └───────┘  └────────┘
```

---

## 5. CẤU TRÚC DỰ ÁN

```
my-shop/
├── backend/                         Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── CouponController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   └── BlogController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── DashboardController.php
│   │   │   │       ├── ProductManageController.php
│   │   │   │       ├── OrderManageController.php
│   │   │   │       ├── UserManageController.php
│   │   │   │       ├── InventoryController.php
│   │   │   │       └── ReportController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── AdminMiddleware.php
│   │   │   │   └── RoleMiddleware.php
│   │   │   └── Resources/           API Resource Transformers
│   │   ├── Models/
│   │   │   ├── User.php, Product.php, Category.php
│   │   │   ├── Order.php, OrderItem.php, Cart.php
│   │   │   ├── Coupon.php, Review.php, Blog.php
│   │   └── Services/                Business Logic
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       ├── api.php                  Public API routes
│       └── admin.php                Admin API routes
│
├── frontend/                        Next.js – Website bán hàng
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── page.tsx             Trang chủ
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         Danh sách sản phẩm
│   │   │   │   └── [slug]/page.tsx  Chi tiết sản phẩm
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   └── about/page.tsx
│   │   └── (auth)/
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   ├── components/
│   │   ├── layout/    Header, Footer, Navbar, Sidebar
│   │   ├── product/   ProductCard, ProductGrid, ProductDetail, Filter
│   │   ├── home/      HeroBanner, CategorySection, FlashSale, TrustBadges
│   │   └── ui/        Button, Badge, RatingStars, PriceDisplay
│   └── styles/
│       ├── globals.css
│       ├── variables.css
│       └── components.css
│
└── admin/                           Next.js – Admin Dashboard
    ├── app/
    │   ├── dashboard/page.tsx
    │   ├── products/
    │   │   ├── page.tsx             Danh sách sản phẩm
    │   │   ├── create/page.tsx
    │   │   └── [id]/edit/page.tsx
    │   ├── orders/page.tsx
    │   ├── customers/page.tsx
    │   ├── categories/page.tsx
    │   ├── inventory/page.tsx
    │   ├── promotions/page.tsx
    │   ├── blogs/page.tsx
    │   ├── reports/page.tsx
    │   └── settings/page.tsx
    └── components/
        ├── layout/AdminLayout.tsx
        ├── charts/RevenueChart.tsx
        └── tables/DataTable.tsx
```

---

## 6. TRANG WEBSITE CHÍNH (FRONTEND)

### 6.1 🏠 Trang Chủ (Homepage)

#### Bố cục tổng thể (từ trên xuống)

```
TOPBAR    [bg: #C8A45A]
          Freeship COD đơn 199k | Giảm 10% Tổng Hóa Đơn | Hotline

HEADER    [bg: white, shadow]
          Logo (trái) | Thanh tìm kiếm (giữa) | Tài khoản + Giỏ hàng (phải)

NAVBAR    [bg: #A0783A gradient]
          ≡ Chuyên Mục ▾ | Trang Chủ | Giới Thiệu | Danh Mục | Blog | Liên Hệ

HERO BANNER
          Slider 3 slide với overlay text và CTA button
          Slide 1: Ưu đãi đặc biệt – Tiết Kiệm Hơn
          Slide 2: Rau củ sạch Đà Lạt mùa mới
          Slide 3: Chương trình đại lý

TRUST BADGES
          [✓ Nông sản sạch] [✓ Chất lượng VietGAP] [✓ Giao nhanh 2h] [✓ Đổi trả 24h]

DANH MỤC NỔI BẬT  (6 icon card theo hàng ngang)
          🥬 Rau Củ | 🌾 Đồ Khô | 🌿 Dược Liệu | 🍎 Trái Cây | 🧄 Hạt Giống | 🎁 Quà Tặng

FLASH SALE   [Header đỏ + countdown timer]
          Carousel sản phẩm có thể scroll ngang

PRODUCT SECTIONS  (mỗi section)
          Header: Tên nhóm + tab filter + link "Xem thêm"
          Grid 5 cột x 2 hàng sản phẩm

          ─ Rau Củ Sạch Đà Lạt  (Nấm | Rau Rừng | Rau Sạch)
          ─ Rau Củ Sạch         (Đặc Sản | Rau Sạch | Rau Rừng)
          ─ Đặc Sản Vùng Miền   (Đồ Ngâm Rượu | Mật Ong | Trái Sấy)
          ─ Hoa Quả Nội Địa     (Hoa Quả | Hoa Quả Sạch)

CHỨNG NHẬN & TRUYỀN THÔNG
          Logo: VietGAP | OCOP | Báo 24h | Pháp Luật | Thời Đại | Dân Trí

BLOG NỔI BẬT  (grid 3 cột)

ĐỊA CHỈ CHI NHÁNH
          Map + thông tin 4 chi nhánh (Hà Nội x2, HCM x1, Xưởng)

FOOTER
          Logo + địa chỉ | Hỗ trợ khách hàng | Về chúng tôi | CSKH | Social
```

#### Chi tiết Header

```
┌─────────────────────────────────────────────────────────┐
│ TOPBAR (bg: #C8A45A)                                    │
│  🚚 Freeship COD đơn 199k  |  Giảm 10% Tổng Hóa Đơn   │
├─────────────────────────────────────────────────────────┤
│ HEADER (bg: white)                                       │
│  ┌──────────┐  ┌────────────────────────────┐  ┌──────┐ │
│  │  LOGO    │  │  🔍  Tìm kiếm sản phẩm...  │  │👤 🛒│ │
│  │ (70px)   │  │  (border: #C8A45A, round)  │  │      │ │
│  └──────────┘  └────────────────────────────┘  └──────┘ │
├─────────────────────────────────────────────────────────┤
│ NAVBAR (gradient: #A0783A → #8B5A2B)                    │
│  [≡ Chuyên Mục ▾]  Trang Chủ  Giới Thiệu ▾            │
│  Danh Mục ▾  Quà Biếu Tết  Kiến Thức  Đại Lý  Liên Hệ │
└─────────────────────────────────────────────────────────┘
```

---

### 6.2 🛍️ Trang Danh Sách Sản Phẩm

```
Breadcrumb: Trang Chủ > Rau Củ > Đồ Khô

┌─────────────────┬──────────────────────────────────────┐
│  SIDEBAR (25%)  │   NỘI DUNG CHÍNH (75%)               │
│                 │                                        │
│  KHU VỰC        │  [HEADER SECTION]                     │
│  ○ Hà Nội (167) │  "Đồ Khô"                            │
│  ○ HCM   (167)  │  Sắp xếp: [Mặc định][Phổ biến][Mới] │
│                 │            [Giá tăng][Giá giảm]       │
│  KHOẢNG GIÁ     │                                        │
│  [min]──●──[max]│  PRODUCT GRID (4 cột trên desktop)   │
│  10k – 2.000k   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│                 │  │ P1 │ │ P2 │ │ P3 │ │ P4 │         │
│  DANH MỤC       │  └────┘ └────┘ └────┘ └────┘         │
│  > Bột các loại │  ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  > Cá biển      │  │ P5 │ │ P6 │ │ P7 │ │ P8 │         │
│  > Chà các loại │  └────┘ └────┘ └────┘ └────┘         │
│  > Đặc sản HG   │                                        │
│  > Đồ Khô [✓]  │  PHÂN TRANG                           │
│  > ...          │  ◀ 1  2  3  ...  8  ▶                 │
│                 │                                        │
│  ĐÁNH GIÁ       │                                        │
│  ★★★★★ (5)      │                                        │
│  ★★★★☆ (4+)     │                                        │
└─────────────────┴──────────────────────────────────────┘
```

#### Product Card

```
┌──────────────────────────────────┐
│  [-32%]                    [♡]   │  badge % giảm + wishlist
│  ┌──────────────────────────┐    │
│  │                          │    │
│  │     ẢNH SẢN PHẨM        │    │  hover: zoom + overlay "Xem nhanh"
│  │     (aspect 1:1)         │    │
│  │                          │    │
│  └──────────────────────────┘    │
│                                  │
│  Ba Kích Tím Khô Rút Lõi        │  font: Be Vietnam Pro, 2 dòng
│                                  │
│  ~~699.000đ~~  120.000đ         │  giá gốc gạch ngang + giá bán đỏ
│                                  │
│  [      MUA NGAY      ]          │  btn: bg #C8A45A → hover #A0783A
└──────────────────────────────────┘
```

---

### 6.3 📦 Trang Chi Tiết Sản Phẩm

```
Breadcrumb: Trang Chủ > Đồ Khô > Ba Kích Tím Khô Rút Lõi

┌──────────────────────────┬──────────────────────────────┐
│   GALLERY ẢNH (45%)      │   THÔNG TIN SẢN PHẨM (55%)  │
│                           │                              │
│  ┌────────────────────┐   │   Ba Kích Tím Khô Rút Lõi   │
│  │                    │   │   Mã: SP-0023 | ✓ Còn hàng  │
│  │   ẢNH CHÍNH        │   │                              │
│  │   (500x500px)      │   │   ⭐⭐⭐⭐⭐ 4.9 (89 đánh giá)│
│  │                    │   │                              │
│  └────────────────────┘   │   ~~699.000đ~~               │
│                           │   **120.000đ** / 500g        │
│  [🖼] [🖼] [🖼] [🖼]      │   Tiết kiệm: 579k (-83%)    │
│  (thumbnail gallery)      │                              │
│                           │   TRỌNG LƯỢNG:               │
│                           │   [250g] [500g] [1kg]        │
│                           │                              │
│                           │   Số lượng:  [−]  [1]  [+]  │
│                           │                              │
│                           │   [🛒 THÊM VÀO GIỎ HÀNG]    │
│                           │   [⚡ MUA NGAY – ĐẶT HÀNG]   │
│                           │                              │
│                           │   ─────────────────────      │
│                           │   ✅ Freeship nội thành HN   │
│                           │   ✅ Đổi trả trong 24h       │
│                           │   ✅ Hàng VietGAP chứng nhận │
│                           │   📞 Hotline: 0866.918.366   │
├──────────────────────────┴──────────────────────────────┤
│  [Tab] Mô Tả Chi Tiết | Thông Số | Đánh Giá (89)        │
│  Nội dung rich text / bảng so sánh / danh sách reviews  │
├─────────────────────────────────────────────────────────┤
│  SẢN PHẨM TƯƠNG TỰ / THƯỜNG MUA CÙNG                   │
│  [P1] [P2] [P3] [P4] [P5]   →                           │
└─────────────────────────────────────────────────────────┘
```

---

### 6.4 🛒 Giỏ Hàng & Thanh Toán

**Trang Giỏ Hàng:**

```
┌─────────────────────────────────────┬──────────────────┐
│  GIỎ HÀNG (3 sản phẩm)              │  TÓM TẮT ĐƠN     │
│                                      │                  │
│  ┌─────┬──────────────┬────┬──────┐  │  Tạm tính:       │
│  │ Ảnh │  Tên SP      │ SL │Giá  │  │  350.000đ        │
│  ├─────┼──────────────┼────┼──────┤  │                  │
│  │ 🖼  │ Ba Kích Tím  │[−1+]│120k │  │  Phí giao hàng:  │
│  │ 🖼  │ Rau Muống    │[−2+]│ 45k │  │  Miễn phí ✓     │
│  │ 🖼  │ Gạo ST25     │[−1+]│ 80k │  │                  │
│  └─────┴──────────────┴────┴──────┘  │  Giảm giá: -0đ   │
│                                      │  ────────────    │
│  [Mã giảm giá: _________] [Áp dụng] │  Tổng: 350.000đ  │
│                                      │                  │
│  [← Tiếp tục mua sắm]               │  [THANH TOÁN →]  │
└─────────────────────────────────────┴──────────────────┘
```

**Quy trình Checkout (Multi-step):**

```
Bước 1: Thông tin giao hàng
  Họ tên | SĐT | Email
  Tỉnh/Thành phố [dropdown] → Quận/Huyện → Phường/Xã
  Địa chỉ cụ thể | Ghi chú

Bước 2: Phương thức vận chuyển
  ○ Giao nhanh 2h (nội thành) – 30.000đ
  ○ Giao hàng tiêu chuẩn (1-2 ngày) – 20.000đ
  ○ Freeship (đơn từ 199k)

Bước 3: Phương thức thanh toán
  ○ COD – Thanh toán khi nhận hàng
  ○ Chuyển khoản ngân hàng
  ○ Ví MoMo
  ○ VNPAY QR

Bước 4: Xác nhận đơn hàng
  [Tóm tắt sản phẩm + địa chỉ + tổng tiền]
  [ĐẶT HÀNG NGAY]
```

---

### 6.5 👤 Trang Tài Khoản Khách Hàng

```
Sidebar menu cá nhân:
  👤 Hồ sơ cá nhân
  📦 Đơn hàng của tôi
  ❤️ Sản phẩm yêu thích
  🎁 Điểm thưởng
  📍 Địa chỉ giao hàng
  🔒 Đổi mật khẩu
```

---

### 6.6 📰 Blog / Kiến Thức Nông Sản

Grid 3 cột với:
- Thumbnail 16:9 + overlay category tag
- Tiêu đề, mô tả ngắn, ngày đăng, tác giả
- Bộ lọc: Sức khỏe | Công thức nấu ăn | Kiến thức nông sản | Tin tức

---

## 7. TRANG ADMIN DASHBOARD

### 7.1 🖥️ Layout Admin

```
┌────────────────────────────────────────────────────────┐
│  TOPBAR ADMIN  [bg: #2C1A0E]                           │
│  🌾 NôngSản Admin  ──────────  🔔  👤 Admin ▾         │
├─────────────────┬──────────────────────────────────────┤
│                 │                                        │
│  SIDEBAR        │           NỘI DUNG CHÍNH              │
│  [bg: #3D2010]  │                                        │
│  (240px)        │                                        │
│                 │                                        │
│  📊 Dashboard   │                                        │
│  ─────────────  │                                        │
│  📦 Sản Phẩm    │                                        │
│    > Danh sách  │                                        │
│    > Thêm mới   │                                        │
│    > Danh mục   │                                        │
│  ─────────────  │                                        │
│  🛒 Đơn Hàng    │                                        │
│  ─────────────  │                                        │
│  👥 Khách Hàng  │                                        │
│  ─────────────  │                                        │
│  🏷️ Khuyến Mãi  │                                        │
│    > Mã giảm giá│                                        │
│    > Flash Sale │                                        │
│  ─────────────  │                                        │
│  📰 Blog/CMS    │                                        │
│  ─────────────  │                                        │
│  📈 Báo Cáo     │                                        │
│  ─────────────  │                                        │
│  ⚙️ Cài Đặt     │                                        │
└─────────────────┴──────────────────────────────────────┘
```

**Theme Admin**: Background tổng thể `#FAF6EC`, sidebar `#2C1A0E`, accent `#C8A45A`. Sử dụng Ant Design components (Table, Form, Modal, Charts).

---

### 7.2 📊 Dashboard Overview

**Stat Cards hàng đầu (4 cards):**

| Card | Chỉ số | Màu accent |
|------|--------|------------|
| Doanh thu hôm nay | 45.200.000đ | Vàng đất |
| Đơn hàng hôm nay | 127 | Xanh lá |
| Khách hàng mới | 23 | Xanh dương |
| Sản phẩm sắp hết | 8 | Đỏ cam |

**Biểu đồ:**
- **Line Chart**: Doanh thu 30 ngày gần nhất
- **Bar Chart**: Top 10 sản phẩm bán chạy tháng này
- **Donut Chart**: Tỷ lệ danh mục theo doanh thu

**Bảng nhanh:**
- Đơn hàng mới nhất (10 đơn) với status chip
- Sản phẩm sắp hết hàng (tồn kho < ngưỡng)

---

### 7.3 📦 Quản Lý Sản Phẩm

**Danh sách sản phẩm** (Ant Design Table):

| Cột | Nội dung |
|-----|----------|
| Ảnh | Thumbnail 60x60 |
| Tên sản phẩm | Tên + SKU (sub text) |
| Danh mục | Tag pill |
| Giá bán | Giá hiển thị |
| Kho | Số lượng + progress bar |
| Trạng thái | Switch (Hiển thị / Ẩn) |
| Thao tác | Sửa / Xem / Xóa |

**Toolbar**: Tìm kiếm | Lọc theo danh mục | Lọc trạng thái | Thêm sản phẩm | Export Excel

**Form Thêm/Sửa Sản Phẩm:**
- Tab 1: Thông tin cơ bản (Tên, Slug, Danh mục, Mô tả ngắn)
- Tab 2: Mô tả chi tiết (WYSIWYG Editor – TipTap/Quill)
- Tab 3: Hình ảnh (Upload nhiều ảnh, drag & drop sort, đặt ảnh chính)
- Tab 4: Giá & Kho (Giá gốc, Giá bán, Kho, SKU, Ngưỡng cảnh báo)
- Tab 5: Biến thể (Trọng lượng: 300g/500g/1kg với giá riêng cho từng loại)
- Tab 6: SEO (Meta title, meta description, og:image)

---

### 7.4 🛒 Quản Lý Đơn Hàng

**Luồng trạng thái:**

```
Chờ xác nhận ──▶ Đã xác nhận ──▶ Đang đóng gói ──▶ Đang giao ──▶ Đã giao ──▶ Hoàn thành
      │                                                                              │
      └──────────────────────────── Hủy đơn / Hoàn trả ◀───────────────────────────┘
```

**Status chips màu sắc:**
- 🟡 Chờ xác nhận | 🔵 Đã xác nhận | 🟠 Đóng gói | 🔷 Đang giao | 🟢 Hoàn thành | 🔴 Hủy

**Chi tiết đơn hàng:**
- Timeline trạng thái đơn hàng (vertical stepper)
- Thông tin người mua, địa chỉ giao hàng
- Bảng sản phẩm (ảnh, tên, đơn giá, SL, thành tiền)
- Tóm tắt: Tạm tính / Phí ship / Giảm giá / Tổng
- Ghi chú nội bộ (admin only, không hiển thị với khách)
- Actions: Xác nhận | In phiếu giao | Cập nhật trạng thái | Hủy đơn

---

### 7.5 📈 Báo Cáo & Thống Kê

| Module | Nội dung |
|--------|----------|
| **Doanh thu** | Theo ngày/tuần/tháng/năm, so sánh kỳ trước, export Excel |
| **Sản phẩm** | Top bán chạy, sản phẩm tồn kho thấp, tỷ lệ trả hàng |
| **Khách hàng** | Khách mới vs quay lại, phân khúc RFM, LTV |
| **Kho hàng** | Tồn kho hiện tại, nhập xuất theo tháng, cảnh báo |
| **Khuyến mãi** | Tỷ lệ sử dụng coupon, ROI từng chiến dịch |

---

### 7.6 ⚙️ Các Module Admin Khác

| Module | Tính năng chính |
|--------|----------------|
| **Khách hàng** | Danh sách, chi tiết, lịch sử đơn, điểm thưởng, ghi chú |
| **Danh mục** | Cây đa cấp, drag & drop sắp xếp, ảnh đại diện |
| **Khuyến mãi** | Tạo coupon (%), flash sale có thời hạn, combo sản phẩm |
| **Blog/CMS** | WYSIWYG editor, quản lý bài viết, SEO fields, danh mục blog |
| **Banners** | Upload banner, gán link, sắp xếp vị trí hiển thị |
| **Phân quyền** | Roles: Super Admin / Admin / Kho / CSKH + permission matrix |
| **Cài đặt** | Thông tin store, phí ship, thanh toán, email templates |

---

## 8. API BACKEND – LARAVEL

### Cấu trúc API Routes

```
# ─── AUTH ───────────────────────────────────
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

# ─── PRODUCTS (Public) ───────────────────────
GET    /api/v1/products                    # Danh sách (filter, sort, paginate)
GET    /api/v1/products/{slug}             # Chi tiết sản phẩm
GET    /api/v1/products/featured           # Sản phẩm nổi bật
GET    /api/v1/products/flash-sale         # Flash sale đang diễn ra
GET    /api/v1/products/search?q=...       # Tìm kiếm full-text

# ─── CATEGORIES (Public) ─────────────────────
GET    /api/v1/categories                  # Tất cả danh mục (tree)
GET    /api/v1/categories/{slug}/products  # Sản phẩm theo danh mục

# ─── CART (Auth) ─────────────────────────────
GET    /api/v1/cart
POST   /api/v1/cart/add
PUT    /api/v1/cart/{id}
DELETE /api/v1/cart/{id}

# ─── ORDERS (Auth) ───────────────────────────
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/{id}
POST   /api/v1/orders/{id}/cancel

# ─── REVIEWS (Auth) ──────────────────────────
GET    /api/v1/products/{id}/reviews
POST   /api/v1/products/{id}/reviews

# ─── COUPONS ─────────────────────────────────
POST   /api/v1/coupons/validate

# ─── BLOGS (Public) ──────────────────────────
GET    /api/v1/blogs
GET    /api/v1/blogs/{slug}

# ─── ADMIN (Role: admin/super-admin) ─────────
GET    /api/v1/admin/dashboard/stats
GET    /api/v1/admin/dashboard/revenue-chart

GET    /api/v1/admin/products
POST   /api/v1/admin/products
PUT    /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}
POST   /api/v1/admin/products/bulk-action

GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/{id}
PUT    /api/v1/admin/orders/{id}/status

GET    /api/v1/admin/customers
GET    /api/v1/admin/customers/{id}

GET    /api/v1/admin/reports/revenue
GET    /api/v1/admin/reports/products
GET    /api/v1/admin/reports/inventory
```

---

## 9. DATABASE SCHEMA

### Sơ đồ các bảng chính

```sql
-- USERS
users: id, name, email, phone, password, avatar,
       role (customer/staff/admin), loyalty_points,
       email_verified_at, created_at

-- CATEGORIES
categories: id, parent_id, name, slug, image,
            description, sort_order, is_active

-- PRODUCTS
products: id, category_id, name, slug, sku,
          short_description, description (longtext),
          price, sale_price, discount_type, discount_value,
          stock_quantity, low_stock_threshold,
          is_active, is_featured, is_flash_sale,
          flash_sale_price, flash_sale_end_at,
          weight_unit (g/kg), seo_title, seo_description,
          created_at, updated_at

-- PRODUCT_IMAGES
product_images: id, product_id, url, alt, is_primary, sort_order

-- PRODUCT_VARIANTS  (biến thể: 300g, 500g, 1kg)
product_variants: id, product_id, name, value,
                  price, sale_price, stock_quantity, sku

-- ORDERS
orders: id, user_id, order_code (unique), status,
        subtotal, shipping_fee, discount_amount, total,
        payment_method, payment_status,
        shipping_name, shipping_phone,
        shipping_province, shipping_district,
        shipping_ward, shipping_address,
        note, admin_note, created_at

-- ORDER_ITEMS
order_items: id, order_id, product_id, variant_id,
             product_name, product_image,
             price, quantity, subtotal

-- ORDER_STATUS_LOGS
order_status_logs: id, order_id, from_status, to_status,
                   note, created_by, created_at

-- COUPONS
coupons: id, code, type (percent/fixed/freeship),
         value, min_order_amount, max_discount,
         usage_limit, used_count, user_limit_per_user,
         expired_at, is_active

-- REVIEWS
reviews: id, product_id, user_id, order_item_id,
         rating (1-5), title, content,
         images (json array), is_approved, created_at

-- WISHLISTS
wishlists: id, user_id, product_id, created_at

-- BLOGS
blogs: id, category_id, author_id, title, slug,
       excerpt, content (longtext), thumbnail,
       is_published, views_count,
       seo_title, seo_description, published_at

-- BANNERS
banners: id, title, image, link, position, sort_order, is_active

-- SETTINGS
settings: id, key (unique), value (text), group, created_at
```

---

## 10. LỘ TRÌNH PHÁT TRIỂN

### Phase 1 – MVP (Tuần 1–4)

- [ ] Setup môi trường: Laravel 11 + Next.js 14 + MySQL + Redis
- [ ] Cấu hình CORS, Sanctum authentication
- [ ] CRUD Danh mục sản phẩm (admin)
- [ ] CRUD Sản phẩm cơ bản (không biến thể)
- [ ] Frontend: Header, Footer, Navbar (responsive)
- [ ] Frontend: Hero Banner slider, danh mục nổi bật
- [ ] Trang danh sách sản phẩm (grid + sidebar filter)
- [ ] Trang chi tiết sản phẩm
- [ ] Giỏ hàng (state Zustand + đồng bộ API)
- [ ] Quy trình Checkout + Đặt hàng COD
- [ ] Admin: Dashboard cơ bản + Quản lý đơn hàng

### Phase 2 – Core Features (Tuần 5–8)

- [ ] Biến thể sản phẩm (trọng lượng, đơn vị)
- [ ] Flash sale với countdown timer real-time
- [ ] Hệ thống Coupon & Mã giảm giá
- [ ] Thanh toán online: MoMo, VNPAY QR
- [ ] Hệ thống đánh giá sản phẩm (review + rating)
- [ ] Blog / Kiến thức nông sản (CMS)
- [ ] Tích hợp tìm kiếm nâng cao (Meilisearch)
- [ ] Admin: Báo cáo doanh thu, quản lý kho

### Phase 3 – Enhancement (Tuần 9–12)

- [ ] Wishlist sản phẩm yêu thích
- [ ] Điểm thưởng khách hàng (loyalty points)
- [ ] Email notifications (xác nhận đơn, giao hàng, hủy)
- [ ] SEO nâng cao (sitemap.xml, robots.txt, JSON-LD schema)
- [ ] Performance: Redis cache, image optimization, CDN
- [ ] PWA: Push notifications, offline support
- [ ] Admin: Phân quyền nhân viên (RBAC)

### Phase 4 – Advanced (Tùy chọn)

- [ ] Tích hợp API vận chuyển (GHN, GHTK) – tracking đơn
- [ ] Chương trình đại lý / affiliate
- [ ] Live chat tích hợp (Tawk.to / Zalo OA)
- [ ] Multi-warehouse management
- [ ] App mobile (React Native tái sử dụng logic Next.js)
- [ ] Export báo cáo Excel/PDF tự động

---

## 📌 GHI CHÚ KỸ THUẬT

> **SEO**: Tất cả trang sản phẩm & danh mục dùng **Next.js SSR/SSG**. Sử dụng `generateMetadata()` cho dynamic og tags. Target LCP < 2.5s (Core Web Vitals).

> **Security**: API auth bằng Laravel Sanctum. Rate limiting login endpoint (5 lần/phút). Input validation cả frontend (Zod) và backend (FormRequest).

> **Images**: Dùng `next/image` lazy loading + WebP format. Upload ảnh qua Laravel → lưu Cloudinary/MinIO → trả URL CDN.

> **Mobile First**: Thiết kế ưu tiên mobile (320px+). Breakpoints Bootstrap: sm(576) / md(768) / lg(992) / xl(1200) / xxl(1400).

> **State Management**: Zustand cho cart + auth state. React Query cho server state (caching API responses).

---

*📅 Tài liệu tạo ngày: 14/09/2026 | Version: 1.0.0*
*🌾 Dự án: Website bán Nông Sản Sạch – Laravel + Next.js*
