@extends('emails.layout')

@section('title', 'Xác nhận đơn hàng ' . $order->order_code)

@section('content')
    <h2 style="margin:0 0 10px;font-size:20px;">Đặt hàng thành công 🎉</h2>
    <p>Xin chào <strong>{{ $order->shipping_name }}</strong>,</p>
    <p>Chúng tôi đã nhận được đơn hàng <strong style="color:#A0783A;">{{ $order->order_code }}</strong>. Đơn hàng đang chờ xác nhận và sẽ được chuẩn bị trong thời gian sớm nhất.</p>

    @include('emails.orders._summary')

    <p style="margin-top:20px;">Bạn có thể theo dõi trạng thái đơn hàng tại website.</p>
    <p style="margin:22px 0;">
        <a href="{{ config('app.url') }}/orders/{{ $order->order_code }}" style="display:inline-block;background:#C8A45A;color:#2C1A0E;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:999px;">Theo dõi đơn hàng</a>
    </p>
    <p style="color:#7A6858;font-size:13px;">Cảm ơn bạn đã tin chọn Nông Sản Việt!</p>
@endsection
