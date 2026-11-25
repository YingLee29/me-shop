<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Danh sách đánh giá của sản phẩm
     * GET /api/v1/products/{id}/reviews
     */
    public function index(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $reviews = Review::with(['user:id,name,avatar'])
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->latest()
            ->paginate(10);

        // Thống kê phân bố sao
        $stats = [
            'avg_rating'   => (float) $product->avg_rating,
            'review_count' => (int) $product->review_count,
            'rating_breakdown' => [
                5 => Review::where('product_id', $product->id)->where('is_approved', true)->where('rating', 5)->count(),
                4 => Review::where('product_id', $product->id)->where('is_approved', true)->where('rating', 4)->count(),
                3 => Review::where('product_id', $product->id)->where('is_approved', true)->where('rating', 3)->count(),
                2 => Review::where('product_id', $product->id)->where('is_approved', true)->where('rating', 2)->count(),
                1 => Review::where('product_id', $product->id)->where('is_approved', true)->where('rating', 1)->count(),
            ],
        ];

        return response()->json([
            'stats'   => $stats,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Gửi đánh giá cho sản phẩm
     * POST /api/v1/products/{id}/reviews
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Vui lòng đăng nhập để đánh giá sản phẩm.'], 401);
        }

        $product = Product::findOrFail($id);

        $data = $request->validate([
            'rating'   => ['required', 'integer', 'min:1', 'max:5'],
            'comment'  => ['required', 'string', 'min:5', 'max:1000'],
            'images'   => ['nullable', 'array'],
            'images.*' => ['string', 'url'],
        ]);

        // Kiểm tra xem khách hàng đã từng đặt sản phẩm này chưa (đơn đã completed/delivered hoặc confirmed)
        $hasOrdered = Order::where('user_id', $user->id)
            ->whereIn('status', ['completed', 'delivered', 'confirmed'])
            ->whereHas('orderItems', function ($q) use ($product) {
                $q->where('product_id', $product->id);
            })
            ->exists();

        // Tạo review
        $review = Review::create([
            'product_id'  => $product->id,
            'user_id'     => $user->id,
            'rating'      => $data['rating'],
            'comment'     => $data['comment'],
            'images'      => $data['images'] ?? [],
            'is_approved' => true,
        ]);

        // Cập nhật lại sao trung bình
        $product->recalculateRating();

        return response()->json([
            'message' => 'Cảm ơn bạn đã gửi đánh giá sản phẩm!',
            'data'    => $review->load('user:id,name,avatar'),
            'verified_purchase' => $hasOrdered,
        ], 201);
    }
}
