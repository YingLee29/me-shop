<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews)
    {
    }

    /**
     * Danh sách đánh giá đã duyệt của sản phẩm.
     * GET /api/v1/products/{slug}/reviews
     */
    public function index(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $query = Review::with(['user:id,name,avatar'])
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->orderByDesc('created_at');

        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->rating);
        }

        $reviews = $query->paginate(min((int) $request->input('per_page', 5), 20));

        $counts = Review::query()
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $countMap = [
            5 => (int) ($counts[5] ?? 0),
            4 => (int) ($counts[4] ?? 0),
            3 => (int) ($counts[3] ?? 0),
            2 => (int) ($counts[2] ?? 0),
            1 => (int) ($counts[1] ?? 0),
        ];
        $totalReviews = array_sum($countMap);
        $weightedTotal = array_sum(array_map(fn($star, $count) => $star * $count, array_keys($countMap), $countMap));

        $summary = [
            'avg_rating'   => $totalReviews > 0 ? round($weightedTotal / $totalReviews, 1) : 0,
            'review_count' => $totalReviews,
            'counts'       => $countMap,
        ];

        return response()->json([
            'data' => $reviews->getCollection()->map(fn(Review $review) => [
                'id'         => $review->id,
                'rating'     => $review->rating,
                'title'      => $review->title,
                'content'    => $review->content,
                'images'     => collect($review->images ?? [])->map(fn($path) => Storage::url($path))->values(),
                'user_name'  => $review->user?->name ?? 'Khách hàng',
                'user_avatar' => $review->user?->avatar,
                'created_at' => $review->created_at?->toDateString(),
            ]),
            'summary' => $summary,
            'meta'    => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ],
        ]);
    }

    /**
     * Các sản phẩm trong đơn đã hoàn thành mà khách có thể đánh giá.
     * GET /api/v1/products/{slug}/review-eligibility
     */
    public function eligibility(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $items = OrderItem::with('order:id,order_code,status,created_at')
            ->where('product_id', $product->id)
            ->where('is_reviewed', false)
            ->whereHas('order', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                    ->whereIn('status', [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED]);
            })
            ->latest()
            ->get()
            ->map(fn(OrderItem $item) => [
                'order_item_id' => $item->id,
                'order_code'    => $item->order?->order_code,
                'variant_name'  => $item->variant_name,
                'quantity'      => $item->quantity,
                'created_at'    => $item->order?->created_at?->toDateString(),
            ]);

        return response()->json(['data' => $items]);
    }

    /**
     * Gửi đánh giá (chờ admin duyệt).
     * POST /api/v1/products/{slug}/reviews
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'rating'        => ['required', 'integer', 'min:1', 'max:5'],
            'title'         => ['nullable', 'string', 'max:255'],
            'content'       => ['required', 'string', 'min:10', 'max:2000'],
            'images'        => ['nullable', 'array', 'max:5'],
            'images.*'      => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $orderItem = OrderItem::with('order')
            ->where('id', $data['order_item_id'])
            ->where('product_id', $product->id)
            ->first();

        if (!$orderItem || $orderItem->order?->user_id !== $request->user()->id) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Sản phẩm này không thuộc đơn hàng của bạn.',
            ]);
        }

        if (!in_array($orderItem->order->status, [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED], true)) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Bạn chỉ có thể đánh giá sau khi đơn hàng đã giao thành công.',
            ]);
        }

        if ($orderItem->is_reviewed || Review::where('order_item_id', $orderItem->id)->exists()) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Bạn đã đánh giá sản phẩm trong đơn hàng này rồi.',
            ]);
        }

        $review = DB::transaction(function () use ($request, $product, $orderItem, $data) {
            $paths = [];
            foreach ($request->file('images', []) as $file) {
                $paths[] = $file->store("reviews/{$request->user()->id}", 'public');
            }

            $review = Review::create([
                'product_id'    => $product->id,
                'user_id'       => $request->user()->id,
                'order_item_id' => $orderItem->id,
                'rating'        => $data['rating'],
                'title'         => $data['title'] ?? null,
                'content'       => $data['content'],
                'images'        => $paths ?: null,
                'is_approved'   => false,
            ]);

            $orderItem->update(['is_reviewed' => true]);

            return $review;
        });

        return response()->json([
            'message' => 'Cảm ơn bạn! Đánh giá đang chờ duyệt và sẽ hiển thị sau khi được xác nhận.',
            'data'    => ['id' => $review->id, 'is_approved' => false],
        ], 201);
    }
}
