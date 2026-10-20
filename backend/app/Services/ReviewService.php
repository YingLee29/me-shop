<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;

class ReviewService
{
    /** Tính lại điểm trung bình & số lượt đánh giá đã duyệt. */
    public function recalculate(Product $product): void
    {
        $stats = Review::query()
            ->where('product_id', $product->id)
            ->where('is_approved', true)
            ->selectRaw('COUNT(*) as total, AVG(rating) as average')
            ->first();

        $product->updateQuietly([
            'review_count' => (int) ($stats->total ?? 0),
            'avg_rating'   => round((float) ($stats->average ?? 0), 1),
        ]);
    }
}
