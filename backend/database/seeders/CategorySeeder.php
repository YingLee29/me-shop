<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name'        => 'Rau Củ',
                'slug'        => 'rau-cu',
                'icon'        => '🥦',
                'description' => 'Rau củ tươi sạch từ vườn nông nghiệp hữu cơ',
                'sort_order'  => 1,
                'children'    => [
                    ['name' => 'Rau Lá',     'slug' => 'rau-la',     'icon' => '🥬', 'sort_order' => 1],
                    ['name' => 'Củ Quả',     'slug' => 'cu-qua',     'icon' => '🥕', 'sort_order' => 2],
                    ['name' => 'Nấm',        'slug' => 'nam',         'icon' => '🍄', 'sort_order' => 3],
                ],
            ],
            [
                'name'        => 'Trái Cây',
                'slug'        => 'trai-cay',
                'icon'        => '🍎',
                'description' => 'Trái cây tươi ngon, không thuốc bảo vệ thực vật',
                'sort_order'  => 2,
                'children'    => [
                    ['name' => 'Trái Cây Nhiệt Đới', 'slug' => 'trai-cay-nhiet-doi', 'icon' => '🥭', 'sort_order' => 1],
                    ['name' => 'Trái Cây Có Múi',    'slug' => 'trai-cay-co-mui',    'icon' => '🍊', 'sort_order' => 2],
                ],
            ],
            [
                'name'        => 'Thịt Sạch',
                'slug'        => 'thit-sach',
                'icon'        => '🥩',
                'description' => 'Thịt heo, bò, gà từ trang trại VietGAP',
                'sort_order'  => 3,
                'children'    => [
                    ['name' => 'Thịt Heo', 'slug' => 'thit-heo', 'icon' => '🐷', 'sort_order' => 1],
                    ['name' => 'Thịt Bò',  'slug' => 'thit-bo',  'icon' => '🐄', 'sort_order' => 2],
                    ['name' => 'Thịt Gà',  'slug' => 'thit-ga',  'icon' => '🐔', 'sort_order' => 3],
                ],
            ],
            [
                'name'        => 'Thủy Sản',
                'slug'        => 'thuy-san',
                'icon'        => '🐟',
                'description' => 'Cá, tôm, hải sản tươi sống mỗi ngày',
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Trứng & Sữa',
                'slug'        => 'trung-sua',
                'icon'        => '🥚',
                'description' => 'Trứng gà ta, trứng vịt, sữa tươi và các sản phẩm từ sữa',
                'sort_order'  => 5,
            ],
            [
                'name'        => 'Gia Vị & Khô',
                'slug'        => 'gia-vi-kho',
                'icon'        => '🧄',
                'description' => 'Gia vị, mắm muối, hàng khô thiết yếu',
                'sort_order'  => 6,
            ],
        ];

        foreach ($categories as $catData) {
            $children = $catData['children'] ?? [];
            unset($catData['children']);

            $catData['is_active'] = true;

            $parent = Category::create($catData);

            foreach ($children as $childData) {
                $childData['parent_id'] = $parent->id;
                $childData['is_active'] = true;
                Category::create($childData);
            }
        }

        $this->command->info('✅ Đã tạo ' . Category::count() . ' danh mục.');
    }
}
