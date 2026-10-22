<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $couponService)
    {
    }

    /**
     * Kiểm tra mã giảm giá (chỉ để preview – đơn hàng sẽ tính lại khi đặt)
     * POST /api/v1/coupons/validate
     */
    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'     => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'province' => ['nullable', 'string', 'max:120'],
            'district' => ['nullable', 'string', 'max:120'],
            'ward'     => ['nullable', 'string', 'max:120'],
        ]);

        $quote = app(ShippingService::class)->quote(
            $data['province'] ?? null,
            $data['district'] ?? null,
            (float) $data['subtotal'],
        );

        $result = $this->couponService->resolve(
            $data['code'],
            (float) $data['subtotal'],
            auth('sanctum')->user(),
            false,
            (float) $quote['fee'],
        );

        $coupon = $result['coupon'];

        return response()->json([
            'data' => [
                'code'              => $coupon->code,
                'name'              => $coupon->name,
                'type'              => $coupon->type,
                'value'             => (float) $coupon->value,
                'subtotal'          => $result['subtotal'],
                'discount_amount'   => $result['discount_amount'],
                'shipping_fee'      => $result['shipping_fee'],
                'shipping_discount' => $result['shipping_discount'],
                'total'             => $result['total'],
                'message'           => $result['message'],
            ],
        ]);
    }
}
