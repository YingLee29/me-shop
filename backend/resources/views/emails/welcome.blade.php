@extends('emails.layout')

@section('title', 'Chào mừng bạn đến với Nông Sản Việt')

@section('content')
    <h2 style="margin:0 0 14px;font-size:20px;color:#2C1A0E;">Xin chào {{ $user->name }} 🌱</h2>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Nông Sản Việt</strong>.</p>
    <p>Từ hôm nay bạn có thể:</p>
    <ul style="padding-left:20px;margin:12px 0;">
        <li>Đặt mua nông sản hữu cơ chuẩn VietGAP, giao lạnh trong 2h.</li>
        <li>Lưu sản phẩm yêu thích và theo dõi đơn hàng dễ dàng.</li>
        <li>Tích điểm thưởng mỗi khi mua sắm – đổi điểm thành giảm giá.</li>
    </ul>
    <p style="margin:24px 0;">
        <a href="{{ config('app.url') }}" style="display:inline-block;background:#C8A45A;color:#2C1A0E;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:999px;">Bắt đầu mua sắm</a>
    </p>
    <p style="color:#7A6858;font-size:13px;">Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.</p>
@endsection
