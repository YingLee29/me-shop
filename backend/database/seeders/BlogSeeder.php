<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Mẹo nấu ăn', 'slug' => 'meo-nau-an', 'description' => 'Bí quyết chế biến nông sản tươi ngon', 'sort_order' => 1],
            ['name' => 'Dinh dưỡng', 'slug' => 'dinh-duong', 'description' => 'Ăn uống lành mạnh mỗi ngày', 'sort_order' => 2],
            ['name' => 'Chuyện nhà nông', 'slug' => 'chuyen-nha-nong', 'description' => 'Hành trình từ nông trại đến bàn ăn', 'sort_order' => 3],
        ];

        foreach ($categories as $category) {
            BlogCategory::firstOrCreate(['slug' => $category['slug']], $category);
        }

        $author = User::where('email', 'admin@nongsan.vn')->first();
        $cooking = BlogCategory::where('slug', 'meo-nau-an')->first();
        $nutrition = BlogCategory::where('slug', 'dinh-duong')->first();
        $farmer = BlogCategory::where('slug', 'chuyen-nha-nong')->first();

        $posts = [
            [
                'blog_category_id' => $cooking?->id,
                'title' => '5 cách bảo quản rau củ tươi lâu trong tủ lạnh',
                'slug' => '5-cach-bao-quan-rau-cu-tuoi-lau',
                'excerpt' => 'Rau củ mua về nếu biết cách sơ chế và bảo quản sẽ giữ được độ tươi giòn đến cả tuần.',
                'thumbnail' => 'https://placehold.co/800x480/3E6B3A/FFFFFF?text=Bao+quan+rau+cu',
                'content' => <<<'HTML'
<p><strong>Rau củ tươi</strong> là nguồn vitamin quan trọng, nhưng chỉ sau vài ngày trong tủ lạnh chúng có thể héo, úng hoặc mất dinh dưỡng nếu bảo quản sai cách.</p>
<h2>1. Phân loại trước khi cất tủ</h2>
<p>Hãy tách riêng rau ăn lá, củ quả và trái cây. Trái cây sinh ethylene có thể khiến rau nhanh hỏng khi để chung.</p>
<h2>2. Không rửa trước khi bảo quản</h2>
<p>Độ ẩm dư thừa tạo điều kiện cho vi khuẩn phát triển. Chỉ rửa rau ngay trước khi chế biến.</p>
<h2>3. Dùng khăn giấy thấm ẩm</h2>
<p>Bọc rau ăn lá bằng khăn giấy ẩm rồi cho vào hộp kín giúp duy trì độ ẩm vừa phải.</p>
<h2>4. Nhiệt độ phù hợp</h2>
<p>Ngăn mát 2–4°C là lý tưởng cho phần lớn rau củ. Không để rau sát thành tủ vì dễ bị đông cứng.</p>
<h2>5. Sơ chế và trữ đông</h2>
<p>Với rau củ dùng trong 1–2 tuần, có thể chần sơ, để nguội và trữ đông để giữ màu sắc, hương vị.</p>
HTML,
                'is_published' => true,
                'published_at' => now()->subDays(2),
                'meta_title' => '5 cách bảo quản rau củ tươi lâu | Nông Sản Sạch',
                'meta_description' => 'Hướng dẫn bảo quản rau củ tươi lâu trong tủ lạnh, giữ trọn dinh dưỡng và độ giòn ngọt.',
            ],
            [
                'blog_category_id' => $nutrition?->id,
                'title' => 'Ăn xoài đúng cách: lợi ích và lưu ý',
                'slug' => 'an-xoai-dung-cach-loi-ich-va-luu-y',
                'excerpt' => 'Xoài cát chu không chỉ thơm ngon mà còn giàu vitamin A, C và chất xơ tốt cho tiêu hóa.',
                'thumbnail' => 'https://placehold.co/800x480/F2B705/3B2A12?text=Xoai+cat+chu',
                'content' => <<<'HTML'
<p>Xoài là loại trái cây nhiệt đới được yêu thích nhờ vị ngọt thanh và hương thơm đặc trưng. Một quả xoài chín cung cấp lượng lớn vitamin C, vitamin A và chất xơ.</p>
<h2>Lợi ích nổi bật</h2>
<ul>
<li>Hỗ trợ miễn dịch nhờ vitamin C.</li>
<li>Tốt cho mắt và da nhờ beta-caroten.</li>
<li>Chất xơ giúp hệ tiêu hóa hoạt động đều đặn.</li>
</ul>
<h2>Lưu ý khi ăn</h2>
<p>Xoài chứa khá nhiều đường tự nhiên, người cần kiểm soát đường huyết nên ăn với lượng vừa phải. Nên chọn quả chín tự nhiên, không dập úng.</p>
<h2>Cách chọn xoài ngon</h2>
<p>Quả có mùi thơm nhẹ ở cuống, vỏ căng, ấn nhẹ thấy mềm đều. Xoài cát chu chín có thể bảo quản ngăn mát 3–5 ngày.</p>
HTML,
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'meta_title' => 'Ăn xoài đúng cách: lợi ích và lưu ý | Nông Sản Sạch',
                'meta_description' => 'Tìm hiểu lợi ích dinh dưỡng của xoài cát chu và những lưu ý khi ăn để tốt cho sức khỏe.',
            ],
            [
                'blog_category_id' => $farmer?->id,
                'title' => 'Một ngày ở nông trại rau hữu cơ Đà Lạt',
                'slug' => 'mot-ngay-o-nong-trai-rau-huu-co-da-lat',
                'excerpt' => 'Từ 4 giờ sáng, những luống rau đã được thu hoạch và chuyển lạnh để kịp đến tay khách hàng trong ngày.',
                'thumbnail' => 'https://placehold.co/800x480/4C7A34/FFFFFF?text=Nong+trai+Da+Lat',
                'content' => <<<'HTML'
<p>Đà Lạt những ngày cuối năm se lạnh. Tại nông trại rau hữu cơ ở thung lũng, công nhân bắt đầu thu hoạch từ 4 giờ sáng để rau không bị héo dưới nắng.</p>
<h2>Thu hoạch đúng thời điểm</h2>
<p>Rau ăn lá được thu hoạch khi lá còn non, thân giòn. Mỗi luống được luân canh để đất có thời gian hồi phục.</p>
<h2>Chuyển lạnh trong 2 giờ</h2>
<p>Sau khi thu hoạch, rau được rửa bằng nước sạch, làm ráo và đưa vào kho lạnh. Xe giao hàng giữ nhiệt độ 2–8°C suốt hành trình.</p>
<h2>Cam kết không hóa chất</h2>
<p>Nông trại sử dụng phân hữu cơ, kiểm soát sâu bệnh bằng biện pháp sinh học và lấy mẫu đất định kỳ.</p>
HTML,
                'is_published' => true,
                'published_at' => now()->subDays(9),
                'meta_title' => 'Một ngày ở nông trại rau hữu cơ Đà Lạt | Nông Sản Sạch',
                'meta_description' => 'Khám phá quy trình thu hoạch và bảo quản rau hữu cơ tại Đà Lạt từ nông trại đến bàn ăn.',
            ],
            [
                'blog_category_id' => $cooking?->id,
                'title' => 'Gợi ý thực đơn cuối tuần từ nông sản Việt',
                'slug' => 'goi-y-thuc-don-cuoi-tuan-tu-nong-san-viet',
                'excerpt' => 'Thực đơn 3 bữa cuối tuần dễ nấu, đủ chất và tận dụng nông sản theo mùa.',
                'thumbnail' => 'https://placehold.co/800x480/D98E2B/FFFFFF?text=Thuc+don+cuoi+tuan',
                'content' => <<<'HTML'
<p>Cuối tuần là dịp cả gia đình quây quần. Một thực đơn đơn giản với nông sản theo mùa vừa tiết kiệm vừa đảm bảo dinh dưỡng.</p>
<h2>Bữa sáng</h2>
<p>Cháo gạo ST25 với nấm tươi và hành lá. Thêm một quả chuối hoặc ly sinh tố xoài.</p>
<h2>Bữa trưa</h2>
<p>Canh rau cải kale nấu tôm, cá basa kho tiêu và cơm gạo lứt. Tráng miệng bằng trái cây tươi.</p>
<h2>Bữa tối</h2>
<p>Salad rau mầm trộn dầu ô-liu, gà ác hấp gừng và khoai lang nướng.</p>
<p>Mẹo nhỏ: sơ chế và chia khẩu phần từ tối thứ Sáu để nấu nhanh hơn vào cuối tuần.</p>
HTML,
                'is_published' => false,
                'published_at' => null,
                'meta_title' => 'Gợi ý thực đơn cuối tuần từ nông sản Việt',
                'meta_description' => 'Thực đơn cuối tuần dễ nấu, đủ chất với rau củ, gạo ST25 và trái cây theo mùa.',
            ],
        ];

        foreach ($posts as $post) {
            Blog::firstOrCreate(
                ['slug' => $post['slug']],
                [...$post, 'user_id' => $author?->id],
            );
        }

        $this->command->info('✅ Blog mẫu đã được tạo.');
    }
}
