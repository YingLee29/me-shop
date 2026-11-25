<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MomoPaymentService
{
    protected string $partnerCode;
    protected string $accessKey;
    protected string $secretKey;
    protected string $endpoint;

    public function __construct()
    {
        $this->partnerCode = config('services.momo.partner_code', 'MOMO_TEST_PARTNER');
        $this->accessKey   = config('services.momo.access_key', 'MOMO_TEST_ACCESS');
        $this->secretKey   = config('services.momo.secret_key', 'MOMO_TEST_SECRET');
        $this->endpoint    = config('services.momo.endpoint', 'https://test-payment.momo.vn/v2/gateway/api/create');
    }

    /**
     * Tạo liên kết thanh toán MoMo
     */
    public function createPayment(Order $order, string $returnUrl, string $notifyUrl): array
    {
        $orderId   = $order->order_code . '_' . time();
        $requestId = (string) time();
        $amount    = (string) (int) $order->total;
        $orderInfo = 'Thanh toán đơn hàng #' . $order->order_code . ' - Nong San Sach';
        $extraData = base64_encode(json_encode(['order_code' => $order->order_code]));
        $requestType = 'captureWallet';

        // Raw signature string format specified by MoMo API v2
        $rawHash = "accessKey=" . $this->accessKey .
                   "&amount=" . $amount .
                   "&extraData=" . $extraData .
                   "&ipnUrl=" . $notifyUrl .
                   "&orderId=" . $orderId .
                   "&orderInfo=" . $orderInfo .
                   "&partnerCode=" . $this->partnerCode .
                   "&redirectUrl=" . $returnUrl .
                   "&requestId=" . $requestId .
                   "&requestType=" . $requestType;

        $signature = hash_hmac('sha256', $rawHash, $this->secretKey);

        $payload = [
            'partnerCode' => $this->partnerCode,
            'partnerName' => 'Nông Sản Sạch',
            'storeId'     => 'NongSanStore',
            'requestId'   => $requestId,
            'amount'      => $amount,
            'orderId'     => $orderId,
            'orderInfo'   => $orderInfo,
            'redirectUrl' => $returnUrl,
            'ipnUrl'      => $notifyUrl,
            'lang'        => 'vi',
            'extraData'   => $extraData,
            'requestType' => $requestType,
            'signature'   => $signature,
        ];

        try {
            $response = Http::timeout(5)->post($this->endpoint, $payload);

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data['payUrl'])) {
                    return [
                        'success' => true,
                        'pay_url' => $data['payUrl'],
                        'data'    => $data,
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning('MoMo Gateway connection fallback to local sandbox: ' . $e->getMessage());
        }

        // Sandbox simulator fallback
        $frontendBase = config('app.frontend_url', 'http://localhost:3000');
        $simulatedUrl = $frontendBase . '/payment/gateway?' . http_build_query([
            'method'     => 'momo',
            'order_code' => $order->order_code,
            'amount'     => $order->total,
            'signature'  => $signature,
        ]);

        return [
            'success'   => true,
            'pay_url'   => $simulatedUrl,
            'simulated' => true,
        ];
    }

    /**
     * Xác thực chữ ký IPN từ MoMo
     */
    public function verifySignature(array $data): bool
    {
        if (empty($data['signature'])) {
            return false;
        }

        $rawHash = "accessKey=" . $this->accessKey .
                   "&amount=" . ($data['amount'] ?? '') .
                   "&extraData=" . ($data['extraData'] ?? '') .
                   "&message=" . ($data['message'] ?? '') .
                   "&orderId=" . ($data['orderId'] ?? '') .
                   "&orderInfo=" . ($data['orderInfo'] ?? '') .
                   "&orderType=" . ($data['orderType'] ?? '') .
                   "&partnerCode=" . ($data['partnerCode'] ?? '') .
                   "&payType=" . ($data['payType'] ?? '') .
                   "&requestId=" . ($data['requestId'] ?? '') .
                   "&responseTime=" . ($data['responseTime'] ?? '') .
                   "&resultCode=" . ($data['resultCode'] ?? '') .
                   "&transId=" . ($data['transId'] ?? '');

        $calculatedSignature = hash_hmac('sha256', $rawHash, $this->secretKey);

        return hash_equals($calculatedSignature, $data['signature']);
    }
}
