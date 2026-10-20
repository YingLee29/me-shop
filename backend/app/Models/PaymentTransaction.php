<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id', 'provider', 'provider_ref', 'amount', 'status',
        'request_payload', 'response_payload', 'paid_at',
    ];

    protected $casts = [
        'amount'           => 'decimal:0',
        'request_payload'  => 'array',
        'response_payload' => 'array',
        'paid_at'          => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
