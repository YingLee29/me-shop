<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use Illuminate\Http\JsonResponse;

class FlashSaleController extends Controller
{
    /**
     * Lấy đợt Flash Sale đang diễn ra
     * GET /api/v1/flash-sales/current
     */
    public function current(): JsonResponse
    {
        $now = now();
        $flashSale = FlashSale::with(['flashSaleProducts.product.primaryImage', 'flashSaleProducts.product.category'])
            ->where('is_active', true)
            ->where('start_at', '<=', $now)
            ->where('end_at', '>=', $now)
            ->latest('start_at')
            ->first();

        if (!$flashSale) {
            return response()->json([
                'data' => null,
                'message' => 'Hiện không có đợt Flash Sale nào đang diễn ra.',
            ]);
        }

        $remainingSeconds = max(0, $flashSale->end_at->timestamp - $now->timestamp);

        $products = $flashSale->flashSaleProducts->map(function ($fsp) {
            $product = $fsp->product;
            if (!$product) return null;

            $discountPercent = $product->price > 0
                ? round((($product->price - $fsp->flash_sale_price) / $product->price) * 100)
                : 0;

            return [
                'id'                 => $product->id,
                'name'               => $product->name,
                'slug'               => $product->slug,
                'price'              => (float) $product->price,
                'current_price'      => (float) $fsp->flash_sale_price,
                'flash_sale_price'   => (float) $fsp->flash_sale_price,
                'discount_percentage'=> $discountPercent,
                'limit_quantity'     => $fsp->limit_quantity,
                'sold_quantity'      => $fsp->sold_quantity,
                'stock_quantity'     => $product->stock_quantity,
                'unit'               => $product->unit,
                'origin'             => $product->origin,
                'category'           => $product->category ? [
                    'id'   => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'primary_image'      => $product->primaryImage ? [
                    'url' => $product->primaryImage->image_url,
                    'alt' => $product->name,
                ] : null,
            ];
        })->filter()->values();

        return response()->json([
            'data' => [
                'id'                => $flashSale->id,
                'name'              => $flashSale->name,
                'slug'              => $flashSale->slug,
                'banner_url'        => $flashSale->banner_url,
                'start_at'          => $flashSale->start_at->toIso8601String(),
                'end_at'            => $flashSale->end_at->toIso8601String(),
                'remaining_seconds' => $remainingSeconds,
                'products'          => $products,
            ],
        ]);
    }
}
