<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    /**
     * Danh sách mã giảm giá
     * GET /api/v1/admin/coupons
     */
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                    ->orWhere('name', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $coupons = $query->orderByDesc('created_at')->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'data' => $coupons->getCollection()->map(fn(Coupon $coupon) => $this->formatCoupon($coupon)),
            'meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page'    => $coupons->lastPage(),
                'total'        => $coupons->total(),
            ],
            'summary' => [
                'total'      => Coupon::count(),
                'active'     => Coupon::where('is_active', true)->count(),
                'used_count' => (int) Coupon::sum('used_count'),
            ],
        ]);
    }

    /**
     * Chi tiết mã giảm giá
     * GET /api/v1/admin/coupons/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'data' => $this->formatCoupon(Coupon::findOrFail($id)),
        ]);
    }

    /**
     * Tạo mã giảm giá
     * POST /api/v1/admin/coupons
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateCoupon($request);
        $data['code'] = strtoupper($data['code']);

        $coupon = Coupon::create($data);

        return response()->json([
            'message' => 'Đã tạo mã giảm giá.',
            'data'    => $this->formatCoupon($coupon),
        ], 201);
    }

    /**
     * Cập nhật mã giảm giá
     * PUT /api/v1/admin/coupons/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $data   = $this->validateCoupon($request, $coupon->id);
        $data['code'] = strtoupper($data['code']);

        $coupon->update($data);

        return response()->json([
            'message' => 'Đã cập nhật mã giảm giá.',
            'data'    => $this->formatCoupon($coupon->fresh()),
        ]);
    }

    /**
     * Xóa mã giảm giá
     * DELETE /api/v1/admin/coupons/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();

        return response()->json(['message' => 'Đã xóa mã giảm giá.']);
    }

    // ── Helpers ───────────────────────────────────────────

    private function validateCoupon(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'code'             => [
                'required', 'string', 'max:50',
                Rule::unique('coupons', 'code')->ignore($ignoreId),
            ],
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'type'             => ['required', 'in:percent,fixed,freeship'],
            'value'            => ['nullable', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount'     => ['nullable', 'numeric', 'min:0'],
            'usage_limit'      => ['nullable', 'integer', 'min:1'],
            'user_limit'       => ['nullable', 'integer', 'min:1'],
            'starts_at'        => ['nullable', 'date'],
            'expired_at'       => ['nullable', 'date'],
            'is_active'        => ['boolean'],
        ]);

        $data['code']             = strtoupper(trim($data['code']));
        $data['value']            = $data['value'] ?? 0;
        $data['min_order_amount'] = $data['min_order_amount'] ?? 0;
        $data['is_active']        = $data['is_active'] ?? true;

        if ($data['type'] === 'percent' && (float) $data['value'] > 100) {
            throw ValidationException::withMessages([
                'value' => 'Phần trăm giảm giá không được lớn hơn 100.',
            ]);
        }

        if ($data['type'] === 'freeship') {
            $data['value'] = 0;
        }

        if (!empty($data['starts_at']) && !empty($data['expired_at'])
            && strtotime($data['expired_at']) <= strtotime($data['starts_at'])
        ) {
            throw ValidationException::withMessages([
                'expired_at' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
            ]);
        }

        return $data;
    }

    private function formatCoupon(Coupon $coupon): array
    {
        return [
            'id'               => $coupon->id,
            'code'             => $coupon->code,
            'name'             => $coupon->name,
            'description'      => $coupon->description,
            'type'             => $coupon->type,
            'value'            => (float) $coupon->value,
            'min_order_amount' => (float) $coupon->min_order_amount,
            'max_discount'     => $coupon->max_discount !== null ? (float) $coupon->max_discount : null,
            'usage_limit'      => $coupon->usage_limit,
            'used_count'       => $coupon->used_count,
            'user_limit'       => $coupon->user_limit,
            'starts_at'        => $coupon->starts_at?->toDateTimeString(),
            'expired_at'       => $coupon->expired_at?->toDateTimeString(),
            'is_active'        => $coupon->is_active,
            'status'           => $coupon->status,
            'created_at'       => $coupon->created_at?->toDateTimeString(),
        ];
    }
}
