<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Danh sách tồn kho.
     * GET /api/v1/admin/inventory?status=low|out|in&search=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'primaryImage'])->orderBy('stock_quantity');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('name', 'LIKE', "%{$search}%")->orWhere('sku', 'LIKE', "%{$search}%"));
        }

        $threshold = max((int) $request->input('threshold', 10), 0);
        match ($request->input('status')) {
            'low' => $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', $threshold),
            'out' => $query->where('stock_quantity', 0),
            'in'  => $query->where('stock_quantity', '>', $threshold),
            default => null,
        };

        $products = $query->paginate(min((int) $request->input('per_page', 30), 100));

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
            'stats' => [
                'low'  => Product::where('stock_quantity', '>', 0)->where('stock_quantity', '<=', $threshold)->count(),
                'out'  => Product::where('stock_quantity', 0)->count(),
                'total_stock' => (int) Product::sum('stock_quantity'),
            ],
        ]);
    }

    /**
     * Cập nhật tồn kho một sản phẩm.
     * POST /api/v1/admin/inventory/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product = Product::findOrFail($id);
        $product->update(['stock_quantity' => $data['stock_quantity']]);

        return response()->json([
            'message' => 'Đã cập nhật tồn kho.',
            'data'    => ['id' => $product->id, 'stock_quantity' => $product->stock_quantity],
        ]);
    }

    /**
     * Cập nhật tồn kho nhiều sản phẩm.
     * POST /api/v1/admin/inventory/bulk
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['items'] as $item) {
            Product::whereKey($item['id'])->update(['stock_quantity' => $item['stock_quantity']]);
        }

        return response()->json(['message' => 'Đã cập nhật ' . count($data['items']) . ' sản phẩm.']);
    }

    /**
     * Xuất CSV tồn kho.
     * GET /api/v1/admin/inventory/export
     */
    public function export(Request $request)
    {
        $query = Product::with('category')->orderBy('name');

        if ($request->input('status') === 'low') {
            $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', (int) $request->input('threshold', 10));
        } elseif ($request->input('status') === 'out') {
            $query->where('stock_quantity', 0);
        }

        $filename = 'ton-kho-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['ID', 'SKU', 'Tên sản phẩm', 'Danh mục', 'Đơn vị', 'Tồn kho', 'Giá bán', 'Trạng thái']);

            $query->chunk(500, function ($products) use ($handle) {
                foreach ($products as $product) {
                    fputcsv($handle, [
                        $product->id,
                        $product->sku,
                        $product->name,
                        $product->category?->name,
                        $product->unit,
                        $product->stock_quantity,
                        (float) $product->price,
                        $product->is_active ? 'Đang bán' : 'Đã ẩn',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
