<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FlashSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'banner_url',
        'start_at',
        'end_at',
        'is_active',
    ];

    protected $casts = [
        'start_at'  => 'datetime',
        'end_at'    => 'datetime',
        'is_active' => 'boolean',
    ];

    public function flashSaleProducts(): HasMany
    {
        return $this->hasMany(FlashSaleProduct::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'flash_sale_products')
            ->withPivot('flash_sale_price', 'limit_quantity', 'sold_quantity')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where('start_at', '<=', $now)
            ->where('end_at', '>=', $now);
    }
}
