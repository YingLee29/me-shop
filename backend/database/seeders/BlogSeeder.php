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
            ['name' => 'Cẩm nang đặc sản', 'slug' => 'meo-nau-an', 'description' => 'Cách chọn, bảo quản và thưởng thức đặc sản Nghệ An', 'sort_order' => 1],
            ['name' => 'Dinh dưỡng', 'slug' => 'dinh-duong', 'description' => 'Dùng gừng, nghệ và thảo mộc lành mạnh mỗi ngày', 'sort_order' => 2],
            ['name' => 'Chuyện nhà nông', 'slug' => 'chuyen-nha-nong', 'description' => 'Hành trình từ núi rừng Kỳ Sơn đến bàn trà', 'sort_order' => 3],
        ];

        foreach ($categories as $category) {
            BlogCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }

        // Ẩn các bài cũ để trang chủ/blog chỉ hiển thị nội dung phù hợp MocSon Farm.
        Blog::query()->update(['is_published' => false]);

        $author = User::where('email', 'admin@mocsonfarm.vn')->first();
        $cooking = BlogCategory::where('slug', 'meo-nau-an')->first();
        $nutrition = BlogCategory::where('slug', 'dinh-duong')->first();
        $farmer = BlogCategory::where('slug', 'chuyen-nha-nong')->first();

        $posts = [
            [
                'blog_category_id' => $farmer?->id,
                'title' => 'Gừng sẻ Kỳ Sơn – vì sao được gọi là đặc sản núi rừng?',
                'slug' => 'gung-se-ky-son-dac-san-nui-rung',
                'excerpt' => 'Gừng sẻ Kỳ Sơn nhỏ củ, vỏ mỏng, thơm cay đậm. Đây là nguyên liệu chính cho viên ngậm, cao gừng và trà gừng của MocSon Farm.',
                'thumbnail' => 'https://placehold.co/800x480/8A5A2B/FFFFFF?text=Gung+se+Ky+Son',
                'content' => <<<'HTML'
<p>Gừng sẻ Kỳ Sơn được trồng trên đất núi cao, khí hậu mát và ẩm. Củ gừng nhỏ, vỏ mỏng, thịt vàng và có mùi thơm cay đậm hơn nhiều giống gừng trồng ở đồng bằng.</p>
<h2>Đặc điểm nhận biết</h2>
<p>Gừng sẻ thường có nhiều nhánh nhỏ, củ chắc, ít xơ. Khi bẻ đôi, mùi thơm lan nhanh và vị cay ấm rõ rệt.</p>
<h2>Từ củ gừng tươi đến sản phẩm</h2>
<p>Tại MocSon Farm, gừng được rửa sạch, sơ chế trong ngày và chế biến theo mẻ nhỏ. Gừng tươi dùng làm viên ngậm, cao gừng, cốt gừng và trà gừng.</p>
<h2>Cách bảo quản</h2>
<p>Gừng tươi nên để nơi khô thoáng hoặc bọc kín trong ngăn mát. Với sản phẩm đã chế biến, đậy kín nắp và bảo quản ở nơi mát, tránh ánh nắng trực tiếp.</p>
HTML,
                'is_published' => true,
                'published_at' => now()->subDays(2),
                'meta_title' => 'Gừng sẻ Kỳ Sơn – đặc sản núi rừng | MocSon Farm',
                'meta_description' => 'Tìm hiểu về gừng sẻ Kỳ Sơn và quy trình chế biến viên ngậm, cao gừng, trà gừng tại MocSon Farm.',
            ],
            [
                'blog_category_id' => $cooking?->id,
                'title' => 'Cách pha trà gừng mật ong thơm ấm mỗi ngày',
                'slug' => 'cach-pha-tra-gung-mat-ong',
                'excerpt' => 'Chỉ vài phút với bột trà gừng, mật ong và nước nóng là bạn đã có ly trà ấm cho buổi sáng hoặc chiều se lạnh.',
                'thumbnail' => 'https://placehold.co/800x480/C58B2A/FFFFFF?text=Tra+gung+mat+ong',
                'content' => <<<'HTML'
<p>Trà gừng mật ong là thức uống dễ làm, phù hợp cho những ngày trời lạnh hoặc khi cần một ly ấm bụng. Với bột trà gừng nguyên chất, bạn không cần chuẩn bị nhiều nguyên liệu.</p>
<h2>Nguyên liệu</h2>
<ul>
<li>1–2 thìa bột trà gừng MocSon Farm.</li>
<li>150–200 ml nước nóng khoảng 80–90°C.</li>
<li>1 thìa mật ong rừng, có thể điều chỉnh theo khẩu vị.</li>
<li>Vài lát chanh hoặc sả nếu thích hương thơm mới.</li>
</ul>
<h2>Cách làm</h2>
<p>Cho bột trà gừng vào ly, rót nước nóng và khuấy đều. Đợi vài phút cho trà ra hương rồi thêm mật ong khi nước đã bớt nóng. Có thể thêm chanh hoặc sả.</p>
<h2>Lưu ý</h2>
<p>Nên dùng lượng gừng vừa phải, đặc biệt với người có dạ dày nhạy cảm. Không dùng mật ong cho trẻ dưới 12 tháng tuổi.</p>
HTML,
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'meta_title' => 'Cách pha trà gừng mật ong thơm ấm | MocSon Farm',
                'meta_description' => 'Hướng dẫn pha trà gừng mật ong từ bột trà gừng nguyên chất, đơn giản và dễ uống mỗi ngày.',
            ],
            [
                'blog_category_id' => $nutrition?->id,
                'title' => 'Tinh bột nghệ Nghệ An: dùng thế nào cho đúng vị?',
                'slug' => 'tinh-bot-nghe-nghe-an-cach-dung',
                'excerpt' => 'Tinh bột nghệ nếp có màu vàng tự nhiên, vị dịu. Một vài cách dùng đơn giản giúp giữ trọn hương vị và dinh dưỡng.',
                'thumbnail' => 'https://placehold.co/800x480/D09A1F/4A2E1B?text=Tinh+bot+nghe',
                'content' => <<<'HTML'
<p>Tinh bột nghệ nếp Nghệ An được làm từ củ nghệ tươi, lọc kỹ và sấy khô. Sản phẩm có màu vàng tự nhiên, mùi thơm nhẹ và vị dịu hơn nghệ tươi.</p>
<h2>Pha nước ấm</h2>
<p>Cho khoảng nửa thìa tinh bột nghệ vào nước ấm, khuấy đều. Có thể thêm mật ong hoặc sữa để dễ uống hơn.</p>
<h2>Dùng trong nấu ăn</h2>
<p>Tinh bột nghệ có thể dùng để tạo màu vàng tự nhiên cho món curry, cơm hoặc sinh tố. Nên cho lượng nhỏ và khuấy đều tay.</p>
<h2>Bảo quản</h2>
<p>Đậy kín hũ sau khi dùng, để nơi khô mát và tránh ánh nắng trực tiếp. Không dùng thìa ướt để lấy bột.</p>
HTML,
                'is_published' => true,
                'published_at' => now()->subDays(9),
                'meta_title' => 'Tinh bột nghệ Nghệ An: cách dùng và bảo quản | MocSon Farm',
                'meta_description' => 'Cách dùng tinh bột nghệ nếp Nghệ An trong pha nước, nấu ăn và bảo quản đúng cách.',
            ],
            [
                'blog_category_id' => $farmer?->id,
                'title' => 'Một ngày lên Kỳ Sơn thăm vùng nguyên liệu',
                'slug' => 'mot-ngay-len-ky-son-tham-vung-nguyen-lieu',
                'excerpt' => 'Từ những vạt gừng trên sườn núi đến mẻ cao gừng nấu chậm, mỗi sản phẩm MocSon Farm bắt đầu từ một ngày ở Kỳ Sơn.',
                'thumbnail' => 'https://placehold.co/800x480/4E6038/FFFFFF?text=Ky+Son',
                'content' => <<<'HTML'
<p>Kỳ Sơn là huyện miền núi phía tây Nghệ An, nơi có khí hậu mát và đất đỏ phù hợp với gừng sẻ. Người dân địa phương trồng gừng theo kinh nghiệm nhiều đời.</p>
<h2>Buổi sáng trên nương</h2>
<p>Gừng được thu hoạch vào sáng sớm để tránh nắng. Củ gừng sau khi đào được phân loại ngay tại nương, loại củ chắc, không dập để đưa về sơ chế.</p>
<h2>Chế biến trong ngày</h2>
<p>Gừng tươi được rửa sạch, cắt lát và nấu theo mẻ nhỏ. Cách làm thủ công giúp giữ hương thơm tự nhiên thay vì mùi hương liệu công nghiệp.</p>
<h2>Giá trị từ nông hộ</h2>
<p>MocSon Farm ưu tiên thu mua từ nông hộ địa phương, giúp người trồng gừng có đầu ra ổn định và giữ lại giá trị ngay tại vùng nguyên liệu.</p>
HTML,
                'is_published' => false,
                'published_at' => null,
                'meta_title' => 'Một ngày lên Kỳ Sơn thăm vùng nguyên liệu | MocSon Farm',
                'meta_description' => 'Hành trình từ nương gừng Kỳ Sơn đến mẻ cao gừng thủ công của MocSon Farm.',
            ],
        ];

        foreach ($posts as $post) {
            Blog::updateOrCreate(
                ['slug' => $post['slug']],
                [...$post, 'user_id' => $author?->id],
            );
        }

        $this->command->info('✅ Blog mẫu MocSon Farm đã được tạo.');
    }
}
