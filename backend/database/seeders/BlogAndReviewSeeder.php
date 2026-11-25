<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogAndReviewSeeder extends Seeder
{
    public function run(): void
    {
        // ── Seed Blog Categories ──
        $categories = [
            [
                'name'        => 'Kiến Thức Hữu Cơ & VietGAP',
                'slug'        => 'kien-thuc-huu-co',
                'description' => 'Tìm hiểu về tiêu chuẩn VietGAP, canh tác hữu cơ bền vững và an toàn thực phẩm.',
            ],
            [
                'name'        => 'Mẹo Nấu Ăn & Dinh Dưỡng',
                'slug'        => 'meo-nau-an-dinh-duong',
                'description' => 'Công thức món ngon mỗi ngày từ nông sản sạch, thực đơn thanh lọc cơ thể.',
            ],
            [
                'name'        => 'Câu Chuyện Nông Trại',
                'slug'        => 'cau-chuyen-nong-trai',
                'description' => 'Hành trình từ vườn đến bàn ăn của những người nông dân tâm huyết.',
            ],
        ];

        $createdCats = [];
        foreach ($categories as $cat) {
            $createdCats[$cat['slug']] = BlogCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // ── Seed Blogs ──
        $adminUser = User::first();
        $authorId = $adminUser?->id;

        $blogs = [
            [
                'category_id'  => $createdCats['kien-thuc-huu-co']->id,
                'title'        => 'Cách Nhận Biết Rau Hữu Cơ Chuẩn VietGAP Đơn Giản Tại Nhà',
                'slug'         => 'cach-nhan-biet-rau-huu-co-chuan-vietgap',
                'summary'      => 'Hướng dẫn phân biệt rau sạch an toàn qua màu sắc lá, kích thước và mùi vị tự nhiên so với rau dùng phân bón kích thích.',
                'content'      => '<p>Hiện nay trên thị trường có rất nhiều loại rau củ gắn mác "sạch" hoặc "hữu cơ". Tuy nhiên, làm sao để người tiêu dùng thông thái nhận biết được đâu là sản phẩm đạt tiêu chuẩn chất lượng cao?</p><h3>1. Quan sát màu sắc của lá</h3><p>Rau hữu cơ thường có màu xanh nhạt hoặc xanh tự nhiên, không quá đậm và bóng nhẫy như rau dùng nhiều phân đạm tổng hợp. Lá rau có thể dày hơn và thân rau chắc chắn.</p><h3>2. Độ giòn và hương vị</h3><p>Khi chế biến, rau củ hữu cơ giữ được độ giòn ngọt thanh đặc trưng. Mùi thơm tự nhiên rất rõ ràng mà không bị nhạt hay úng nước nhanh.</p><h3>3. Bảo quản tự nhiên</h3><p>Rau sạch không dùng chất bảo quản nên khi để trong ngăn mát tủ lạnh có thể giữ được độ tươi từ 3-5 ngày mà không bị nhũn hỏng từ bên trong.</p>',
                'thumbnail'    => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
                'is_published' => true,
                'views_count'  => 285,
                'published_at' => now()->subDays(3),
            ],
            [
                'category_id'  => $createdCats['meo-nau-an-dinh-duong']->id,
                'title'        => '5 Thực Đơn Xanh Thanh Lọc Cơ Thể Trong 7 Ngày Với Nông Sản',
                'slug'         => '5-thuc-don-xanh-thanh-loc-co-the',
                'summary'      => 'Gợi ý các bữa ăn nhẹ nhàng giàu chất xơ, vitamin từ rau xanh Đà Lạt và trái cây nhiệt đới giúp tinh thần sảng khoái.',
                'content'      => '<p>Một chế độ ăn giàu thực vật không chỉ hỗ trợ tiêu hóa mà còn mang lại năng lượng tràn đầy cho tuần làm việc mới. Dưới đây là 5 gợi ý thực đơn xanh dễ làm:</p><ul><li><strong>Ngày 1:</strong> Salad ức gà cải kale với sốt chanh leo chua ngọt.</li><li><strong>Ngày 2:</strong> Canh súp lơ xanh hầm nấm đùi gà thanh đạm.</li><li><strong>Ngày 3:</strong> Sinh tố bơ sáp chuối yến mạch buổi sáng.</li><li><strong>Ngày 4:</strong> Tôm áp chảo măng tây nướng tỏi.</li><li><strong>Ngày 5:</strong> Cải bó xôi xào tỏi cùng trứng hấp thảo mộc.</li></ul>',
                'thumbnail'    => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
                'is_published' => true,
                'views_count'  => 412,
                'published_at' => now()->subDays(1),
            ],
            [
                'category_id'  => $createdCats['cau-chuyen-nong-trai']->id,
                'title'        => 'Hành Trình Hái Cải Lúc 5 Giờ Sáng Tại Thung Lũng Đà Lạt',
                'slug'         => 'hanh-trinh-hai-cai-luc-5-gio-sang-da-lat',
                'summary'      => 'Cùng ghé thăm vườn rau hữu cơ giữa làn sương sớm tại vùng cao Lâm Đồng trước khi đến bàn ăn của bạn trong ngày.',
                'content'      => '<p>Mỗi ngày tại trang trại liên kết của Nông Sản Sạch, công việc bắt đầu khi những giọt sương mai còn đọng trên từng tán lá. Việc thu hoạch sớm giúp rau củ giữ trọn vẹn vị ngọt tinh khiết và hàm lượng vitamin cao nhất.</p><p>Ngay sau khi thu hái, nông sản được phân loại kỹ lưỡng, sơ chế sạch đất cát và đưa vào hệ thống kho mát bảo quản 10-15°C trước khi vận chuyển hỏa tốc đến các gia đình thành phố.</p>',
                'thumbnail'    => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
                'is_published' => true,
                'views_count'  => 198,
                'published_at' => now()->subDays(6),
            ],
        ];

        foreach ($blogs as $b) {
            $b['author_id'] = $authorId;
            Blog::updateOrCreate(['slug' => $b['slug']], $b);
        }

        // ── Seed Reviews for Products ──
        $products = Product::take(5)->get();
        $sampleUsers = User::take(5)->get();

        $comments = [
            ['rating' => 5, 'comment' => 'Rau rất tươi ngon, đóng gói cẩn thận bằng túi giấy thân thiện môi trường. Giao hàng đúng giờ như cam kết!'],
            ['rating' => 5, 'comment' => 'Chất lượng nông sản xuất sắc, ăn ngọt thanh tự nhiên khác hẳn rau ngoài chợ. Sẽ ủng hộ shop lâu dài.'],
            ['rating' => 4, 'comment' => 'Sản phẩm tươi, giá hợp lý. Shipper thân thiện nhiệt tình. Cho 5 sao để shop phát huy.'],
            ['rating' => 5, 'comment' => 'Đã mua nhiều lần, lần nào cũng ưng ý. Gia đình mình rất yên tâm khi dùng nông sản ở đây.'],
        ];

        foreach ($products as $p) {
            foreach ($comments as $idx => $c) {
                $user = $sampleUsers[$idx % count($sampleUsers)] ?? $adminUser;
                Review::updateOrCreate(
                    [
                        'product_id' => $p->id,
                        'user_id'    => $user->id,
                    ],
                    [
                        'rating'      => $c['rating'],
                        'comment'     => $c['comment'],
                        'is_approved' => true,
                    ]
                );
            }
            $p->recalculateRating();
        }

        $this->command->info('✅ Đã tạo Blog Categories, Blogs và Reviews mẫu thành công.');
    }
}
