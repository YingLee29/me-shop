<?php

use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\FlashSaleController as AdminFlashSaleController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
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
        Route::get('/',          [ProductController::class, 'index']);
        Route::get('{slug}',     [ProductController::class, 'show']);
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

        // Admin Roles & Permissions (chỉ super-admin)
        Route::prefix('roles')->middleware('permission:roles.manage')->group(function () {
            Route::get('/',        [AdminRoleController::class, 'index']);
            Route::get('permissions', [AdminRoleController::class, 'permissions']);
            Route::put('{role}',   [AdminRoleController::class, 'update'])->whereNumber('role');
        });
    });
});
