<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /** GET /api/v1/wishlists */
    public function index(Request $request): JsonResponse
    {
        $wishlists = Wishlist::with([
            'product.primaryImage',
            'product.category',
            'product.activeFlashSaleItem',
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $products = $wishlists->pluck('product')->filter()->values();

        return response()->json([
            'data' => ProductResource::collection($products),
            'ids'  => $products->pluck('id')->values(),
        ]);
    }

    /** GET /api/v1/wishlists/ids – dùng cho icon ♡ trên ProductCard */
    public function ids(Request $request): JsonResponse
    {
        return response()->json([
            'data' => Wishlist::where('user_id', $request->user()->id)->pluck('product_id'),
        ]);
    }

    /** POST /api/v1/wishlists */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        Product::active()->findOrFail($data['product_id']);

        $wishlist = Wishlist::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $data['product_id'],
        ]);

        return response()->json([
            'message' => $wishlist->wasRecentlyCreated
                ? 'Đã thêm vào danh sách yêu thích.'
                : 'Sản phẩm đã có trong danh sách yêu thích.',
            'data' => ['product_id' => $wishlist->product_id],
        ], $wishlist->wasRecentlyCreated ? 201 : 200);
    }

    /** DELETE /api/v1/wishlists/{product} */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return response()->json(['message' => 'Đã bỏ khỏi danh sách yêu thích.']);
    }
}
