<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'url', 'is_primary', 'sort_order', 'alt_text'];

    protected $casts = ['is_primary' => 'boolean'];

    protected $appends = ['image_url'];

    protected static function booted(): void
    {
        $flush = function () {
            Cache::forget('products.featured');
            Cache::forget('products.flash_sale');
        };

        static::saved($flush);
        static::deleted($flush);
    }

    public function getImageUrlAttribute(): ?string
    {
        $url = $this->url;

        if (!$url) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);

        // Ảnh upload nội bộ trả về đường dẫn tương đối để frontend/admin
        // tự proxy /storage qua nginx và Next.js có thể tối ưu ảnh.
        if (is_string($path) && str_starts_with($path, '/storage/')) {
            return $path;
        }

        return $url;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
