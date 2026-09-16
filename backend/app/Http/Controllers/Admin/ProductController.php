<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Danh sách sản phẩm (admin) – bao gồm cả đã ẩn
     * GET /api/v1/admin/products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'primaryImage']);

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        match ($request->sort) {
            'name_asc'  => $query->orderBy('name'),
            'price_asc' => $query->orderBy('price'),
            'stock'     => $query->orderBy('stock_quantity'),
            'sold'      => $query->orderByDesc('sold_count'),
            default     => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate((int) $request->get('per_page', 20));

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
     * Chi tiết sản phẩm (admin)
     * GET /api/v1/admin/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'images', 'variants'])->findOrFail($id);
        return response()->json(['data' => new ProductResource($product)]);
    }

    /**
     * Tạo sản phẩm mới
     * POST /api/v1/admin/products
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateProduct($request);

        $data['slug'] = $this->uniqueSlug($data['name'], $data['slug'] ?? null);

        $product = DB::transaction(function () use ($data, $request) {
            $product = Product::create($data);
            $this->handleImages($request, $product);
            return $product;
        });

        return response()->json([
            'message' => 'Sản phẩm đã được tạo.',
            'data'    => new ProductResource($product->load(['category', 'images'])),
        ], 201);
    }

    /**
     * Cập nhật sản phẩm
     * POST /api/v1/admin/products/{id}  (dùng POST thay PUT vì multipart/form-data)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $data    = $this->validateProduct($request, $product->id);

        if (!empty($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $data['slug'] ?? null, $product->id);
        }

        DB::transaction(function () use ($data, $request, $product) {
            $product->update($data);
            $this->handleImages($request, $product);
        });

        return response()->json([
            'message' => 'Sản phẩm đã được cập nhật.',
            'data'    => new ProductResource($product->fresh(['category', 'images'])),
        ]);
    }

    /**
     * Xóa sản phẩm (soft delete)
     * DELETE /api/v1/admin/products/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Sản phẩm đã bị xóa.']);
    }

    /**
     * Xóa nhiều sản phẩm
     * DELETE /api/v1/admin/products/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $count = Product::whereIn('id', $data['ids'])->delete();

        return response()->json(['message' => "Đã xóa {$count} sản phẩm."]);
    }

    // ── Helpers ───────────────────────────────────────────

    private function validateProduct(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'category_id'       => ['required', 'integer', 'exists:categories,id'],
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['nullable', 'string', 'max:255'],
            'sku'               => ['nullable', 'string', 'max:100'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description'       => ['nullable', 'string'],
            'price'             => ['required', 'numeric', 'min:0'],
            'sale_price'        => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'stock_quantity'    => ['required', 'integer', 'min:0'],
            'unit'              => ['nullable', 'string', 'max:50'],
            'origin'            => ['nullable', 'string', 'max:255'],
            'is_active'         => ['boolean'],
            'is_featured'       => ['boolean'],
            'is_flash_sale'     => ['boolean'],
            'flash_sale_price'  => ['nullable', 'numeric', 'min:0'],
            'flash_sale_end_at' => ['nullable', 'date'],
            'meta_title'        => ['nullable', 'string', 'max:255'],
            'meta_description'  => ['nullable', 'string', 'max:500'],
            // Images
            'images'            => ['nullable', 'array'],
            'images.*'          => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
    }

    private function uniqueSlug(string $name, ?string $slug = null, ?int $ignoreId = null): string
    {
        $base = $slug ? Str::slug($slug) : Str::slug($name);
        $slug = $base;
        $i    = 1;

        while (
            Product::where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function handleImages(Request $request, Product $product): void
    {
        if (!$request->hasFile('images')) {
            return;
        }

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        $order      = $product->images()->max('sort_order') ?? -1;

        foreach ($request->file('images') as $file) {
            $order++;
            $path = $file->store("products/{$product->id}", 'public');

            ProductImage::create([
                'product_id' => $product->id,
                'url'        => Storage::url($path),
                'alt_text'   => $product->name,
                'is_primary' => !$hasPrimary,
                'sort_order' => $order,
            ]);

            $hasPrimary = true;
        }
    }
}
