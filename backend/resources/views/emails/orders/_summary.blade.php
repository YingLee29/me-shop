<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:18px 0;">
    <tr style="background:#FAF7F0;">
        <th align="left" style="padding:10px;font-size:12px;color:#7A6858;border-bottom:1px solid #E8E2D2;">Sản phẩm</th>
        <th align="center" style="padding:10px;font-size:12px;color:#7A6858;border-bottom:1px solid #E8E2D2;">SL</th>
        <th align="right" style="padding:10px;font-size:12px;color:#7A6858;border-bottom:1px solid #E8E2D2;">Thành tiền</th>
    </tr>
    @foreach($order->items as $item)
        <tr>
            <td style="padding:10px;border-bottom:1px solid #F0ECE1;font-size:13px;">
                {{ $item->product_name }}
                @if($item->variant_name)
                    <div style="font-size:11px;color:#7A6858;">{{ $item->variant_name }}</div>
                @endif
            </td>
            <td align="center" style="padding:10px;border-bottom:1px solid #F0ECE1;font-size:13px;">{{ $item->quantity }}</td>
            <td align="right" style="padding:10px;border-bottom:1px solid #F0ECE1;font-size:13px;">{{ number_format((float) $item->subtotal, 0, ',', '.') }}đ</td>
        </tr>
    @endforeach
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
    <tr><td style="padding:3px 0;color:#7A6858;">Tạm tính</td><td align="right">{{ number_format((float) $order->subtotal, 0, ',', '.') }}đ</td></tr>
    @if((float) $order->discount_amount > 0)
        <tr><td style="padding:3px 0;color:#2E7D32;">Giảm giá {{ $order->coupon_code ? '(' . $order->coupon_code . ')' : '' }}</td><td align="right" style="color:#2E7D32;">-{{ number_format((float) $order->discount_amount, 0, ',', '.') }}đ</td></tr>
    @endif
    @if((int) $order->points_used > 0)
        <tr><td style="padding:3px 0;color:#2E7D32;">Điểm thưởng ({{ $order->points_used }} điểm)</td><td align="right" style="color:#2E7D32;">-{{ number_format((float) $order->points_discount, 0, ',', '.') }}đ</td></tr>
    @endif
    <tr><td style="padding:3px 0;color:#7A6858;">Phí giao hàng</td><td align="right">{{ (float) $order->shipping_fee == 0 ? 'Miễn phí' : number_format((float) $order->shipping_fee, 0, ',', '.') . 'đ' }}</td></tr>
    <tr>
        <td style="padding:12px 0 0;border-top:1px solid #E8E2D2;font-size:15px;font-weight:bold;">Tổng thanh toán</td>
        <td align="right" style="padding:12px 0 0;border-top:1px solid #E8E2D2;font-size:17px;font-weight:bold;color:#D32F2F;">{{ number_format((float) $order->total, 0, ',', '.') }}đ</td>
    </tr>
</table>

<div style="margin-top:18px;padding:14px;background:#FAF7F0;border-radius:8px;font-size:13px;line-height:1.7;">
    <strong>Giao đến:</strong> {{ $order->shipping_name }} · {{ $order->shipping_phone }}<br>
    {{ $order->shipping_address }}
    @if($order->note)<br><strong>Ghi chú:</strong> {{ $order->note }}@endif
</div>
