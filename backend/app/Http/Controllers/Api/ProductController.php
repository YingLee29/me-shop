<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Danh sách sản phẩm (filter + sort + paginate)
     * GET /api/v1/products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['primaryImage', 'category'])->active();

        // Filter theo danh mục
        if ($slug = $request->category) {
            $category = Category::where('slug', $slug)->first();
            if ($category) {
                $categoryIds = $this->getCategoryIds($category);
                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Filter giá
        if ($request->filled('price_min')) {
            $query->where(fn($q) => $q->where('sale_price', '>=', $request->price_min)
                ->orWhere(fn($q2) => $q2->whereNull('sale_price')->where('price', '>=', $request->price_min)));
        }
        if ($request->filled('price_max')) {
            $query->where(fn($q) => $q->where('sale_price', '<=', $request->price_max)
                ->orWhere(fn($q2) => $q2->whereNull('sale_price')->where('price', '<=', $request->price_max)));
        }

        // Sắp xếp
        match ($request->sort) {
            'price_asc'  => $query->orderByRaw('COALESCE(sale_price, price) ASC'),
            'price_desc' => $query->orderByRaw('COALESCE(sale_price, price) DESC'),
            'popular'    => $query->orderByDesc('sold_count'),
            'rating'     => $query->orderByDesc('avg_rating'),
            default      => $query->orderByDesc('created_at'),  // newest
        };

        $perPage = min((int) $request->get('per_page', 20), 60);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /**
     * Chi tiết sản phẩm theo slug
     * GET /api/v1/products/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['images', 'variants', 'category'])
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Tăng view count
        $product->increment('view_count');

        return response()->json(['data' => new ProductResource($product)]);
    }

    /**
     * Sản phẩm nổi bật
     * GET /api/v1/products/featured
     */
    public function featured(): JsonResponse
    {
        $products = Product::with(['primaryImage', 'category'])
            ->featured()
            ->take(12)
            ->get();

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    /**
     * Flash sale đang diễn ra
     * GET /api/v1/products/flash-sale
     */
    public function flashSale(): JsonResponse
    {
        $products = Product::with(['primaryImage'])
            ->flashSale()
            ->orderByDesc('sold_count')
            ->take(10)
            ->get();

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    /**
     * Tìm kiếm sản phẩm
     * GET /api/v1/products/search?q=
     */
    public function search(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        if (strlen($q) < 2) {
            return response()->json(['data' => []]);
        }

        $products = Product::with(['primaryImage'])
            ->active()
            ->where(function ($query) use ($q) {
                $query->where('name', 'LIKE', "%{$q}%")
                    ->orWhere('sku', 'LIKE', "%{$q}%")
                    ->orWhere('short_description', 'LIKE', "%{$q}%");
            })
            ->take(10)
            ->get();

        return response()->json(['data' => ProductResource::collection($products)]);
    }

    // ── Helpers ───────────────────────────────────────────

    /** Lấy tất cả ID của danh mục và các danh mục con */
    private function getCategoryIds(Category $category): array
    {
        $ids = [$category->id];
        foreach ($category->children as $child) {
            $ids[] = $child->id;
            foreach ($child->children as $grandchild) {
                $ids[] = $grandchild->id;
            }
        }
        return $ids;
    }
}
