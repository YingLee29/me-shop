<?php

namespace App\Observers;

use App\Mail\OrderCancelledMail;
use App\Mail\OrderCompletedMail;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderShippingMail;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderObserver
{
    public function created(Order $order): void
    {
        $this->queueAfterCommit($order, OrderConfirmationMail::class);
    }

    public function updated(Order $order): void
    {
        if (! $order->wasChanged('status')) {
            return;
        }

        $mailable = match ($order->status) {
            Order::STATUS_SHIPPING  => OrderShippingMail::class,
            Order::STATUS_CANCELLED => OrderCancelledMail::class,
            Order::STATUS_COMPLETED => OrderCompletedMail::class,
            default                 => null,
        };

        if ($mailable) {
            $this->queueAfterCommit($order, $mailable);
        }
    }

    /**
     * Chỉ gửi sau khi transaction tạo/cập nhật đơn hoàn tất,
     * để order items và trạng thái mới nhất đã sẵn sàng.
     */
    private function queueAfterCommit(Order $order, string $mailableClass): void
    {
        $orderId = $order->id;

        DB::afterCommit(function () use ($orderId, $mailableClass) {
            $fresh = Order::with(['items.product', 'user'])->find($orderId);

            if (! $fresh) {
                return;
            }

            $email = $fresh->shipping_email ?: $fresh->user?->email;

            if (! $email) {
                return;
            }

            Mail::to($email)->queue(new $mailableClass($fresh));
        });
    }
}
