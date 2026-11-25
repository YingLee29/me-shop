<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlashSaleProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'flash_sale_id',
        'product_id',
        'flash_sale_price',
        'limit_quantity',
        'sold_quantity',
    ];

    protected $casts = [
        'flash_sale_price' => 'float',
        'limit_quantity'   => 'integer',
        'sold_quantity'    => 'integer',
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
