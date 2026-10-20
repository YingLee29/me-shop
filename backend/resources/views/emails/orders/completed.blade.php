@extends('emails.layout')

@section('title', 'Đơn hàng hoàn thành ' . $order->order_code)

@section('content')
    <h2 style="margin:0 0 10px;font-size:20px;">Đơn hàng đã hoàn thành 🌿</h2>
    <p>Xin chào <strong>{{ $order->shipping_name }}</strong>,</p>
    <p>Đơn hàng <strong>{{ $order->order_code }}</strong> đã giao thành công. Cảm ơn bạn đã tin chọn nông sản sạch!</p>

    @include('emails.orders._summary')

    <p style="margin-top:18px;">Bạn vừa tích được điểm thưởng từ đơn hàng này. Hãy chia sẻ cảm nhận về sản phẩm để giúp chúng tôi phục vụ tốt hơn nhé.</p>
    <p style="margin:22px 0;">
        <a href="{{ config('app.url') }}/orders/{{ $order->order_code }}" style="display:inline-block;background:#C8A45A;color:#2C1A0E;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:999px;">Xem đơn hàng</a>
    </p>
@endsection
