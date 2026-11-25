<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Danh sách đánh giá
     * GET /api/v1/admin/reviews
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['product:id,name,slug', 'user:id,name,email'])
            ->latest();

        if ($request->filled('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        if ($request->filled('is_approved')) {
            $query->where('is_approved', filter_var($request->input('is_approved'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $reviews = $query->paginate(15);

        return response()->json($reviews);
    }

    /**
     * Cập nhật trạng thái duyệt đánh giá
     * PATCH /api/v1/admin/reviews/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'is_approved' => ['required', 'boolean'],
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'is_approved' => $request->input('is_approved'),
        ]);

        // Tính lại sao cho sản phẩm
        $review->product?->recalculateRating();

        return response()->json([
            'message' => 'Cập nhật trạng thái đánh giá thành công!',
            'data'    => $review,
        ]);
    }

    /**
     * Xóa đánh giá vi phạm
     * DELETE /api/v1/admin/reviews/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $product = $review->product;
        $review->delete();

        $product?->recalculateRating();

        return response()->json([
            'message' => 'Đã xóa đánh giá thành công.',
        ]);
    }
}
