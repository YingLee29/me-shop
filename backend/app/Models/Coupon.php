<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'name', 'description', 'type', 'value',
        'min_order_amount', 'max_discount', 'usage_limit', 'used_count',
        'user_limit', 'starts_at', 'expired_at', 'is_active',
    ];

    protected $casts = [
        'value'            => 'decimal:0',
        'min_order_amount' => 'decimal:0',
        'max_discount'     => 'decimal:0',
        'usage_limit'      => 'integer',
        'used_count'       => 'integer',
        'user_limit'       => 'integer',
        'starts_at'        => 'datetime',
        'expired_at'       => 'datetime',
        'is_active'        => 'boolean',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isStarted(): bool
    {
        return $this->starts_at === null || $this->starts_at <= now();
    }

    public function isExpired(): bool
    {
        return $this->expired_at !== null && $this->expired_at < now();
    }

    public function isOutOfUsage(): bool
    {
        return $this->usage_limit !== null && $this->used_count >= $this->usage_limit;
    }

    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }
        if ($this->isExpired()) {
            return 'expired';
        }
        if (!$this->isStarted()) {
            return 'upcoming';
        }
        if ($this->isOutOfUsage()) {
            return 'exhausted';
        }
        return 'active';
    }
}
