<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        // ── Seed Coupons ──
        $coupons = [
            [
                'code'                => 'CHAOBANMOI',
                'name'                => 'Giảm 20K Cho Đơn Đầu Tiên',
                'type'                => 'fixed',
                'value'               => 20000,
                'min_order_amount'    => 100000,
                'max_discount_amount' => null,
                'usage_limit'         => 500,
                'used_count'          => 12,
                'start_at'            => now()->subDays(5),
                'expired_at'          => now()->addDays(30),
                'is_active'           => true,
            ],
            [
                'code'                => 'VIETGAP10',
                'name'                => 'Giảm 10% Nông Sản VietGAP',
                'type'                => 'percent',
                'value'               => 10,
                'min_order_amount'    => 150000,
                'max_discount_amount' => 50000,
                'usage_limit'         => 300,
                'used_count'          => 28,
                'start_at'            => now()->subDays(2),
                'expired_at'          => now()->addDays(20),
                'is_active'           => true,
            ],
            [
                'code'                => 'FREESHIP',
                'name'                => 'Miễn Phí Vận Chuyển',
                'type'                => 'freeship',
                'value'               => 25000,
                'min_order_amount'    => 200000,
                'max_discount_amount' => 25000,
                'usage_limit'         => 1000,
                'used_count'          => 85,
                'start_at'            => now()->subDays(10),
                'expired_at'          => now()->addDays(60),
                'is_active'           => true,
            ],
        ];

        foreach ($coupons as $c) {
            Coupon::updateOrCreate(['code' => $c['code']], $c);
        }

        // ── Seed Flash Sale ──
        $flashSale = FlashSale::updateOrCreate(
            ['slug' => 'gio-vang-nong-san-hom-nay'],
            [
                'name'       => 'Giờ Vàng Nông Sản Hôm Nay',
                'banner_url' => 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80',
                'start_at'   => now()->subHours(2),
                'end_at'     => now()->addHours(22),
                'is_active'  => true,
            ]
        );

        $products = Product::whereIn('id', [1, 6, 10, 11])->get();
        $salePrices = [
            1  => 12000,  // Cải xanh hữu cơ (gốc 18k)
            6  => 135000, // Sầu riêng Ri6 (gốc 180k)
            10 => 220000, // Tôm sú (gốc 280k)
            11 => 75000,  // Trứng gà (gốc 95k)
        ];

        foreach ($products as $p) {
            FlashSaleProduct::updateOrCreate(
                [
                    'flash_sale_id' => $flashSale->id,
                    'product_id'    => $p->id,
                ],
                [
                    'flash_sale_price' => $salePrices[$p->id] ?? ($p->price * 0.8),
                    'limit_quantity'   => 50,
                    'sold_quantity'    => rand(12, 38),
                ]
            );
        }

        $this->command->info('✅ Đã tạo mã giảm giá & đợt Flash Sale mẫu.');
    }
}
