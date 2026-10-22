<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(private readonly ShippingService $shippingService)
    {
    }

    /**
     * Báo giá vận chuyển theo địa chỉ (public).
     * POST /api/v1/shipping/quote
     */
    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'province' => ['nullable', 'string', 'max:120'],
            'district' => ['nullable', 'string', 'max:120'],
            'ward'     => ['nullable', 'string', 'max:120'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'weight'   => ['nullable', 'integer', 'min:1', 'max:50000'],
        ]);

        $quote = $this->shippingService->quote(
            $data['province'] ?? null,
            $data['district'] ?? null,
            (float) $data['subtotal'],
            (int) ($data['weight'] ?? 500),
        );

        return response()->json([
            'data' => array_merge($quote, [
                'province' => $data['province'] ?? null,
                'district' => $data['district'] ?? null,
                'ward'     => $data['ward'] ?? null,
                'note'     => $quote['fee'] == 0
                    ? 'Đơn hàng được miễn phí vận chuyển.'
                    : null,
            ]),
        ]);
    }
}
