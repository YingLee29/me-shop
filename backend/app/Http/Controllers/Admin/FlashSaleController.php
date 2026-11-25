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
     * Danh sách đợt Flash Sale
     * GET /api/v1/admin/flash-sales
     */
    public function index(): JsonResponse
    {
        $sales = FlashSale::withCount('flashSaleProducts')->latest()->get();

        return response()->json([
            'data' => $sales,
        ]);
    }

    /**
     * Chi tiết đợt Flash Sale
     * GET /api/v1/admin/flash-sales/{id}
     */
    public function show(int $id): JsonResponse
    {
        $sale = FlashSale::with(['flashSaleProducts.product'])->findOrFail($id);

        return response()->json([
            'data' => $sale,
        ]);
    }

    /**
     * Tạo đợt Flash Sale
     * POST /api/v1/admin/flash-sales
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                     => ['required', 'string', 'max:255'],
            'start_at'                 => ['required', 'date'],
            'end_at'                   => ['required', 'date', 'after:start_at'],
            'banner_url'               => ['nullable', 'string'],
            'is_active'                => ['boolean'],
            'products'                 => ['nullable', 'array'],
            'products.*.product_id'    => ['required_with:products', 'integer', 'exists:products,id'],
            'products.*.flash_sale_price' => ['required_with:products', 'numeric', 'min:0'],
            'products.*.limit_quantity'=> ['nullable', 'integer', 'min:1'],
        ]);

        $flashSale = DB::transaction(function () use ($data) {
            $sale = FlashSale::create([
                'name'       => $data['name'],
                'slug'       => Str::slug($data['name']) . '-' . time(),
                'banner_url' => $data['banner_url'] ?? null,
                'start_at'   => $data['start_at'],
                'end_at'     => $data['end_at'],
                'is_active'  => $data['is_active'] ?? true,
            ]);

            if (!empty($data['products'])) {
                foreach ($data['products'] as $p) {
                    FlashSaleProduct::create([
                        'flash_sale_id'    => $sale->id,
                        'product_id'       => $p['product_id'],
                        'flash_sale_price' => $p['flash_sale_price'],
                        'limit_quantity'   => $p['limit_quantity'] ?? 100,
                        'sold_quantity'    => 0,
                    ]);
                }
            }

            return $sale;
        });

        return response()->json([
            'message' => 'Tạo đợt Flash Sale thành công!',
            'data'    => $flashSale->load('flashSaleProducts'),
        ], 201);
    }

    /**
     * Xóa đợt Flash Sale
     * DELETE /api/v1/admin/flash-sales/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $sale = FlashSale::findOrFail($id);
        $sale->delete();

        return response()->json([
            'message' => 'Đã xóa đợt Flash Sale.',
        ]);
    }
}
