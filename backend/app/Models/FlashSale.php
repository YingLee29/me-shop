<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlashSale extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'banner_image',
        'start_at', 'end_at', 'is_active',
    ];

    protected $casts = [
        'start_at'  => 'datetime',
        'end_at'    => 'datetime',
        'is_active' => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'flash_sale_products')
            ->withPivot(['sale_price', 'quantity_limit', 'sold_count', 'sort_order'])
            ->withTimestamps()
            ->orderBy('flash_sale_products.sort_order');
    }

    public function items(): HasMany
    {
        return $this->hasMany(FlashSaleProduct::class);
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Đang diễn ra tại thời điểm hiện tại */
    public function scopeRunning(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('start_at', '<=', now())
            ->where('end_at', '>=', now());
    }

    // ── Helpers ───────────────────────────────────────────

    public function isRunning(): bool
    {
        return $this->is_active
            && $this->start_at <= now()
            && $this->end_at >= now();
    }

    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }
        if ($this->start_at > now()) {
            return 'upcoming';
        }
        if ($this->end_at < now()) {
            return 'ended';
        }
        return 'running';
    }
}
