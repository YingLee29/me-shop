<?php

namespace Database\Seeders;

use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use Illuminate\Database\Seeder;

class FlashSaleSeeder extends Seeder
{
    public function run(): void
    {
        $sale = FlashSale::updateOrCreate(
            ['slug' => 'gio-vang-nong-san'],
            [
                'name'         => 'Giờ Vàng Nông Sản',
                'description'  => 'Ưu đãi giá sốc mỗi ngày cho nông sản tươi sạch.',
                'start_at'     => now()->subHour(),
                'end_at'       => now()->addDays(3),
                'is_active'    => true,
            ]
        );

        $products = Product::active()
            ->orderByDesc('is_featured')
            ->orderByDesc('sold_count')
            ->take(6)
            ->get();

        foreach ($products as $index => $product) {
            $base  = (float) ($product->sale_price ?? $product->price);
            $price = max(1000, (int) round($base * 0.8 / 1000) * 1000);

            FlashSaleProduct::updateOrCreate(
                [
                    'flash_sale_id' => $sale->id,
                    'product_id'    => $product->id,
                ],
                [
                    'sale_price'     => $price,
                    'quantity_limit' => 50,
                    'sort_order'     => $index,
                ]
            );
        }

        $this->command->info('⚡ Flash sale: ' . $sale->name . ' (' . $products->count() . ' sản phẩm)');
    }
}
