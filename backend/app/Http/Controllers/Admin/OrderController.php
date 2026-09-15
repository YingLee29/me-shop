<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Danh sách đơn hàng (admin)
     * GET /api/v1/admin/orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user'])->latest();

        // Filter theo status
        if ($status = $request->status) {
            $query->where('status', $status);
        }

        // Filter theo ngày
        if ($from = $request->date_from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->date_to) {
            $query->whereDate('created_at', '<=', $to);
        }

        // Tìm theo tên khách hoặc mã đơn
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_code', 'LIKE', "%{$search}%")
                  ->orWhere('shipping_name', 'LIKE', "%{$search}%")
                  ->orWhere('shipping_phone', 'LIKE', "%{$search}%");
            });
        }

        $orders = $query->paginate(20);

        return response()->json([
            'data' => $orders->map(fn($o) => [
                'id'               => $o->id,
                'order_code'       => $o->order_code,
                'customer_name'    => $o->shipping_name,
                'customer_phone'   => $o->shipping_phone,
                'customer_email'   => $o->user?->email,
                'status'           => $o->status,
                'payment_method'   => $o->payment_method,
                'payment_status'   => $o->payment_status,
                'total'            => (float) $o->total,
                'items_count'      => $o->items_count ?? $o->items()->count(),
                'created_at'       => $o->created_at?->toDateTimeString(),
            ]),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
            'summary' => [
                'total_revenue' => Order::where('status', 'completed')->sum('total'),
                'pending_count' => Order::where('status', 'pending')->count(),
            ],
        ]);
    }

    /**
     * Chi tiết đơn hàng (admin)
     * GET /api/v1/admin/orders/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::with(['user', 'items.product.primaryImage', 'items.variant', 'statusLogs'])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id'               => $order->id,
                'order_code'       => $order->order_code,
                'status'           => $order->status,
                'payment_method'   => $order->payment_method,
                'payment_status'   => $order->payment_status,
                'subtotal'         => (float) $order->subtotal,
                'discount_amount'  => (float) $order->discount_amount,
                'shipping_fee'     => (float) $order->shipping_fee,
                'total'            => (float) $order->total,
                'shipping_name'    => $order->shipping_name,
                'shipping_phone'   => $order->shipping_phone,
                'shipping_address' => $order->shipping_address,
                'note'             => $order->note,
                'created_at'       => $order->created_at?->toDateTimeString(),
                'customer'         => $order->user ? [
                    'id'    => $order->user->id,
                    'name'  => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                ] : null,
                'items' => $order->items->map(fn($i) => [
                    'id'           => $i->id,
                    'product_name' => $i->product_name,
                    'variant_name' => $i->variant_name,
                    'image'        => $i->product?->primaryImage?->image_url,
                    'price'        => (float) $i->price,
                    'quantity'     => $i->quantity,
                    'subtotal'     => (float) $i->subtotal,
                ]),
                'status_logs' => $order->statusLogs->map(fn($l) => [
                    'status'     => $l->status,
                    'note'       => $l->note,
                    'admin_note' => $l->admin_note,
                    'created_at' => $l->created_at?->toDateTimeString(),
                ]),
            ],
        ]);
    }

    /**
     * Cập nhật trạng thái đơn hàng (admin)
     * PATCH /api/v1/admin/orders/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status'     => ['required', 'in:pending,confirmed,processing,shipping,completed,cancelled,refunded'],
            'note'       => ['nullable', 'string', 'max:1000'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $order = Order::findOrFail($id);

        // Validate luồng trạng thái hợp lệ
        $allowedTransitions = [
            'pending'    => ['confirmed', 'cancelled'],
            'confirmed'  => ['processing', 'cancelled'],
            'processing' => ['shipping', 'cancelled'],
            'shipping'   => ['completed'],
            'completed'  => ['refunded'],
            'cancelled'  => [],
            'refunded'   => [],
        ];

        if (!in_array($data['status'], $allowedTransitions[$order->status] ?? [])) {
            return response()->json([
                'message' => "Không thể chuyển từ trạng thái \"{$order->status}\" sang \"{$data['status']}\".",
            ], 422);
        }

        DB::transaction(function () use ($order, $data, $request) {
            $order->update(['status' => $data['status']]);

            OrderStatusLog::create([
                'order_id'   => $order->id,
                'status'     => $data['status'],
                'note'       => $data['note'] ?? null,
                'admin_note' => $data['admin_note'] ?? null,
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json(['message' => 'Đã cập nhật trạng thái đơn hàng.']);
    }
}
