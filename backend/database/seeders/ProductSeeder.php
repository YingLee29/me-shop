<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $rauLa     = Category::where('slug', 'rau-la')->first();
        $cuQua     = Category::where('slug', 'cu-qua')->first();
        $traiCay   = Category::where('slug', 'trai-cay-nhiet-doi')->first();
        $thitHeo   = Category::where('slug', 'thit-heo')->first();
        $thitGa    = Category::where('slug', 'thit-ga')->first();
        $thuysan   = Category::where('slug', 'thuy-san')->first();
        $trungSua  = Category::where('slug', 'trung-sua')->first();
        $giaVi     = Category::where('slug', 'gia-vi-kho')->first();

        $rauLaId   = $rauLa?->id ?? Category::where('slug', 'rau-cu')->value('id');
        $cuQuaId   = $cuQua?->id ?? $rauLaId;
        $traiCayId = $traiCay?->id ?? Category::where('slug', 'trai-cay')->value('id');
        $thitHeoId = $thitHeo?->id ?? Category::where('slug', 'thit-sach')->value('id');
        $thitGaId  = $thitGa?->id ?? $thitHeoId;
        $thuysanId = $thuysan?->id ?? Category::where('slug', 'thuy-san')->value('id');
        $trungId   = $trungSua?->id ?? Category::where('slug', 'trung-sua')->value('id');
        $giaViId   = $giaVi?->id ?? Category::where('slug', 'gia-vi-kho')->value('id');

        $products = [
            // Rau lá
            [
                'category_id'       => $rauLaId,
                'name'              => 'Cải Xanh Hữu Cơ',
                'slug'              => 'cai-xanh-huu-co',
                'sku'               => 'RAU-001',
                'short_description' => 'Cải xanh trồng theo tiêu chuẩn hữu cơ, không thuốc trừ sâu',
                'description'       => '<p>Cải xanh hữu cơ được trồng tại vùng Đà Lạt với khí hậu mát mẻ. Sản phẩm đạt chứng nhận VietGAP, không sử dụng thuốc bảo vệ thực vật tổng hợp. Thu hoạch buổi sáng, giao hàng trong ngày.</p>',
                'price'             => 18000,
                'sale_price'        => 15000,
                'stock_quantity'    => 200,
                'unit'              => 'bó (300g)',
                'origin'            => 'Đà Lạt, Lâm Đồng',
                'is_featured'       => true,
                'sold_count'        => 342,
                'avg_rating'        => 4.8,
                'review_count'      => 56,
            ],
            [
                'category_id'       => $rauLaId,
                'name'              => 'Rau Muống Vườn Nhà',
                'slug'              => 'rau-muong-vuon-nha',
                'sku'               => 'RAU-002',
                'short_description' => 'Rau muống tươi, giòn, không phân bón hóa học',
                'description'       => '<p>Rau muống được trồng tại vườn gia đình, tưới nước giếng sạch, bón phân hữu cơ. Thu hoạch mỗi sáng sớm, đảm bảo độ tươi khi giao đến tay khách.</p>',
                'price'             => 12000,
                'sale_price'        => null,
                'stock_quantity'    => 150,
                'unit'              => 'bó (400g)',
                'origin'            => 'Củ Chi, TP.HCM',
                'is_featured'       => false,
                'sold_count'        => 128,
                'avg_rating'        => 4.5,
                'review_count'      => 22,
            ],
            // Củ quả
            [
                'category_id'       => $cuQuaId,
                'name'              => 'Cà Rốt Baby Đà Lạt',
                'slug'              => 'ca-rot-baby-da-lat',
                'sku'               => 'RAU-003',
                'short_description' => 'Cà rốt baby nhỏ xinh, ngọt giòn, giàu vitamin A',
                'description'       => '<p>Cà rốt baby được trồng ở độ cao 1500m tại Đà Lạt. Kích thước nhỏ, vỏ mỏng, không cần gọt vỏ khi ăn. Giàu beta-carotene và vitamin A, tốt cho mắt và da.</p>',
                'price'             => 35000,
                'sale_price'        => 28000,
                'stock_quantity'    => 80,
                'unit'              => 'túi 500g',
                'origin'            => 'Đà Lạt, Lâm Đồng',
                'is_featured'       => true,
                'is_flash_sale'     => true,
                'flash_sale_price'  => 22000,
                'flash_sale_end_at' => now()->addDays(2),
                'sold_count'        => 520,
                'avg_rating'        => 4.9,
                'review_count'      => 87,
            ],
            [
                'category_id'       => $cuQuaId,
                'name'              => 'Bí Đỏ Hokaido',
                'slug'              => 'bi-do-hokaido',
                'sku'               => 'RAU-004',
                'short_description' => 'Bí đỏ Hokaido vỏ xanh, thịt vàng đậm, cực ngọt',
                'description'       => '<p>Giống bí Hokaido (Nhật Bản) được trồng tại Lâm Đồng. Vỏ mỏng ăn được, ruột đặc màu cam vàng, vị ngọt tự nhiên. Thích hợp nấu cháo, hầm, làm bánh.</p>',
                'price'             => 45000,
                'sale_price'        => null,
                'stock_quantity'    => 60,
                'unit'              => 'kg',
                'origin'            => 'Lâm Đồng',
                'is_featured'       => false,
                'sold_count'        => 89,
                'avg_rating'        => 4.6,
                'review_count'      => 15,
            ],
            // Trái cây
            [
                'category_id'       => $traiCayId,
                'name'              => 'Xoài Cát Chu Cao Lãnh',
                'slug'              => 'xoai-cat-chu-cao-lanh',
                'sku'               => 'TC-001',
                'short_description' => 'Xoài cát chu đặc sản Đồng Tháp, thịt vàng, hạt nhỏ',
                'description'       => '<p>Xoài cát chu Cao Lãnh – đặc sản nổi tiếng miền Tây. Trái to đều, vỏ vàng bóng khi chín, thịt dày, xơ ít, vị ngọt thơm đặc trưng. Trái được chọn lọc kỹ, đóng gói cẩn thận.</p>',
                'price'             => 55000,
                'sale_price'        => 48000,
                'stock_quantity'    => 100,
                'unit'              => 'kg',
                'origin'            => 'Cao Lãnh, Đồng Tháp',
                'is_featured'       => true,
                'sold_count'        => 673,
                'avg_rating'        => 4.9,
                'review_count'      => 124,
            ],
            [
                'category_id'       => $traiCayId,
                'name'              => 'Sầu Riêng Ri6 Cơm Vàng',
                'slug'              => 'sau-rieng-ri6-com-vang',
                'sku'               => 'TC-002',
                'short_description' => 'Sầu riêng Ri6 cơm vàng, hạt lép, mùi thơm cực đặc biệt',
                'description'       => '<p>Sầu riêng Ri6 từ vườn ở Cái Mơn (Bến Tre) và Cai Lậy (Tiền Giang). Cơm dày, màu vàng nghệ, hạt lép tròn, vị béo ngọt quyện lẫn mùi thơm nồng đặc trưng. Múi đẹp, không sượng.</p>',
                'price'             => 180000,
                'sale_price'        => 155000,
                'stock_quantity'    => 30,
                'unit'              => 'kg',
                'origin'            => 'Cai Lậy, Tiền Giang',
                'is_featured'       => true,
                'sold_count'        => 215,
                'avg_rating'        => 5.0,
                'review_count'      => 43,
            ],
            // Thịt
            [
                'category_id'       => $thitHeoId,
                'name'              => 'Thịt Ba Chỉ Heo Sạch',
                'slug'              => 'thit-ba-chi-heo-sach',
                'sku'               => 'THIT-001',
                'short_description' => 'Thịt ba chỉ từ heo nuôi không kháng sinh, chứng nhận VietGAP',
                'description'       => '<p>Heo được nuôi thả trong môi trường sạch, thức ăn không chứa chất tăng trưởng và kháng sinh. Ba chỉ tươi pha 3 lớp nạc-mỡ-da đều, phù hợp các món chiên, kho, nướng.</p>',
                'price'             => 125000,
                'sale_price'        => 112000,
                'stock_quantity'    => 50,
                'unit'              => 'kg',
                'origin'            => 'Đồng Nai',
                'is_featured'       => true,
                'sold_count'        => 389,
                'avg_rating'        => 4.7,
                'review_count'      => 68,
            ],
            [
                'category_id'       => $thitGaId,
                'name'              => 'Gà Ta Thả Vườn Nguyên Con',
                'slug'              => 'ga-ta-tha-vuon-nguyen-con',
                'sku'               => 'THIT-002',
                'short_description' => 'Gà ta thả vườn, thịt chắc, da vàng, không bơm nước',
                'description'       => '<p>Gà ta được nuôi thả vườn trên 90 ngày. Thịt dai chắc, da vàng tự nhiên, không bơm nước. Giao con tươi được xử lý trong ngày. Phù hợp nấu cháo, hầm, làm gà luộc lá chanh.</p>',
                'price'             => 220000,
                'sale_price'        => 195000,
                'stock_quantity'    => 25,
                'unit'              => 'con (1.5–2kg)',
                'origin'            => 'Bình Dương',
                'is_featured'       => false,
                'sold_count'        => 167,
                'avg_rating'        => 4.8,
                'review_count'      => 31,
            ],
            // Thủy sản
            [
                'category_id'       => $thuysanId,
                'name'              => 'Cá Lóc Đồng Tươi Sống',
                'slug'              => 'ca-loc-dong-tuoi-song',
                'sku'               => 'THUY-001',
                'short_description' => 'Cá lóc đồng tự nhiên, thịt ngọt, không nuôi ao',
                'description'       => '<p>Cá lóc đồng đánh bắt tự nhiên tại các cánh đồng An Giang, Đồng Tháp. Thịt ngọt, chắc, không có mùi tanh ao. Phù hợp nấu canh chua, kho nghệ, hấp bầu.</p>',
                'price'             => 95000,
                'sale_price'        => null,
                'stock_quantity'    => 40,
                'unit'              => 'kg',
                'origin'            => 'An Giang',
                'is_featured'       => false,
                'sold_count'        => 203,
                'avg_rating'        => 4.6,
                'review_count'      => 37,
            ],
            [
                'category_id'       => $thuysanId,
                'name'              => 'Tôm Sú Sông Tươi',
                'slug'              => 'tom-su-song-tuoi',
                'sku'               => 'THUY-002',
                'short_description' => 'Tôm sú sông to mập, ngọt thịt, còn sống khi giao',
                'description'       => '<p>Tôm sú từ đồng nuôi sinh thái Cà Mau. Tôm được vận chuyển trong thùng nước oxy, còn sống khi giao đến tay khách. Size từ 20–25 con/kg, đầu còn nguyên, màu xanh tự nhiên.</p>',
                'price'             => 280000,
                'sale_price'        => 250000,
                'stock_quantity'    => 20,
                'unit'              => 'kg',
                'origin'            => 'Cà Mau',
                'is_featured'       => true,
                'is_flash_sale'     => true,
                'flash_sale_price'  => 220000,
                'flash_sale_end_at' => now()->addDays(1),
                'sold_count'        => 412,
                'avg_rating'        => 4.9,
                'review_count'      => 78,
            ],
            // Trứng & sữa
            [
                'category_id'       => $trungId,
                'name'              => 'Trứng Gà Thả Vườn (Vỉ 30)',
                'slug'              => 'trung-ga-tha-vuon-vi-30',
                'sku'               => 'TRUNG-001',
                'short_description' => 'Trứng gà ta thả vườn, lòng đỏ đậm, giàu dinh dưỡng',
                'description'       => '<p>Gà mái nuôi thả vườn, ăn cám tự nhiên và côn trùng. Trứng có lòng đỏ màu cam đậm, vỏ cứng, kích thước đều nhau (trứng to). Không dùng chất kích thích tăng đẻ.</p>',
                'price'             => 95000,
                'sale_price'        => 85000,
                'stock_quantity'    => 120,
                'unit'              => 'vỉ 30 trứng',
                'origin'            => 'Long An',
                'is_featured'       => true,
                'sold_count'        => 834,
                'avg_rating'        => 4.7,
                'review_count'      => 156,
            ],
            // Gia vị
            [
                'category_id'       => $giaViId,
                'name'              => 'Gừng Tươi Trà Vinh',
                'slug'              => 'gung-tuoi-tra-vinh',
                'sku'               => 'GV-001',
                'short_description' => 'Gừng tươi đặc sản Trà Vinh, cay thơm, không thuốc bảo quản',
                'description'       => '<p>Gừng trồng trên đất cát pha tại Trà Vinh, nổi tiếng với vị cay nồng và mùi thơm đặc trưng. Không qua bảo quản hóa chất. Phù hợp nấu ăn, pha trà, làm thuốc dân gian.</p>',
                'price'             => 28000,
                'sale_price'        => null,
                'stock_quantity'    => 200,
                'unit'              => 'kg',
                'origin'            => 'Trà Vinh',
                'is_featured'       => false,
                'sold_count'        => 445,
                'avg_rating'        => 4.5,
                'review_count'      => 62,
            ],
            [
                'category_id'       => $giaViId,
                'name'              => 'Tỏi Lý Sơn Cô Đơn',
                'slug'              => 'toi-ly-son-co-don',
                'sku'               => 'GV-002',
                'short_description' => 'Tỏi cô đơn Lý Sơn – đặc sản quý hiếm, 1 nhánh nguyên củ',
                'description'       => '<p>Tỏi cô đơn (tỏi 1 tép) là đặc sản quý của đảo Lý Sơn, Quảng Ngãi. Trồng trên đất cát pha tro núi lửa, tỏi có vị cay nồng đậm, thơm, chứa nhiều Allicin – kháng khuẩn tự nhiên mạnh.</p>',
                'price'             => 180000,
                'sale_price'        => 160000,
                'stock_quantity'    => 50,
                'unit'              => '250g',
                'origin'            => 'Lý Sơn, Quảng Ngãi',
                'is_featured'       => true,
                'sold_count'        => 287,
                'avg_rating'        => 5.0,
                'review_count'      => 49,
            ],
            [
                'category_id'       => $rauLaId,
                'name'              => 'Rau Má Hữu Cơ',
                'slug'              => 'rau-ma-huu-co',
                'sku'               => 'RAU-005',
                'short_description' => 'Rau má non tươi, giàu chất chống oxy hóa, mát gan',
                'description'       => '<p>Rau má trồng hữu cơ tại Lâm Đồng, thu hoạch lúc còn non. Lá xanh mướt, cuống giòn, vị mát dịu. Dùng ép nước, nấu canh, hoặc ăn sống kèm với bún, phở.</p>',
                'price'             => 22000,
                'sale_price'        => 18000,
                'stock_quantity'    => 100,
                'unit'              => 'bó (200g)',
                'origin'            => 'Đà Lạt, Lâm Đồng',
                'is_featured'       => false,
                'sold_count'        => 156,
                'avg_rating'        => 4.4,
                'review_count'      => 28,
            ],
            [
                'category_id'       => $traiCayId,
                'name'              => 'Dứa Mật Ninh Thuận',
                'slug'              => 'dua-mat-ninh-thuan',
                'sku'               => 'TC-003',
                'short_description' => 'Dứa mật đặc sản Ninh Thuận, ngọt lịm không chua',
                'description'       => '<p>Dứa (thơm) trồng trên đất cát pha tại Ninh Thuận, nơi có nắng và gió nhiều nên trái rất ngọt. Ruột vàng đậm, mắt nhỏ, ít xơ, mùi thơm lan tỏa. Trái to đều, trọng lượng 1.2–1.5kg/trái.</p>',
                'price'             => 35000,
                'sale_price'        => 30000,
                'stock_quantity'    => 75,
                'unit'              => 'trái (~1.3kg)',
                'origin'            => 'Ninh Thuận',
                'is_featured'       => false,
                'sold_count'        => 198,
                'avg_rating'        => 4.7,
                'review_count'      => 35,
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create(array_merge($productData, ['is_active' => true]));

            // Tạo ảnh đại diện placeholder
            ProductImage::create([
                'product_id' => $product->id,
                'image_url'  => "https://placehold.co/600x600/4a7c4e/white?text=" . urlencode($product->name),
                'alt_text'   => $product->name,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        $this->command->info('✅ Đã tạo ' . Product::count() . ' sản phẩm mẫu.');
    }
}
