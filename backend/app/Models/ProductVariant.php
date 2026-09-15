<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'name', 'value', 'price', 'sale_price',
        'stock_quantity', 'sku', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price'      => 'decimal:0',
        'sale_price' => 'decimal:0',
        'is_active'  => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }
}
