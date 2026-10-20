<?php

namespace App\Services;

use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoyaltyService
{
    /** 10.000đ chi tiêu = 1 điểm */
    public const AMOUNT_PER_POINT = 10000;

    /** 1 điểm = 100đ khi thanh toán */
    public const POINT_VALUE = 100;

    /** Điểm tối thiểu để bắt đầu sử dụng (tránh đơn 0đ) */
    public const MIN_REDEEM_POINTS = 10;

    public function pointsDiscount(int $points): float
    {
        return max(0, $points) * self::POINT_VALUE;
    }

    /**
     * Kiểm tra số điểm khách muốn dùng có hợp lệ không.
     *
     * @throws ValidationException
     */
    public function validateRedeem(?User $user, int $points): int
    {
        if ($points <= 0) {
            return 0;
        }

        if (!$user) {
            throw ValidationException::withMessages([
                'points_used' => 'Vui lòng đăng nhập để sử dụng điểm thưởng.',
            ]);
        }

        if ($points < self::MIN_REDEEM_POINTS) {
            throw ValidationException::withMessages([
                'points_used' => 'Số điểm sử dụng tối thiểu là ' . self::MIN_REDEEM_POINTS . ' điểm.',
            ]);
        }

        if ($points > $user->loyalty_points) {
            throw ValidationException::withMessages([
                'points_used' => 'Bạn chỉ còn ' . $user->loyalty_points . ' điểm.',
            ]);
        }

        return $points;
    }

    /** Trừ điểm khi khách dùng để thanh toán */
    public function redeem(User $user, int $points, int $orderId, float $discount): void
    {
        if ($points <= 0) {
            return;
        }

        $user->decrement('loyalty_points', $points);

        LoyaltyTransaction::create([
            'user_id'     => $user->id,
            'order_id'    => $orderId,
            'type'        => 'redeem',
            'points'      => -$points,
            'description' => 'Dùng ' . number_format($points, 0, ',', '.') . ' điểm cho đơn hàng #' . $orderId
                . ' (giảm ' . number_format($discount, 0, ',', '.') . 'đ)',
        ]);
    }

    /**
     * Cộng điểm khi đơn hoàn thành (idempotent theo order).
     */
    public function awardForOrder(Order $order): ?LoyaltyTransaction
    {
        if (!$order->user_id || $order->status !== Order::STATUS_COMPLETED) {
            return null;
        }

        $alreadyEarned = LoyaltyTransaction::where('order_id', $order->id)
            ->where('type', 'earn')
            ->exists();

        if ($alreadyEarned) {
            return null;
        }

        $points = (int) floor((float) $order->total / self::AMOUNT_PER_POINT);
        if ($points <= 0) {
            return null;
        }

        return DB::transaction(function () use ($order, $points) {
            User::whereKey($order->user_id)->increment('loyalty_points', $points);

            return LoyaltyTransaction::create([
                'user_id'     => $order->user_id,
                'order_id'    => $order->id,
                'type'        => 'earn',
                'points'      => $points,
                'description' => 'Tích điểm từ đơn hàng ' . $order->order_code,
            ]);
        });
    }

    /** Hoàn điểm đã dùng khi đơn bị hủy */
    public function refundRedeemed(Order $order): void
    {
        if (!$order->user_id || $order->points_used <= 0) {
            return;
        }

        $alreadyRefunded = LoyaltyTransaction::where('order_id', $order->id)
            ->where('type', 'refund')
            ->exists();

        if ($alreadyRefunded) {
            return;
        }

        DB::transaction(function () use ($order) {
            User::whereKey($order->user_id)->increment('loyalty_points', $order->points_used);

            LoyaltyTransaction::create([
                'user_id'     => $order->user_id,
                'order_id'    => $order->id,
                'type'        => 'refund',
                'points'      => $order->points_used,
                'description' => 'Hoàn điểm do hủy đơn hàng ' . $order->order_code,
            ]);
        });
    }

    /** Thu hồi điểm đã cộng nếu đơn hoàn thành bị refund */
    public function reverseEarned(Order $order): void
    {
        if (!$order->user_id) {
            return;
        }

        $earned = LoyaltyTransaction::where('order_id', $order->id)
            ->where('type', 'earn')
            ->first();

        if (!$earned) {
            return;
        }

        $alreadyReversed = LoyaltyTransaction::where('order_id', $order->id)
            ->where('type', 'adjust')
            ->exists();

        if ($alreadyReversed) {
            return;
        }

        DB::transaction(function () use ($order, $earned) {
            User::whereKey($order->user_id)->decrement('loyalty_points', $earned->points);

            LoyaltyTransaction::create([
                'user_id'     => $order->user_id,
                'order_id'    => $order->id,
                'type'        => 'adjust',
                'points'      => -$earned->points,
                'description' => 'Thu hồi điểm do hoàn tiền đơn hàng ' . $order->order_code,
            ]);
        });
    }
}
