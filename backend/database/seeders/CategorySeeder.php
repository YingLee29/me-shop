<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Giữ dữ liệu cũ để không ảnh hưởng đơn hàng, nhưng ẩn khỏi storefront.
        Category::query()->update(['is_active' => false]);

        $categories = [
            [
                'name'        => 'Gừng Kỳ Sơn',
                'slug'        => 'gung-ky-son',
                'icon'        => '🌿',
                'description' => 'Gừng sẻ núi Kỳ Sơn và các sản phẩm chế biến từ gừng: viên ngậm, cao gừng, cốt gừng, trà gừng.',
                'sort_order'  => 1,
                'children'    => [
                    ['name' => 'Viên Ngậm Gừng', 'slug' => 'vien-ngam-gung', 'icon' => '🍬', 'sort_order' => 1],
                    ['name' => 'Cao & Cốt Gừng', 'slug' => 'cao-cot-gung', 'icon' => '🍯', 'sort_order' => 2],
                    ['name' => 'Trà Gừng', 'slug' => 'tra-gung', 'icon' => '🍵', 'sort_order' => 3],
                ],
            ],
            [
                'name'        => 'Nghệ & Thảo Mộc',
                'slug'        => 'nghe-thao-moc',
                'icon'        => '🌱',
                'description' => 'Tinh bột nghệ nếp Nghệ An, trà Shan Tuyết và các sản phẩm thảo mộc tự nhiên.',
                'sort_order'  => 2,
                'children'    => [
                    ['name' => 'Tinh Bột Nghệ', 'slug' => 'tinh-bot-nghe', 'icon' => '🟡', 'sort_order' => 1],
                    ['name' => 'Trà Shan Tuyết', 'slug' => 'tra-shan-tuyet', 'icon' => '🍃', 'sort_order' => 2],
                ],
            ],
            [
                'name'        => 'Mật Ong & Đường Phèn',
                'slug'        => 'mat-ong-duong-phen',
                'icon'        => '🍯',
                'description' => 'Mật ong rừng và đường phèn Nghĩa Đàn – nguyên liệu làm nên vị ngọt tự nhiên của các sản phẩm MocSon Farm.',
                'sort_order'  => 3,
                'children'    => [
                    ['name' => 'Mật Ong Rừng', 'slug' => 'mat-ong-rung', 'icon' => '🐝', 'sort_order' => 1],
                    ['name' => 'Đường Phèn', 'slug' => 'duong-phen', 'icon' => '🧂', 'sort_order' => 2],
                ],
            ],
            [
                'name'        => 'Đặc Sản Nghệ An',
                'slug'        => 'dac-san-nghe-an',
                'icon'        => '🏞️',
                'description' => 'Bánh, mứt, hạt và nông sản khô mang hương vị đặc trưng của xứ Nghệ.',
                'sort_order'  => 4,
                'children'    => [
                    ['name' => 'Bánh & Mứt', 'slug' => 'banh-mut', 'icon' => '🥮', 'sort_order' => 1],
                    ['name' => 'Hạt & Nông Sản Khô', 'slug' => 'hat-nong-san-kho', 'icon' => '🌰', 'sort_order' => 2],
                ],
            ],
            [
                'name'        => 'Combo Quà Tặng',
                'slug'        => 'combo-qua-tang',
                'icon'        => '🎁',
                'description' => 'Hộp quà đặc sản Nghệ An được chọn lọc, phù hợp biếu tặng gia đình, đối tác và khách hàng.',
                'sort_order'  => 5,
                'children'    => [],
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $parent = Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                array_merge($categoryData, ['parent_id' => null, 'is_active' => true])
            );

            foreach ($children as $child) {
                Category::updateOrCreate(
                    ['slug' => $child['slug']],
                    array_merge($child, ['parent_id' => $parent->id, 'is_active' => true])
                );
            }
        }

        Cache::forget('categories.tree');

        $this->command->info('✅ Đã cập nhật danh mục MocSon Farm.');
    }
}
