<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FlashSaleController extends Controller
{
    /**
     * Danh sách đợt flash sale
     * GET /api/v1/admin/flash-sales
     */
    public function index(Request $request): JsonResponse
    {
        $query = FlashSale::withCount('items');

        if ($search = $request->search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $sales = $query->orderByDesc('start_at')->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'data' => $sales->getCollection()->map(fn(FlashSale $sale) => $this->formatSale($sale)),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page'    => $sales->lastPage(),
                'total'        => $sales->total(),
            ],
        ]);
    }

    /**
     * Chi tiết đợt flash sale + sản phẩm
     * GET /api/v1/admin/flash-sales/{id}
     */
    public function show(int $id): JsonResponse
    {
        $sale = FlashSale::with(['items' => fn($q) => $q->orderBy('sort_order'), 'items.product'])
            ->withCount('items')
            ->findOrFail($id);

        return response()->json([
            'data' => array_merge($this->formatSale($sale), [
                'products' => $sale->items->map(fn(FlashSaleProduct $item) => [
                    'id'             => $item->id,
                    'product_id'     => $item->product_id,
                    'product_name'   => $item->product?->name,
                    'product_sku'    => $item->product?->sku,
                    'regular_price'  => (float) ($item->product?->current_price ?? 0),
                    'sale_price'     => (float) $item->sale_price,
                    'quantity_limit' => $item->quantity_limit,
                    'sold_count'     => $item->sold_count,
                    'sort_order'     => $item->sort_order,
                ]),
            ]),
        ]);
    }

    /**
     * Tạo đợt flash sale
     * POST /api/v1/admin/flash-sales
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateSale($request);

        $sale = DB::transaction(function () use ($data) {
            $sale = FlashSale::create([
                'name'         => $data['name'],
                'slug'         => $this->uniqueSlug($data['slug'] ?? $data['name']),
                'description'  => $data['description'] ?? null,
                'banner_image' => $data['banner_image'] ?? null,
                'start_at'     => $data['start_at'],
                'end_at'       => $data['end_at'],
                'is_active'    => $data['is_active'] ?? true,
            ]);

            $this->syncProducts($sale, $data['products'] ?? []);

            return $sale;
        });

        return response()->json([
            'message' => 'Đã tạo đợt flash sale.',
            'data'    => $this->formatSale($sale->loadCount('items')),
        ], 201);
    }

    /**
     * Cập nhật đợt flash sale
     * PUT /api/v1/admin/flash-sales/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $sale = FlashSale::findOrFail($id);
        $data = $this->validateSale($request, $sale->id);

        DB::transaction(function () use ($sale, $data) {
            $sale->update([
                'name'         => $data['name'],
                'slug'         => $this->uniqueSlug($data['slug'] ?? $data['name'], $sale->id),
                'description'  => $data['description'] ?? null,
                'banner_image' => $data['banner_image'] ?? null,
                'start_at'     => $data['start_at'],
                'end_at'       => $data['end_at'],
                'is_active'    => $data['is_active'] ?? $sale->is_active,
            ]);

            // Chỉ đồng bộ khi client gửi danh sách sản phẩm
            if (array_key_exists('products', $data)) {
                $this->syncProducts($sale, $data['products'] ?? []);
            }
        });

        return response()->json([
            'message' => 'Đã cập nhật đợt flash sale.',
            'data'    => $this->formatSale($sale->fresh()->loadCount('items')),
        ]);
    }

    /**
     * Xóa đợt flash sale
     * DELETE /api/v1/admin/flash-sales/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        FlashSale::findOrFail($id)->delete();

        return response()->json(['message' => 'Đã xóa đợt flash sale.']);
    }

    // ── Helpers ───────────────────────────────────────────

    private function validateSale(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name'                       => ['required', 'string', 'max:255'],
            'slug'                       => ['nullable', 'string', 'max:255'],
            'description'                => ['nullable', 'string'],
            'banner_image'               => ['nullable', 'string', 'max:500'],
            'start_at'                   => ['required', 'date'],
            'end_at'                     => ['required', 'date', 'after:start_at'],
            'is_active'                  => ['boolean'],
            'products'                   => ['sometimes', 'array'],
            'products.*.product_id'      => ['required', 'integer', 'exists:products,id'],
            'products.*.sale_price'      => ['required', 'numeric', 'min:0'],
            'products.*.quantity_limit'  => ['nullable', 'integer', 'min:1'],
            'products.*.sort_order'      => ['nullable', 'integer', 'min:0'],
        ]);
    }

    private function syncProducts(FlashSale $sale, array $products): void
    {
        $keepIds = [];

        foreach ($products as $index => $item) {
            $row = FlashSaleProduct::updateOrCreate(
                [
                    'flash_sale_id' => $sale->id,
                    'product_id'    => $item['product_id'],
                ],
                [
                    'sale_price'     => $item['sale_price'],
                    'quantity_limit' => $item['quantity_limit'] ?? null,
                    'sort_order'     => $item['sort_order'] ?? $index,
                ]
            );

            $keepIds[] = $row->id;
        }

        $sale->items()->whereNotIn('id', $keepIds)->delete();
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'flash-sale';
        $slug = $base;
        $i    = 1;

        while (
            FlashSale::where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    private function formatSale(FlashSale $sale): array
    {
        return [
            'id'           => $sale->id,
            'name'         => $sale->name,
            'slug'         => $sale->slug,
            'description'  => $sale->description,
            'banner_image' => $sale->banner_image,
            'start_at'     => $sale->start_at?->toDateTimeString(),
            'end_at'       => $sale->end_at?->toDateTimeString(),
            'is_active'    => $sale->is_active,
            'status'       => $sale->status,
            'items_count'  => $sale->items_count ?? $sale->items()->count(),
        ];
    }
}
