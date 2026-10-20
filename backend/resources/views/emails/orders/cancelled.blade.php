@extends('emails.layout')

@section('title', 'Đơn hàng đã bị hủy ' . $order->order_code)

@section('content')
    <h2 style="margin:0 0 10px;font-size:20px;">Đơn hàng đã được hủy</h2>
    <p>Xin chào <strong>{{ $order->shipping_name }}</strong>,</p>
    <p>Đơn hàng <strong>{{ $order->order_code }}</strong> đã bị hủy. Nếu bạn đã dùng điểm thưởng, điểm sẽ được hoàn lại vào tài khoản.</p>

    @include('emails.orders._summary')

    <p style="margin-top:18px;">Nếu bạn cần đặt lại đơn hàng, hãy truy cập website hoặc gọi hotline <strong>1900 6868</strong>.</p>
@endsection
