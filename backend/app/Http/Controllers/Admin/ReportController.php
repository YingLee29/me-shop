<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    private const REVENUE_STATUSES = [Order::STATUS_DELIVERED, Order::STATUS_COMPLETED];

    /**
     * Doanh thu theo ngày/tháng.
     * GET /api/v1/admin/reports/revenue?date_from=&date_to=&group_by=day|month
     */
    public function revenue(Request $request): JsonResponse
    {
        [$from, $to, $groupBy] = $this->range($request);

        $periodExpression = $groupBy === 'month'
            ? "DATE_FORMAT(created_at, '%Y-%m')"
            : 'DATE(created_at)';

        $rows = Order::query()
            ->whereIn('status', self::REVENUE_STATUSES)
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->selectRaw("{$periodExpression} as period, COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->keyBy('period');

        $series = [];
        if ($groupBy === 'month') {
            $cursor = $from->copy()->startOfMonth();
            while ($cursor <= $to) {
                $key = $cursor->format('Y-m');
                $series[] = [
                    'period'  => $key,
                    'label'   => $cursor->format('m/Y'),
                    'revenue' => (float) ($rows[$key]->revenue ?? 0),
                    'orders'  => (int) ($rows[$key]->orders ?? 0),
                ];
                $cursor->addMonth();
            }
        } else {
            $cursor = $from->copy()->startOfDay();
            while ($cursor <= $to) {
                $key = $cursor->toDateString();
                $series[] = [
                    'period'  => $key,
                    'label'   => $cursor->format('d/m'),
                    'revenue' => (float) ($rows[$key]->revenue ?? 0),
                    'orders'  => (int) ($rows[$key]->orders ?? 0),
                ];
                $cursor->addDay();
            }
        }

        $totalRevenue = collect($series)->sum('revenue');
        $totalOrders = collect($series)->sum('orders');
        $itemsSold = OrderItem::query()
            ->whereHas('order', fn($q) => $q
                ->whereIn('status', self::REVENUE_STATUSES)
                ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()]))
            ->sum('quantity');

        return response()->json([
            'data' => [
                'summary' => [
                    'revenue'         => (float) $totalRevenue,
                    'orders'          => (int) $totalOrders,
                    'avg_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0,
                    'items_sold'      => (int) $itemsSold,
                ],
                'series'   => $series,
                'group_by' => $groupBy,
                'date_from' => $from->toDateString(),
                'date_to'   => $to->toDateString(),
            ],
        ]);
    }

    /**
     * Top sản phẩm bán chạy trong khoảng thời gian.
     * GET /api/v1/admin/reports/top-products?date_from=&date_to=&limit=10
     */
    public function topProducts(Request $request): JsonResponse
    {
        [$from, $to] = $this->range($request);

        $rows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('orders.status', self::REVENUE_STATUSES)
            ->whereBetween('orders.created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->selectRaw('order_items.product_id, order_items.product_name, products.slug, SUM(order_items.quantity) as quantity, SUM(order_items.subtotal) as revenue')
            ->groupBy('order_items.product_id', 'order_items.product_name', 'products.slug')
            ->orderByDesc('quantity')
            ->limit(min((int) $request->input('limit', 10), 50))
            ->get();

        return response()->json([
            'data' => $rows->map(fn($row) => [
                'product_id'   => $row->product_id,
                'product_name' => $row->product_name,
                'slug'         => $row->slug,
                'quantity'     => (int) $row->quantity,
                'revenue'      => (float) $row->revenue,
            ]),
            'date_from' => $from->toDateString(),
            'date_to'   => $to->toDateString(),
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: string}
     */
    private function range(Request $request): array
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date', 'after_or_equal:date_from'],
            'group_by'  => ['nullable', 'in:day,month'],
        ]);

        $to = $request->filled('date_to') ? Carbon::parse($request->date_to) : now();
        $from = $request->filled('date_from') ? Carbon::parse($request->date_from) : $to->copy()->subDays(29);

        $groupBy = $request->input('group_by', 'day');
        if ($from->diffInDays($to) > 92) {
            $groupBy = 'month';
        }

        return [$from, $to, $groupBy];
    }
}
