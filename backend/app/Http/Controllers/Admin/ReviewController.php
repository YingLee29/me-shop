<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews)
    {
    }

    /**
     * GET /api/v1/admin/reviews?status=pending|approved|all
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with([
            'product:id,name,slug',
            'product.primaryImage',
            'user:id,name,email',
            'orderItem:id,order_id,product_name,variant_name',
            'orderItem.order:id,order_code',
        ]);

        $status = $request->input('status', 'pending');
        if ($status === 'pending') {
            $query->where('is_approved', false);
        } elseif ($status === 'approved') {
            $query->where('is_approved', true);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('content', 'LIKE', "%{$search}%")
                  ->orWhere('title', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', fn($user) => $user->where('name', 'LIKE', "%{$search}%"))
                  ->orWhereHas('product', fn($product) => $product->where('name', 'LIKE', "%{$search}%"));
            });
        }

        $reviews = $query->orderByDesc('created_at')->paginate(15);

        return response()->json([
            'data' => $reviews->getCollection()->map(fn(Review $review) => [
                'id'          => $review->id,
                'rating'      => $review->rating,
                'title'       => $review->title,
                'content'     => $review->content,
                'images'      => collect($review->images ?? [])->map(fn($path) => Storage::url($path))->values(),
                'is_approved' => $review->is_approved,
                'created_at'  => $review->created_at?->toDateTimeString(),
                'product'     => [
                    'id'   => $review->product?->id,
                    'name' => $review->product?->name,
                    'slug' => $review->product?->slug,
                ],
                'customer' => [
                    'name'  => $review->user?->name,
                    'email' => $review->user?->email,
                ],
                'order_code' => $review->orderItem?->order?->order_code,
            ]),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ],
            'counts' => [
                'pending'  => Review::where('is_approved', false)->count(),
                'approved' => Review::where('is_approved', true)->count(),
            ],
        ]);
    }

    /**
     * Duyệt / bỏ duyệt đánh giá.
     * PATCH /api/v1/admin/reviews/{id}/approve
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['is_approved' => ['required', 'boolean']]);
        $review = Review::with('product')->findOrFail($id);

        $review->update([
            'is_approved' => $data['is_approved'],
            'approved_at' => $data['is_approved'] ? now() : null,
        ]);

        if ($review->product) {
            $this->reviews->recalculate($review->product);
        }

        return response()->json([
            'message' => $data['is_approved'] ? 'Đã duyệt đánh giá.' : 'Đã bỏ duyệt đánh giá.',
            'data'    => $review->fresh(),
        ]);
    }

    /**
     * Xóa đánh giá vi phạm.
     * DELETE /api/v1/admin/reviews/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::with('product')->findOrFail($id);

        $review->orderItem?->update(['is_reviewed' => false]);
        $product = $review->product;
        $review->delete();

        if ($product) {
            $this->reviews->recalculate($product);
        }

        return response()->json(['message' => 'Đã xóa đánh giá.']);
    }
}
