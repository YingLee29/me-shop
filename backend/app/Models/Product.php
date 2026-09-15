<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        return $this->sale_price ?? $this->price;
    }

    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->sale_price || $this->sale_price >= $this->price) {
            return 0;
        }
        return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
    }
}
