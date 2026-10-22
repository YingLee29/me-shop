<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\ReviewService;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(ReviewService $reviewService): void
    {
        $customer = User::where('email', 'khach@example.com')->first();

        if (!$customer) {
            $this->command->warn('Bỏ qua ReviewSeeder: chưa có tài khoản khách mẫu.');
            return;
        }

        $samples = [
            ['rating' => 5, 'title' => 'Thơm ấm, đóng gói kỹ', 'content' => 'Gừng thơm tự nhiên, vị cay ấm vừa phải. Hũ được đóng gói cẩn thận, giao đúng hẹn.'],
            ['rating' => 4, 'title' => 'Chất lượng tốt', 'content' => 'Sản phẩm đúng mô tả, hương vị dễ dùng. Sẽ tiếp tục ủng hộ MocSon Farm trong lần sau.'],
            ['rating' => 5, 'title' => 'Đáng tiền', 'content' => 'Đặc sản Nghệ An thơm ngon, vị tự nhiên. Đóng gói chắc chắn, nhân viên tư vấn nhiệt tình.'],
            ['rating' => 5, 'title' => 'Rất hài lòng', 'content' => 'Mua lần đầu nhưng chất lượng vượt mong đợi. Trà gừng và tinh bột nghệ đều thơm, dễ dùng.'],
        ];

        $products = Product::active()->orderBy('id')->get();

        foreach ($products as $index => $product) {
            $sample = $samples[$index % count($samples)];
            $dayOffset = ($index % 25) + 1;
            $price = (float) $product->price;
            $shippingFee = $price >= 300000 ? 0 : 25000;

            $order = Order::withoutEvents(function () use ($customer, $product, $price, $shippingFee, $dayOffset) {
                return Order::firstOrCreate(
                    ['order_code' => 'DEMO-REVIEW-' . $product->id],
                    [
                        'user_id'         => $customer->id,
                        'status'          => Order::STATUS_COMPLETED,
                        'payment_method'  => 'cod',
                        'payment_status'  => 'paid',
                        'shipping_name'   => $customer->name,
                        'shipping_phone'  => $customer->phone ?: '0909876543',
                        'shipping_email'  => $customer->email,
                        'shipping_address' => $customer->address ?: 'TP. Hồ Chí Minh',
                        'subtotal'        => $price,
                        'shipping_fee'    => $shippingFee,
                        'total'           => $price + $shippingFee,
                        'paid_at'         => now()->subDays($dayOffset + 2),
                        'created_at'      => now()->subDays($dayOffset + 4),
                        'updated_at'      => now()->subDays($dayOffset + 2),
                    ],
                );
            });

            $item = OrderItem::firstOrCreate(
                ['order_id' => $order->id, 'product_id' => $product->id],
                [
                    'product_name'  => $product->name,
                    'product_sku'   => $product->sku,
                    'product_image' => null,
                    'price'         => $price,
                    'quantity'      => 1,
                    'subtotal'      => $price,
                ],
            );

            Review::firstOrCreate(
                ['order_item_id' => $item->id],
                [
                    'product_id'  => $product->id,
                    'user_id'     => $customer->id,
                    'rating'      => $sample['rating'],
                    'title'       => $sample['title'],
                    'content'     => $sample['content'],
                    'is_approved' => true,
                    'approved_at' => now()->subDays($dayOffset + 1),
                    'created_at'  => now()->subDays($dayOffset + 1),
                    'updated_at'  => now()->subDays($dayOffset + 1),
                ],
            );

            $item->update(['is_reviewed' => true]);
            $reviewService->recalculate($product->fresh());
        }

        $this->command->info('✅ Đánh giá mẫu đã được tạo.');
    }
}
