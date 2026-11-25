<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Kiểm tra tính hợp lệ của mã giảm giá
     * POST /api/v1/coupons/validate
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'         => ['required', 'string'],
            'subtotal'     => ['required', 'numeric', 'min:0'],
            'shipping_fee' => ['nullable', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($request->code));
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json([
                'valid'   => false,
                'message' => 'Mã giảm giá không tồn tại.',
            ], 404);
        }

        $check = $coupon->isValidFor((float) $request->subtotal);
        if (!$check['valid']) {
            return response()->json([
                'valid'   => false,
                'message' => $check['message'],
            ], 422);
        }

        $shippingFee = (float) ($request->shipping_fee ?? ($request->subtotal >= 300000 ? 0 : 25000));
        $discountAmount = $coupon->calculateDiscount((float) $request->subtotal, $shippingFee);

        return response()->json([
            'valid'           => true,
            'message'         => 'Áp dụng mã giảm giá thành công!',
            'coupon'          => [
                'id'          => $coupon->id,
                'code'        => $coupon->code,
                'name'        => $coupon->name,
                'type'        => $coupon->type,
                'value'       => $coupon->value,
            ],
            'discount_amount' => $discountAmount,
            'new_total'       => max(0, (float) $request->subtotal + $shippingFee - $discountAmount),
        ]);
    }
}
