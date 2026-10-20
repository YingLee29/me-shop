<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code'             => 'SALE10',
                'name'             => 'Giảm 10% toàn bộ đơn hàng',
                'description'      => 'Áp dụng cho đơn từ 100.000đ, giảm tối đa 50.000đ.',
                'type'             => 'percent',
                'value'            => 10,
                'min_order_amount' => 100000,
                'max_discount'     => 50000,
                'usage_limit'      => 200,
                'user_limit'       => 1,
                'expired_at'       => now()->addMonth(),
                'is_active'        => true,
            ],
            [
                'code'             => 'FREESHIP',
                'name'             => 'Miễn phí vận chuyển',
                'description'      => 'Miễn phí giao hàng cho đơn từ 150.000đ.',
                'type'             => 'freeship',
                'value'            => 0,
                'min_order_amount' => 150000,
                'max_discount'     => null,
                'usage_limit'      => null,
                'user_limit'       => null,
                'expired_at'       => now()->addMonth(),
                'is_active'        => true,
            ],
            [
                'code'             => 'GIAM20K',
                'name'             => 'Giảm ngay 20.000đ',
                'description'      => 'Áp dụng cho đơn từ 200.000đ.',
                'type'             => 'fixed',
                'value'            => 20000,
                'min_order_amount' => 200000,
                'max_discount'     => null,
                'usage_limit'      => 100,
                'user_limit'       => 2,
                'expired_at'       => now()->addWeeks(2),
                'is_active'        => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(['code' => $coupon['code']], $coupon);
        }

        $this->command->info('🎟️  Coupons: ' . count($coupons) . ' mã giảm giá mẫu');
    }
}
