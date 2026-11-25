<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Báo cáo doanh thu theo thời gian
     * GET /api/v1/admin/reports/revenue
     */
    public function revenue(Request $request): JsonResponse
    {
        $days = (int) $request->input('days', 30);
        $startDate = now()->subDays($days)->startOfDay();

        // Thống kê tổng
        $totalRevenue = Order::whereIn('status', ['confirmed', 'preparing', 'shipping', 'delivered', 'completed'])
            ->where('created_at', '>=', $startDate)
            ->sum('total');

        $totalOrders = Order::where('created_at', '>=', $startDate)->count();

        $completedOrders = Order::where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->count();

        $aov = $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0;

        // Doanh thu theo từng ngày
        $daily = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN status NOT IN ("cancelled", "refunded") THEN total ELSE 0 END) as daily_revenue'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_orders')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        return response()->json([
            'summary' => [
                'total_revenue'    => (float) $totalRevenue,
                'total_orders'     => $totalOrders,
                'completed_orders' => $completedOrders,
                'average_order_value' => (float) $aov,
                'days'             => $days,
            ],
            'chart_data' => $daily,
        ]);
    }

    /**
     * Top sản phẩm bán chạy nhất
     * GET /api/v1/admin/reports/top-products
     */
    public function topProducts(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 10), 50);

        $top = Product::with(['primaryImage', 'category'])
            ->orderByDesc('sold_count')
            ->take($limit)
            ->get();

        return response()->json([
            'data' => $top,
        ]);
    }

    /**
     * Quản lý tồn kho & cảnh báo hàng sắp hết
     * GET /api/v1/admin/inventory
     */
    public function inventory(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'primaryImage'])->latest();

        if ($request->input('status') === 'low_stock') {
            $query->where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0);
        } elseif ($request->input('status') === 'out_of_stock') {
            $query->where('stock_quantity', '<=', 0);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
        }

        $products = $query->paginate(20);

        $counts = [
            'total_products' => Product::count(),
            'low_stock'      => Product::where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0)->count(),
            'out_of_stock'   => Product::where('stock_quantity', '<=', 0)->count(),
        ];

        return response()->json([
            'counts'   => $counts,
            'products' => $products,
        ]);
    }

    /**
     * Cập nhật tồn kho tại chỗ (Inline edit)
     * PATCH /api/v1/admin/inventory/{id}
     */
    public function updateStock(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product = Product::findOrFail($id);
        $product->update([
            'stock_quantity' => $request->input('stock_quantity'),
        ]);

        return response()->json([
            'message'        => 'Cập nhật số lượng tồn kho thành công!',
            'stock_quantity' => $product->stock_quantity,
        ]);
    }
}
