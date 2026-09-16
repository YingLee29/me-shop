<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'url', 'is_primary', 'sort_order', 'alt_text'];

    protected $casts = ['is_primary' => 'boolean'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->url;
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
