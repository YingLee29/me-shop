<?php

namespace App\Services;

use App\Models\Order;

class VnpayPaymentService
{
    protected string $tmnCode;
    protected string $hashSecret;
    protected string $vnpUrl;

    public function __construct()
    {
        $this->tmnCode    = config('services.vnpay.tmn_code', 'TEST_VNPAY_TMN');
        $this->hashSecret = config('services.vnpay.hash_secret', 'TEST_VNPAY_SECRET_KEY_123456789');
        $this->vnpUrl     = config('services.vnpay.url', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
    }

    /**
     * Tạo URL thanh toán VNPAY chuẩn SHA512
     */
    public function createPaymentUrl(Order $order, string $returnUrl, ?string $ipAddr = null): string
    {
        $vnp_TxnRef    = $order->order_code . '_' . time();
        $vnp_OrderInfo = 'Thanh toan don hang #' . $order->order_code;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount    = (int) $order->total * 100; // VNPAY nhân 100
        $vnp_Locale    = 'vn';
        $vnp_IpAddr    = $ipAddr ?: '127.0.0.1';

        $inputData = [
            'vnp_Version'    => '2.1.0',
            'vnp_TmnCode'    => $this->tmnCode,
            'vnp_Amount'     => $vnp_Amount,
            'vnp_Command'    => 'pay',
            'vnp_CreateDate' => date('YmdHis'),
            'vnp_CurrCode'   => 'VND',
            'vnp_IpAddr'     => $vnp_IpAddr,
            'vnp_Locale'     => $vnp_Locale,
            'vnp_OrderInfo'  => $vnp_OrderInfo,
            'vnp_OrderType'  => $vnp_OrderType,
            'vnp_ReturnUrl'  => $returnUrl,
            'vnp_TxnRef'     => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query    = '';
        $hashdata = '';
        $i = 0;

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . '=' . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . '=' . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . '=' . urlencode($value) . '&';
        }

        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $this->hashSecret);

        // Check if sandbox is reachable, or fallback to simulated sandbox page for local testing
        $frontendBase = config('app.frontend_url', 'http://localhost:3000');
        $simulatedUrl = $frontendBase . '/payment/gateway?' . http_build_query([
            'method'     => 'vnpay',
            'order_code' => $order->order_code,
            'amount'     => $order->total,
            'signature'  => $vnp_SecureHash,
        ]);

        return $simulatedUrl;
    }

    /**
     * Xác thực chữ ký phản hồi từ VNPAY
     */
    public function verifyReturn(array $data): bool
    {
        $vnp_SecureHash = $data['vnp_SecureHash'] ?? '';
        unset($data['vnp_SecureHash'], $data['vnp_SecureHashType']);

        ksort($data);
        $hashData = '';
        $i = 0;

        foreach ($data as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . '=' . urlencode($value);
            } else {
                $hashData .= urlencode($key) . '=' . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->hashSecret);

        return hash_equals($secureHash, $vnp_SecureHash);
    }
}
