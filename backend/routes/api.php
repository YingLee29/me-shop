<?php

use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
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
    });

    // Public / Guest Orders
    Route::post('orders',        [OrderController::class, 'store']);
    Route::get('orders/{code}',  [OrderController::class, 'show']);

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
    });
});
