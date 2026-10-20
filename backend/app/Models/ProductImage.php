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
        return $this->url;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
