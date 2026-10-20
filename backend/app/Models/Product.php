<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'sku', 'short_description', 'description',
        'price', 'sale_price', 'stock_quantity', 'unit', 'origin',
        'is_active', 'is_featured', 'is_flash_sale',
        'flash_sale_end_at', 'flash_sale_price',
        'sold_count', 'view_count', 'avg_rating', 'review_count',
        'meta_title', 'meta_description',
    ];

    protected static function booted(): void
    {
        $flush = function () {
            Cache::forget('products.featured');
            Cache::forget('products.flash_sale');
        };

        static::saved($flush);
        static::deleted($flush);
        static::restored($flush);
    }

    protected $casts = [
        'price'            => 'decimal:0',
        'sale_price'       => 'decimal:0',
        'flash_sale_price' => 'decimal:0',
        'is_active'        => 'boolean',
        'is_featured'      => 'boolean',
        'is_flash_sale'    => 'boolean',
        'flash_sale_end_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function flashSaleItems(): HasMany
    {
        return $this->hasMany(FlashSaleProduct::class);
    }

    /** Sản phẩm trong đợt flash sale đang diễn ra (nếu có) */
    public function activeFlashSaleItem(): HasOne
    {
        return $this->hasOne(FlashSaleProduct::class)
            ->whereHas('flashSale', fn (Builder $query) => $query->running())
            ->latestOfMany();
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->active();
    }

    public function scopeFlashSale($query)
    {
        return $query->where('is_flash_sale', true)
            ->where('flash_sale_end_at', '>', now())
            ->active();
    }

    // ── Accessors ─────────────────────────────────────────

    public function getCurrentPriceAttribute(): float
    {
        // Giá flash sale (từ bảng flash_sale_products) được ưu tiên nếu còn hiệu lực
        if ($this->is_flash_sale
            && $this->flash_sale_price
            && $this->flash_sale_end_at
            && $this->flash_sale_end_at->isFuture()
        ) {
            return (float) $this->flash_sale_price;
        }

        $flashSaleItem = $this->activeFlashSaleItem;
        if ($flashSaleItem && (float) $flashSaleItem->sale_price > 0) {
            return (float) $flashSaleItem->sale_price;
        }

        return (float) ($this->sale_price ?? $this->price);
    }

    public function getDiscountPercentageAttribute(): int
    {
        $current = $this->current_price;

        if ($current >= (float) $this->price || (float) $this->price <= 0) {
            return 0;
        }

        return (int) round((((float) $this->price - $current) / (float) $this->price) * 100);
    }
}
