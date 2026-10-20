@extends('emails.layout')

@section('title', 'Đơn hàng đang được giao ' . $order->order_code)

@section('content')
    <h2 style="margin:0 0 10px;font-size:20px;">Đơn hàng đang trên đường đến bạn 🚚</h2>
    <p>Xin chào <strong>{{ $order->shipping_name }}</strong>,</p>
    <p>Đơn hàng <strong style="color:#A0783A;">{{ $order->order_code }}</strong> đã được bàn giao cho đơn vị vận chuyển.</p>

    @include('emails.orders._summary')

    <p style="margin-top:18px;">Vui lòng để ý điện thoại <strong>{{ $order->shipping_phone }}</strong> để nhận hàng. Nếu cần hỗ trợ, gọi hotline <strong>1900 6868</strong>.</p>
@endsection
