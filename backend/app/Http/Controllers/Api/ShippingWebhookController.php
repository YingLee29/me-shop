<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShippingWebhookController extends Controller
{
    public function __construct(private readonly ShippingService $shippingService)
    {
    }

    /**
     * Webhook trạng thái GHN.
     * POST /api/v1/webhooks/ghn
     */
    public function ghn(Request $request): JsonResponse
    {
        $secret = (string) config('services.ghn.webhook_secret', 'demo-ghn-secret');
        $provided = (string) ($request->header('X-GHN-Webhook-Secret') ?? $request->input('secret', ''));

        if ($provided === '' || !hash_equals($secret, $provided)) {
            return response()->json(['message' => 'Webhook secret không hợp lệ.'], 401);
        }

        $data = $request->validate([
            'order_code'    => ['required', 'string', 'max:50'],
            'tracking_code' => ['nullable', 'string', 'max:100'],
            'event_id'      => ['nullable', 'string', 'max:120'],
            'status'        => ['required', 'string', 'max:60'],
            'description'   => ['nullable', 'string', 'max:500'],
            'occurred_at'   => ['nullable', 'date'],
        ]);

        try {
            $order = $this->shippingService->handleWebhook($data);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng.'], 404);
        }

        Log::info('GHN webhook processed', [
            'order_code' => $order->order_code,
            'status'     => $data['status'],
            'event_id'   => $data['event_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Đã cập nhật trạng thái vận chuyển.',
            'data' => [
                'order_code'       => $order->order_code,
                'order_status'     => $order->status,
                'shipping_status'  => $order->shipping_status,
                'tracking_code'    => $order->tracking_code,
            ],
        ]);
    }
}
