<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'order_code', 'status', 'payment_method', 'payment_status',
        'shipping_name', 'shipping_phone', 'shipping_email',
        'shipping_province', 'shipping_district', 'shipping_ward', 'shipping_address',
        'subtotal', 'shipping_fee', 'discount_amount', 'total',
        'coupon_code', 'note', 'admin_note', 'paid_at',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:0',
        'shipping_fee'    => 'decimal:0',
        'discount_amount' => 'decimal:0',
        'total'           => 'decimal:0',
        'paid_at'         => 'datetime',
    ];

    const STATUS_PENDING   = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_SHIPPING  = 'shipping';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED  = 'refunded';

    const CANCELLABLE_STATUSES = [self::STATUS_PENDING, self::STATUS_CONFIRMED];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class)->orderBy('created_at');
    }

    /** Sinh mã đơn hàng: NS + yyyymmdd + random 4 số */
    public static function generateCode(): string
    {
        do {
            $code = 'NS' . date('Ymd') . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('order_code', $code)->exists());

        return $code;
    }

    public function canCancel(): bool
    {
        return in_array($this->status, self::CANCELLABLE_STATUSES);
    }
}
