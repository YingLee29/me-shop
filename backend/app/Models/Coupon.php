<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'value',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'start_at',
        'expired_at',
        'is_active',
    ];

    protected $casts = [
        'value'               => 'float',
        'min_order_amount'    => 'float',
        'max_discount_amount' => 'float',
        'usage_limit'         => 'integer',
        'used_count'          => 'integer',
        'start_at'            => 'datetime',
        'expired_at'          => 'datetime',
        'is_active'           => 'boolean',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isValidFor(float $subtotal): array
    {
        if (!$this->is_active) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã bị tạm ngừng kích hoạt.'];
        }

        $now = now();
        if ($this->start_at && $now->lt($this->start_at)) {
            return ['valid' => false, 'message' => 'Mã giảm giá chưa đến đợt áp dụng.'];
        }

        if ($this->expired_at && $now->gt($this->expired_at)) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã hết hạn sử dụng.'];
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng.'];
        }

        if ($subtotal < $this->min_order_amount) {
            return [
                'valid'   => false,
                'message' => 'Đơn hàng tối thiểu để dùng mã này là ' . number_format($this->min_order_amount, 0, ',', '.') . 'đ.',
            ];
        }

        return ['valid' => true];
    }

    public function calculateDiscount(float $subtotal, float $shippingFee = 0): float
    {
        $discount = 0;

        switch ($this->type) {
            case 'percent':
                $discount = ($subtotal * $this->value) / 100;
                if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
                    $discount = $this->max_discount_amount;
                }
                break;
            case 'fixed':
                $discount = min($this->value, $subtotal);
                break;
            case 'freeship':
                $discount = $shippingFee;
                break;
        }

        return round($discount);
    }
}
