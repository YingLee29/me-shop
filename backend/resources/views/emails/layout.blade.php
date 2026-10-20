<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Nông Sản Việt')</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,Helvetica,sans-serif;color:#2C1A0E;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E8E2D2;">
                <tr>
                    <td style="background:#2C1A0E;padding:22px 28px;">
                        <div style="font-size:20px;font-weight:bold;color:#FFFFFF;letter-spacing:0.5px;">🌾 NÔNG SẢN VIỆT</div>
                        <div style="font-size:11px;color:#C8A45A;letter-spacing:1.5px;margin-top:4px;">TƯƠI SẠCH TẬN VƯỜN</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px;font-size:14px;line-height:1.7;color:#2C1A0E;">
                        @yield('content')
                    </td>
                </tr>
                <tr>
                    <td style="background:#FAF7F0;padding:18px 28px;text-align:center;font-size:12px;color:#7A6858;line-height:1.7;">
                        Hotline: <strong>1900 6868</strong> · Email: <a href="mailto:hello@nongsan.vn" style="color:#A0783A;">hello@nongsan.vn</a><br>
                        © {{ date('Y') }} Nông Sản Việt – Nông sản hữu cơ tận vườn.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
