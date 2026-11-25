<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

/**
 * Nạp danh mục sản phẩm An Khương từ file JSON
 * (sinh ra bởi database/data/build_catalog.py từ file Excel gốc).
 *
 * Chạy:
 *   php artisan db:seed --class=ProductCatalogSeeder
 *
 * Seeder có thể chạy lại nhiều lần: sản phẩm được upsert theo SKU,
 * các sản phẩm cũ không còn trong danh sách sẽ được soft-delete.
 */
class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/products.json');

        if (! file_exists($path)) {
            $this->command->error("Không tìm thấy {$path}. Chạy: python3 database/data/build_catalog.py");

            return;
        }

        $data = json_decode(file_get_contents($path), true);

        if (! is_array($data) || empty($data['products'])) {
            $this->command->error('File products.json không hợp lệ hoặc rỗng.');

            return;
        }

        // ── Danh mục ────────────────────────────────────────────────
        $categoryIds = [];
        foreach ($data['categories'] as $category) {
            $model = Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'parent_id'   => null,
                    'name'        => $category['name'],
                    'icon'        => $category['icon'] ?? null,
                    'description' => $category['description'] ?? null,
                    'sort_order'  => $category['sort_order'] ?? 0,
                    'is_active'   => true,
                ]
            );

            $categoryIds[$category['key']] = $model->id;
        }

        // ── Sản phẩm ────────────────────────────────────────────────
        $skus = [];
        $created = 0;
        $updated = 0;

        foreach ($data['products'] as $item) {
            $skus[] = $item['sku'];

            $product = Product::withTrashed()->where('sku', $item['sku'])->first();

            $attributes = [
                'category_id'       => $categoryIds[$item['category']] ?? null,
                'name'              => $item['name'],
                'slug'              => $item['slug'],
                'short_description' => $item['short_description'] ?? null,
                'description'       => $item['description'] ?? null,
                'price'             => $item['price'],
                'sale_price'        => null,
                'stock_quantity'    => $item['stock_quantity'],
                'unit'              => $item['unit'],
                'origin'            => $item['origin'] ?? null,
                'is_active'         => true,
                'is_featured'       => (bool) ($item['is_featured'] ?? false),
                'is_flash_sale'     => false,
                'flash_sale_end_at' => null,
                'flash_sale_price'  => null,
                'meta_title'        => $item['meta_title'] ?? null,
                'meta_description'  => $item['meta_description'] ?? null,
            ];

            if ($product) {
                $product->fill($attributes);

                if ($product->trashed()) {
                    $product->restore();
                }

                $product->save();
                $updated++;
            } else {
                $product = Product::create(['sku' => $item['sku']] + $attributes);
                $created++;
            }

            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'is_primary' => true],
                [
                    'url'        => $item['image_url'],
                    'alt_text'   => $item['name'],
                    'sort_order' => 0,
                ]
            );
        }

        // ── Ngừng bán sản phẩm cũ không còn trong danh sách ─────────
        $retired = Product::whereNotIn('sku', $skus)->get();
        foreach ($retired as $oldProduct) {
            $oldProduct->update(['is_active' => false]);
            $oldProduct->delete();
        }

        // Ẩn danh mục cũ không còn sản phẩm nào đang bán
        $activeCategorySlugs = collect($data['categories'])->pluck('slug');
        $deactivated = Category::whereNotIn('slug', $activeCategorySlugs)
            ->where('is_active', true)
            ->whereDoesntHave('products', fn ($query) => $query->where('is_active', true))
            ->update(['is_active' => false]);

        // Dọn giỏ hàng đang trỏ tới sản phẩm đã ngừng bán
        $activeIds = Product::whereIn('sku', $skus)->pluck('id');
        Cart::whereNotIn('product_id', $activeIds)->delete();

        Cache::forget('categories.tree');

        $this->command->info('🌾 Danh mục: ' . count($categoryIds) . " (đã ẩn {$deactivated} danh mục cũ)");
        $this->command->info("🛒 Sản phẩm: {$created} tạo mới, {$updated} cập nhật, {$retired->count()} ngừng bán");
        $this->command->info('💰 Giá bán: ' . number_format($data['products'][0]['price'], 0, ',', '.') . 'đ / sản phẩm');
    }
}
