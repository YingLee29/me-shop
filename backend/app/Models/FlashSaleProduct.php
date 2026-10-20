<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlashSaleProduct extends Model
{
    protected $fillable = [
        'flash_sale_id', 'product_id', 'sale_price',
        'quantity_limit', 'sold_count', 'sort_order',
    ];

    protected $casts = [
        'sale_price'     => 'decimal:0',
        'quantity_limit' => 'integer',
        'sold_count'     => 'integer',
        'sort_order'     => 'integer',
    ];

    public function flashSale(): BelongsTo
    {
        return $this->belongsTo(FlashSale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
