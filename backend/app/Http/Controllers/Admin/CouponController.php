<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Danh sách mã giảm giá
     * GET /api/v1/admin/coupons
     */
    public function index(): JsonResponse
    {
        $coupons = Coupon::withCount('usages')->latest()->get();

        return response()->json([
            'data' => $coupons,
        ]);
    }

    /**
     * Tạo mã giảm giá mới
     * POST /api/v1/admin/coupons
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'                => ['required', 'string', 'unique:coupons,code'],
            'name'                => ['required', 'string', 'max:255'],
            'type'                => ['required', 'in:percent,fixed,freeship'],
            'value'               => ['required', 'numeric', 'min:0'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'         => ['nullable', 'integer', 'min:1'],
            'start_at'            => ['nullable', 'date'],
            'expired_at'          => ['nullable', 'date'],
            'is_active'           => ['boolean'],
        ]);

        $data['code'] = strtoupper(trim($data['code']));
        $coupon = Coupon::create($data);

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công!',
            'data'    => $coupon,
        ], 201);
    }

    /**
     * Cập nhật mã giảm giá
     * PUT /api/v1/admin/coupons/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $data = $request->validate([
            'code'                => ['required', 'string', 'unique:coupons,code,' . $id],
            'name'                => ['required', 'string', 'max:255'],
            'type'                => ['required', 'in:percent,fixed,freeship'],
            'value'               => ['required', 'numeric', 'min:0'],
            'min_order_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'         => ['nullable', 'integer', 'min:1'],
            'start_at'            => ['nullable', 'date'],
            'expired_at'          => ['nullable', 'date'],
            'is_active'           => ['boolean'],
        ]);

        $data['code'] = strtoupper(trim($data['code']));
        $coupon->update($data);

        return response()->json([
            'message' => 'Cập nhật mã giảm giá thành công!',
            'data'    => $coupon,
        ]);
    }

    /**
     * Xóa mã giảm giá
     * DELETE /api/v1/admin/coupons/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'message' => 'Đã xóa mã giảm giá.',
        ]);
    }
}
