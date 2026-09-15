<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Lịch sử đơn hàng của customer
     * GET /api/v1/orders
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product.primaryImage'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'data' => $orders->map(fn($o) => $this->formatOrder($o, false)),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    /**
     * Chi tiết đơn hàng
     * GET /api/v1/orders/{code}
     */
    public function show(Request $request, string $code): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_code', $code)
            ->with(['items.product.primaryImage', 'items.variant', 'statusLogs'])
            ->firstOrFail();

        return response()->json(['data' => $this->formatOrder($order, true)]);
    }

    /**
     * Đặt hàng
     * POST /api/v1/orders
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shipping_name'    => ['required', 'string', 'max:255'],
            'shipping_phone'   => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'payment_method'   => ['required', 'in:cod,bank_transfer,momo,vnpay'],
            'note'             => ['nullable', 'string', 'max:1000'],
            'coupon_code'      => ['nullable', 'string'],
        ]);

        $cartItems = Cart::with(['product', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng trống.'], 422);
        }

        // Kiểm tra tồn kho trước khi đặt
        foreach ($cartItems as $item) {
            $stock = $item->variant ? $item->variant->stock : $item->product->stock_quantity;
            if ($item->quantity > $stock) {
                return response()->json([
                    'message' => "Sản phẩm \"{$item->product->name}\" không đủ tồn kho.",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($data, $cartItems, $request) {
            $subtotal  = $cartItems->sum(fn($i) => $i->price * $i->quantity);
            $discount  = 0; // TODO: áp dụng coupon Phase 2
            $shipping  = 0; // TODO: tính phí ship Phase 4
            $total     = $subtotal - $discount + $shipping;

            $order = Order::create([
                'user_id'          => $request->user()->id,
                'order_code'       => $this->generateOrderCode(),
                'status'           => 'pending',
                'payment_method'   => $data['payment_method'],
                'payment_status'   => 'unpaid',
                'subtotal'         => $subtotal,
                'discount_amount'  => $discount,
                'shipping_fee'     => $shipping,
                'total'            => $total,
                'shipping_name'    => $data['shipping_name'],
                'shipping_phone'   => $data['shipping_phone'],
                'shipping_address' => $data['shipping_address'],
                'note'             => $data['note'] ?? null,
            ]);

            // Tạo order items + trừ tồn kho
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'    => $order->id,
                    'product_id'  => $item->product_id,
                    'variant_id'  => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_name' => $item->variant ? ($item->variant->name . ': ' . $item->variant->value) : null,
                    'price'       => $item->price,
                    'quantity'    => $item->quantity,
                    'subtotal'    => $item->price * $item->quantity,
                ]);

                // Trừ tồn kho
                if ($item->variant) {
                    $item->variant->decrement('stock', $item->quantity);
                } else {
                    $item->product->decrement('stock_quantity', $item->quantity);
                }
                $item->product->increment('sold_count', $item->quantity);
            }

            // Ghi log trạng thái
            OrderStatusLog::create([
                'order_id'   => $order->id,
                'status'     => 'pending',
                'note'       => 'Đơn hàng được tạo thành công.',
                'created_by' => $request->user()->id,
            ]);

            // Xóa giỏ hàng
            Cart::where('user_id', $request->user()->id)->delete();

            return $order;
        });

        return response()->json([
            'message'    => 'Đặt hàng thành công!',
            'order_code' => $order->order_code,
            'total'      => (float) $order->total,
        ], 201);
    }

    /**
     * Hủy đơn hàng
     * POST /api/v1/orders/{code}/cancel
     */
    public function cancel(Request $request, string $code): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_code', $code)
            ->firstOrFail();

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Không thể hủy đơn hàng ở trạng thái hiện tại.',
            ], 422);
        }

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($order, $data, $request) {
            $order->update(['status' => 'cancelled']);

            // Hoàn lại tồn kho
            foreach ($order->items as $item) {
                if ($item->variant_id) {
                    $item->variant?->increment('stock', $item->quantity);
                } else {
                    $item->product?->increment('stock_quantity', $item->quantity);
                }
                $item->product?->decrement('sold_count', $item->quantity);
            }

            OrderStatusLog::create([
                'order_id'   => $order->id,
                'status'     => 'cancelled',
                'note'       => $data['reason'] ?? 'Khách hàng hủy đơn.',
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json(['message' => 'Đã hủy đơn hàng.']);
    }

    // ── Helpers ───────────────────────────────────────────

    private function generateOrderCode(): string
    {
        return 'NS' . date('YmdHis') . rand(1000, 9999);
    }

    private function formatOrder(Order $order, bool $full): array
    {
        $result = [
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
            'items'            => $order->items->map(fn($i) => [
                'id'           => $i->id,
                'product_name' => $i->product_name,
                'variant_name' => $i->variant_name,
                'image'        => $i->product?->primaryImage?->image_url,
                'price'        => (float) $i->price,
                'quantity'     => $i->quantity,
                'subtotal'     => (float) $i->subtotal,
            ]),
        ];

        if ($full) {
            $result['status_logs'] = $order->statusLogs->map(fn($l) => [
                'status'     => $l->status,
                'note'       => $l->note,
                'created_at' => $l->created_at?->toDateTimeString(),
            ]);
        }

        return $result;
    }
}
