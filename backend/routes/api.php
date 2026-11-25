<?php

use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\FlashSaleController as AdminFlashSaleController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\FlashSaleController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
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
        Route::get('/',          [ProductController::class, 'index']);
        Route::get('{slug}',     [ProductController::class, 'show']);
    });

    // ── Authenticated customer routes ──────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/',          [CartController::class, 'index']);
            Route::post('/',         [CartController::class, 'store']);
            Route::put('{id}',       [CartController::class, 'update']);
            Route::delete('{id}',    [CartController::class, 'destroy']);
            Route::delete('/',       [CartController::class, 'clear']);
        });

        // Orders (customer history)
        Route::prefix('orders')->group(function () {
            Route::get('/',              [OrderController::class, 'index']);
            Route::post('{code}/cancel', [OrderController::class, 'cancel']);
        });

        // Customer Reviews
        Route::post('products/{id}/reviews', [ReviewController::class, 'store']);
    });

    // Public / Guest Orders
    Route::post('orders',        [OrderController::class, 'store']);
    Route::get('orders/{code}',  [OrderController::class, 'show']);

    // Public Reviews
    Route::get('products/{id}/reviews', [ReviewController::class, 'index']);

    // Public Blogs
    Route::get('blogs',                [BlogController::class, 'index']);
    Route::get('blogs/{slug}',         [BlogController::class, 'show']);
    Route::get('blog-categories',      [BlogController::class, 'categories']);

    // Public Flash Sales & Coupons
    Route::get('flash-sales/current', [FlashSaleController::class, 'current']);
    Route::post('coupons/validate',   [CouponController::class, 'validateCoupon']);

    // Online Payments (MoMo, VNPAY, Sandbox)
    Route::prefix('payment')->group(function () {
        Route::post('momo/create',   [PaymentController::class, 'createMoMo']);
        Route::post('momo/ipn',      [PaymentController::class, 'momoIpn']);
        Route::post('vnpay/create',  [PaymentController::class, 'createVnpay']);
        Route::post('confirm',       [PaymentController::class, 'confirmPayment']);
    });

    // ── Admin routes ───────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum', 'role:admin|super-admin'])->prefix('admin')->group(function () {

        // Admin Products
        Route::prefix('products')->group(function () {
            Route::get('/',              [AdminProductController::class, 'index']);
            Route::post('/',             [AdminProductController::class, 'store']);
            Route::get('{id}',           [AdminProductController::class, 'show']);
            Route::post('{id}',          [AdminProductController::class, 'update']); // POST for multipart
            Route::delete('{id}',        [AdminProductController::class, 'destroy']);
            Route::delete('bulk-delete', [AdminProductController::class, 'bulkDelete']);
        });

        // Admin Orders
        Route::prefix('orders')->group(function () {
            Route::get('/',                    [AdminOrderController::class, 'index']);
            Route::get('{id}',                 [AdminOrderController::class, 'show']);
            Route::patch('{id}/status',        [AdminOrderController::class, 'updateStatus']);
        });

        // Admin Flash Sales
        Route::prefix('flash-sales')->group(function () {
            Route::get('/',        [AdminFlashSaleController::class, 'index']);
            Route::post('/',       [AdminFlashSaleController::class, 'store']);
            Route::get('{id}',     [AdminFlashSaleController::class, 'show']);
            Route::delete('{id}',  [AdminFlashSaleController::class, 'destroy']);
        });

        // Admin Coupons
        Route::prefix('coupons')->group(function () {
            Route::get('/',        [AdminCouponController::class, 'index']);
            Route::post('/',       [AdminCouponController::class, 'store']);
            Route::put('{id}',     [AdminCouponController::class, 'update']);
            Route::delete('{id}',  [AdminCouponController::class, 'destroy']);
        });

        // Admin Reviews
        Route::prefix('reviews')->group(function () {
            Route::get('/',              [AdminReviewController::class, 'index']);
            Route::patch('{id}/status',  [AdminReviewController::class, 'updateStatus']);
            Route::delete('{id}',        [AdminReviewController::class, 'destroy']);
        });

        // Admin Blogs
        Route::prefix('blogs')->group(function () {
            Route::get('/',        [AdminBlogController::class, 'index']);
            Route::post('/',       [AdminBlogController::class, 'store']);
            Route::get('{id}',     [AdminBlogController::class, 'show']);
            Route::put('{id}',     [AdminBlogController::class, 'update']);
            Route::delete('{id}',  [AdminBlogController::class, 'destroy']);
        });

        // Admin Reports & Inventory
        Route::get('reports/revenue',      [AdminReportController::class, 'revenue']);
        Route::get('reports/top-products', [AdminReportController::class, 'topProducts']);
        Route::get('inventory',            [AdminReportController::class, 'inventory']);
        Route::patch('inventory/{id}',     [AdminReportController::class, 'updateStock']);
    });
});
