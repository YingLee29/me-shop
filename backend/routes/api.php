<?php

use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\FlashSaleController as AdminFlashSaleController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes – prefix: /api/v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login',    [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me',      [AuthController::class, 'me']);
        });
    });

    // ── Categories (public) ────────────────────────────────────────────────
    Route::prefix('categories')->group(function () {
        Route::get('/',        [CategoryController::class, 'index']);
        Route::get('{slug}',   [CategoryController::class, 'show']);
    });

    // ── Products (public) ──────────────────────────────────────────────────
    Route::prefix('products')->group(function () {
        Route::get('featured',   [ProductController::class, 'featured']);
        Route::get('flash-sale', [ProductController::class, 'flashSale']);
        Route::get('search',     [ProductController::class, 'search']);
        Route::get('{slug}/reviews',              [ReviewController::class, 'index']);
        Route::get('{slug}/review-eligibility',   [ReviewController::class, 'eligibility'])->middleware('auth:sanctum');
        Route::post('{slug}/reviews',             [ReviewController::class, 'store'])->middleware('auth:sanctum');
        Route::get('/',          [ProductController::class, 'index']);
        Route::get('{slug}',     [ProductController::class, 'show']);
    });

    // ── Blog (public) ──────────────────────────────────────────────────────
    Route::prefix('blogs')->group(function () {
        Route::get('categories', [BlogController::class, 'categories']);
        Route::get('/',          [BlogController::class, 'index']);
        Route::get('{slug}',     [BlogController::class, 'show']);
    });

    // ── Coupons (public – chỉ để preview giảm giá) ─────────────────────────
    Route::post('coupons/validate', [CouponController::class, 'validateCode'])
        ->middleware('throttle:30,1');

    // ── Authenticated customer routes ──────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/',          [CartController::class, 'index']);
            Route::post('sync',      [CartController::class, 'sync']);
            Route::post('/',         [CartController::class, 'store']);
            Route::put('{id}',       [CartController::class, 'update'])->whereNumber('id');
            Route::delete('{id}',    [CartController::class, 'destroy'])->whereNumber('id');
            Route::delete('/',       [CartController::class, 'clear']);
        });

        // Orders (customer history)
        Route::prefix('orders')->group(function () {
            Route::get('/',              [OrderController::class, 'index']);
            Route::post('{code}/cancel', [OrderController::class, 'cancel']);
        });

        // Wishlist
        Route::prefix('wishlists')->group(function () {
            Route::get('/',            [WishlistController::class, 'index']);
            Route::get('ids',          [WishlistController::class, 'ids']);
            Route::post('/',           [WishlistController::class, 'store']);
            Route::delete('{product}', [WishlistController::class, 'destroy'])->whereNumber('product');
        });

        // Loyalty points
        Route::get('loyalty', [LoyaltyController::class, 'index']);
    });

    // Public / Guest Orders
    Route::post('orders',        [OrderController::class, 'store']);
    Route::get('orders/{code}',  [OrderController::class, 'show']);

    // ── Payments (public callbacks) ────────────────────────────────────────
    Route::prefix('payments')->group(function () {
        Route::post('momo/ipn',       [PaymentController::class, 'momoIpn']);
        Route::get('momo/return',     [PaymentController::class, 'momoReturn']);
        Route::get('vnpay/ipn',       [PaymentController::class, 'vnpayIpn']);
        Route::get('vnpay/return',    [PaymentController::class, 'vnpayReturn']);
        Route::post('{code}/create',  [PaymentController::class, 'create'])->middleware('throttle:15,1');
    });

    // ── Admin routes ───────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:super-admin|admin|warehouse|support|staff'])->prefix('admin')->group(function () {

        // Admin Products
        Route::prefix('products')->group(function () {
            Route::get('/',              [AdminProductController::class, 'index'])->middleware('permission:products.view');
            Route::post('/',             [AdminProductController::class, 'store'])->middleware('permission:products.create');
            // Route tĩnh phải đứng TRƯỚC route có tham số {id}
            Route::delete('bulk-delete', [AdminProductController::class, 'bulkDelete'])->middleware('permission:products.delete');
            Route::get('{id}',           [AdminProductController::class, 'show'])->whereNumber('id')->middleware('permission:products.view');
            Route::post('{id}',          [AdminProductController::class, 'update'])->whereNumber('id')->middleware('permission:products.update'); // POST for multipart
            Route::delete('{id}',        [AdminProductController::class, 'destroy'])->whereNumber('id')->middleware('permission:products.delete');
        });

        // Admin Categories
        Route::prefix('categories')->group(function () {
            Route::get('/',        [AdminCategoryController::class, 'index'])->middleware('permission:categories.view');
            Route::post('/',       [AdminCategoryController::class, 'store'])->middleware('permission:categories.manage');
            Route::post('{id}',    [AdminCategoryController::class, 'update'])->whereNumber('id')->middleware('permission:categories.manage');
            Route::delete('{id}',  [AdminCategoryController::class, 'destroy'])->whereNumber('id')->middleware('permission:categories.manage');
        });

        // Admin Orders
        Route::prefix('orders')->group(function () {
            Route::get('/',                    [AdminOrderController::class, 'index'])->middleware('permission:orders.view');
            Route::get('{id}',                 [AdminOrderController::class, 'show'])->whereNumber('id')->middleware('permission:orders.view');
            Route::patch('{id}/status',        [AdminOrderController::class, 'updateStatus'])->whereNumber('id')->middleware('permission:orders.update-status');
        });

        // Admin Flash Sales
        Route::prefix('flash-sales')->group(function () {
            Route::get('/',        [AdminFlashSaleController::class, 'index'])->middleware('permission:flash-sales.view');
            Route::post('/',       [AdminFlashSaleController::class, 'store'])->middleware('permission:flash-sales.manage');
            Route::get('{id}',     [AdminFlashSaleController::class, 'show'])->whereNumber('id')->middleware('permission:flash-sales.view');
            Route::put('{id}',     [AdminFlashSaleController::class, 'update'])->whereNumber('id')->middleware('permission:flash-sales.manage');
            Route::delete('{id}',  [AdminFlashSaleController::class, 'destroy'])->whereNumber('id')->middleware('permission:flash-sales.manage');
        });

        // Admin Coupons
        Route::prefix('coupons')->group(function () {
            Route::get('/',        [AdminCouponController::class, 'index'])->middleware('permission:coupons.view');
            Route::post('/',       [AdminCouponController::class, 'store'])->middleware('permission:coupons.manage');
            Route::get('{id}',     [AdminCouponController::class, 'show'])->whereNumber('id')->middleware('permission:coupons.view');
            Route::put('{id}',     [AdminCouponController::class, 'update'])->whereNumber('id')->middleware('permission:coupons.manage');
            Route::delete('{id}',  [AdminCouponController::class, 'destroy'])->whereNumber('id')->middleware('permission:coupons.manage');
        });

        // Admin Blogs
        Route::prefix('blogs')->group(function () {
            Route::get('/',        [AdminBlogController::class, 'index'])->middleware('permission:blogs.view');
            Route::post('/',       [AdminBlogController::class, 'store'])->middleware('permission:blogs.manage');
            Route::get('{id}',     [AdminBlogController::class, 'show'])->whereNumber('id')->middleware('permission:blogs.view');
            Route::post('{id}',    [AdminBlogController::class, 'update'])->whereNumber('id')->middleware('permission:blogs.manage');
            Route::delete('{id}',  [AdminBlogController::class, 'destroy'])->whereNumber('id')->middleware('permission:blogs.manage');
        });

        Route::prefix('blog-categories')->group(function () {
            Route::get('/',        [AdminBlogController::class, 'categories'])->middleware('permission:blogs.view');
            Route::post('/',       [AdminBlogController::class, 'storeCategory'])->middleware('permission:blogs.manage');
            Route::post('{id}',    [AdminBlogController::class, 'updateCategory'])->whereNumber('id')->middleware('permission:blogs.manage');
            Route::delete('{id}',  [AdminBlogController::class, 'destroyCategory'])->whereNumber('id')->middleware('permission:blogs.manage');
        });

        // Admin Reviews
        Route::prefix('reviews')->group(function () {
            Route::get('/',                 [AdminReviewController::class, 'index'])->middleware('permission:reviews.view');
            Route::patch('{id}/approve',    [AdminReviewController::class, 'approve'])->whereNumber('id')->middleware('permission:reviews.manage');
            Route::delete('{id}',           [AdminReviewController::class, 'destroy'])->whereNumber('id')->middleware('permission:reviews.manage');
        });

        // Admin Inventory
        Route::prefix('inventory')->group(function () {
            Route::get('/',        [AdminInventoryController::class, 'index'])->middleware('permission:inventory.view');
            Route::get('export',   [AdminInventoryController::class, 'export'])->middleware('permission:inventory.view');
            Route::post('bulk',    [AdminInventoryController::class, 'bulkUpdate'])->middleware('permission:inventory.update');
            Route::post('{id}',    [AdminInventoryController::class, 'update'])->whereNumber('id')->middleware('permission:inventory.update');
        });

        // Admin Reports
        Route::prefix('reports')->middleware('permission:reports.view')->group(function () {
            Route::get('revenue',      [AdminReportController::class, 'revenue']);
            Route::get('top-products', [AdminReportController::class, 'topProducts']);
        });

        // Admin Roles & Permissions (chỉ super-admin)
        Route::prefix('roles')->middleware('permission:roles.manage')->group(function () {
            Route::get('/',        [AdminRoleController::class, 'index']);
            Route::get('permissions', [AdminRoleController::class, 'permissions']);
            Route::put('{role}',   [AdminRoleController::class, 'update'])->whereNumber('role');
        });
    });
});
