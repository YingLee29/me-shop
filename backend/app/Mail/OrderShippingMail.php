<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShippingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        $subject = match ('shipping') {
            'confirmation' => 'Xác nhận đơn hàng ',
            'shipping'     => 'Đơn hàng đang được giao ',
            'cancelled'    => 'Đơn hàng đã bị hủy ',
            'completed'    => 'Đơn hàng hoàn thành ',
            default        => 'Cập nhật đơn hàng ',
        };

        return new Envelope(subject: $subject . $this->order->order_code);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.orders.shipping');
    }

    public function attachments(): array
    {
        return [];
    }
}
