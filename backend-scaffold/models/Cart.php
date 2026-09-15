<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    protected $fillable = ['user_id', 'session_id', 'product_id', 'variant_id', 'quantity'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /** Tính giá của item này */
    public function getItemPriceAttribute(): float
    {
        if ($this->variant) {
            return $this->variant->current_price;
        }
        return $this->product->current_price;
    }

    /** Tính subtotal của item */
    public function getSubtotalAttribute(): float
    {
        return $this->item_price * $this->quantity;
    }
}
