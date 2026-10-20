<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /** Miễn phí vận chuyển từ 300.000đ */
    public const FREE_SHIP_THRESHOLD = 300000;

    /** Phí vận chuyển mặc định */
    public const DEFAULT_SHIPPING_FEE = 25000;

    public static function shippingFee(float $subtotal): float
    {
        return $subtotal >= self::FREE_SHIP_THRESHOLD ? 0 : self::DEFAULT_SHIPPING_FEE;
    }

    /**
     * Kiểm tra coupon và tính tiền giảm giá.
     *
     * @return array{
     *     coupon: ?Coupon,
     *     subtotal: float,
     *     shipping_fee: float,
     *     discount_amount: float,
     *     shipping_discount: float,
     *     total: float,
     *     message: string
     * }
     *
     * @throws ValidationException khi coupon không hợp lệ
     */
    public function resolve(
        ?string $code,
        float $subtotal,
        ?User $user = null,
        bool $lock = false
    ): array {
        $subtotal   = max(0, $subtotal);
        $shipping   = self::shippingFee($subtotal);
        $noCoupon   = [
            'coupon'            => null,
            'subtotal'          => $subtotal,
            'shipping_fee'      => $shipping,
            'discount_amount'   => 0.0,
            'shipping_discount' => 0.0,
            'total'             => $subtotal + $shipping,
            'message'           => '',
        ];

        $code = trim((string) $code);
        if ($code === '') {
            return $noCoupon;
        }

        $query = Coupon::where('code', strtoupper($code));
        if ($lock) {
            $query->lockForUpdate();
        }
        $coupon = $query->first();

        if (!$coupon) {
            $this->invalid('Mã giảm giá không tồn tại.');
        }
        if (!$coupon->is_active) {
            $this->invalid('Mã giảm giá đã bị vô hiệu hóa.');
        }
        if (!$coupon->isStarted()) {
            $this->invalid('Mã giảm giá chưa đến thời gian sử dụng.');
        }
        if ($coupon->isExpired()) {
            $this->invalid('Mã giảm giá đã hết hạn.');
        }
        if ($coupon->isOutOfUsage()) {
            $this->invalid('Mã giảm giá đã được sử dụng hết lượt.');
        }
        if ($subtotal < (float) $coupon->min_order_amount) {
            $this->invalid(
                'Đơn hàng tối thiểu ' . number_format((float) $coupon->min_order_amount, 0, ',', '.') . 'đ để dùng mã này.'
            );
        }

        if ($user && $coupon->user_limit !== null) {
            $usedByUser = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();

            if ($usedByUser >= $coupon->user_limit) {
                $this->invalid('Bạn đã sử dụng mã giảm giá này rồi.');
            }
        }

        $discount         = 0.0;
        $shippingDiscount = 0.0;
        $message          = '';

        switch ($coupon->type) {
            case 'percent':
                $discount = $subtotal * ((float) $coupon->value / 100);
                if ($coupon->max_discount !== null) {
                    $discount = min($discount, (float) $coupon->max_discount);
                }
                $message = 'Giảm ' . rtrim(rtrim(number_format((float) $coupon->value, 2, '.', ''), '0'), '.') . '%';
                break;

            case 'fixed':
                $discount = (float) $coupon->value;
                $message = 'Giảm ' . number_format((float) $coupon->value, 0, ',', '.') . 'đ';
                break;

            case 'freeship':
                $shippingDiscount = $shipping;
                $message = $shipping > 0 ? 'Miễn phí vận chuyển' : 'Đơn hàng đã được miễn phí vận chuyển';
                break;
        }

        $discount = min($discount, $subtotal);
        $total    = max(0, $subtotal - $discount + $shipping - $shippingDiscount);

        return [
            'coupon'            => $coupon,
            'subtotal'          => $subtotal,
            'shipping_fee'      => $shipping,
            'discount_amount'   => round($discount),
            'shipping_discount' => round($shippingDiscount),
            'total'             => round($total),
            'message'           => $message,
        ];
    }

    /** Ghi nhận lượt sử dụng coupon (gọi trong transaction tạo đơn) */
    public function recordUsage(Coupon $coupon, ?int $userId, int $orderId, float $discountAmount): CouponUsage
    {
        $coupon->increment('used_count');

        return CouponUsage::create([
            'coupon_id'       => $coupon->id,
            'user_id'         => $userId,
            'order_id'        => $orderId,
            'discount_amount' => round($discountAmount),
        ]);
    }

    private function invalid(string $message): never
    {
        throw ValidationException::withMessages(['coupon_code' => $message]);
    }
}
