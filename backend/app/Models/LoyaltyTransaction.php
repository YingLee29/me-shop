<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyTransaction extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'type', 'points', 'description',
    ];

    protected $casts = [
        'points' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'earn'   => 'Tích điểm',
            'redeem' => 'Dùng điểm',
            'refund' => 'Hoàn điểm',
            default  => 'Điều chỉnh',
        };
    }
}
