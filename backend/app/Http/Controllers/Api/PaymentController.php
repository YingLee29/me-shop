<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    /**
     * Tạo URL thanh toán MoMo / VNPAY.
     * POST /api/v1/payments/{code}/create
     */
    public function create(Request $request, string $code): JsonResponse
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        if (!in_array($order->payment_method, ['momo', 'vnpay'], true)) {
            throw ValidationException::withMessages([
                'payment_method' => 'Đơn hàng không sử dụng phương thức thanh toán online.',
            ]);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Đơn hàng đã được thanh toán.', 'paid' => true]);
        }

        if (in_array($order->status, [Order::STATUS_CANCELLED, Order::STATUS_REFUNDED], true)) {
            throw ValidationException::withMessages([
                'order' => 'Đơn hàng đã hủy hoặc hoàn tiền, không thể thanh toán.',
            ]);
        }

        return $order->payment_method === 'momo'
            ? $this->createMoMo($order)
            : $this->createVnPay($order);
    }

    // ── MoMo ─────────────────────────────────────────────

    private function createMoMo(Order $order): JsonResponse
    {
        $partnerCode = config('services.momo.partner_code');
        $accessKey   = config('services.momo.access_key');
        $secretKey   = config('services.momo.secret_key');
        $endpoint    = config('services.momo.endpoint');

        if (!$partnerCode || !$accessKey || !$secretKey) {
            return response()->json([
                'message' => 'Cổng thanh toán MoMo chưa được cấu hình. Vui lòng chọn COD hoặc chuyển khoản.',
                'configured' => false,
            ], 503);
        }

        $providerRef = $order->order_code . '-' . now()->timestamp;
        $requestId = $providerRef;
        $extraData = base64_encode(json_encode(['order_code' => $order->order_code]));
        $amount = (int) $order->total;
        $orderInfo = "Thanh toan don hang {$order->order_code}";
        $redirectUrl = rtrim(config('services.payments.backend_url'), '/') . '/api/v1/payments/momo/return';
        $ipnUrl = rtrim(config('services.payments.backend_url'), '/') . '/api/v1/payments/momo/ipn';

        $rawSignature = 'accessKey=' . $accessKey
            . '&amount=' . $amount
            . '&extraData=' . $extraData
            . '&ipnUrl=' . $ipnUrl
            . '&orderId=' . $providerRef
            . '&orderInfo=' . $orderInfo
            . '&partnerCode=' . $partnerCode
            . '&redirectUrl=' . $redirectUrl
            . '&requestId=' . $requestId
            . '&requestType=' . config('services.momo.request_type');

        $payload = [
            'partnerCode' => $partnerCode,
            'requestId'   => $requestId,
            'amount'      => $amount,
            'orderId'     => $providerRef,
            'orderInfo'   => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl'      => $ipnUrl,
            'lang'        => 'vi',
            'requestType' => config('services.momo.request_type'),
            'extraData'   => $extraData,
            'signature'   => hash_hmac('sha256', $rawSignature, $secretKey),
        ];

        try {
            $response = Http::timeout(20)->acceptJson()->post($endpoint, $payload);
            $body = $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::error('MoMo create error', ['order' => $order->order_code, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Không thể kết nối MoMo. Vui lòng thử lại.'], 502);
        }

        PaymentTransaction::create([
            'order_id'         => $order->id,
            'provider'         => 'momo',
            'provider_ref'     => $providerRef,
            'amount'           => $amount,
            'status'           => 'pending',
            'request_payload'  => $payload,
            'response_payload' => $body,
        ]);

        if (($body['resultCode'] ?? -1) !== 0 || empty($body['payUrl'])) {
            return response()->json([
                'message' => $body['message'] ?? 'Không thể tạo giao dịch MoMo.',
                'configured' => true,
            ], 422);
        }

        return response()->json([
            'payment_url'  => $body['payUrl'],
            'qr_code_url'  => $body['qrCodeUrl'] ?? null,
            'deeplink'     => $body['deeplink'] ?? null,
            'provider'     => 'momo',
        ]);
    }

    /**
     * MoMo IPN (server-to-server).
     * POST /api/v1/payments/momo/ipn
     */
    public function momoIpn(Request $request)
    {
        $this->handleMoMoCallback($request);
        return response()->noContent();
    }

    /**
     * MoMo redirect về website.
     * GET /api/v1/payments/momo/return
     */
    public function momoReturn(Request $request)
    {
        $success = $this->handleMoMoCallback($request);
        $order = PaymentTransaction::where('provider', 'momo')
            ->where('provider_ref', $request->input('orderId'))
            ->first()?->order;

        return $this->redirectToOrder($order, 'momo', $success);
    }

    private function handleMoMoCallback(Request $request): bool
    {
        $accessKey = config('services.momo.access_key');
        $secretKey = config('services.momo.secret_key');

        if (!$accessKey || !$secretKey) {
            return false;
        }

        $rawSignature = 'accessKey=' . $accessKey
            . '&amount=' . $request->input('amount')
            . '&extraData=' . $request->input('extraData')
            . '&message=' . $request->input('message')
            . '&orderId=' . $request->input('orderId')
            . '&orderInfo=' . $request->input('orderInfo')
            . '&orderType=' . $request->input('orderType')
            . '&partnerCode=' . $request->input('partnerCode')
            . '&payType=' . $request->input('payType')
            . '&requestId=' . $request->input('requestId')
            . '&responseTime=' . $request->input('responseTime')
            . '&resultCode=' . $request->input('resultCode')
            . '&transId=' . $request->input('transId');

        $signature = hash_hmac('sha256', $rawSignature, $secretKey);

        if (!hash_equals($signature, (string) $request->input('signature'))) {
            Log::warning('MoMo callback signature mismatch', ['orderId' => $request->input('orderId')]);
            return false;
        }

        $transaction = PaymentTransaction::with('order')
            ->where('provider', 'momo')
            ->where('provider_ref', $request->input('orderId'))
            ->first();

        if (!$transaction) {
            return false;
        }

        $transaction->update(['response_payload' => $request->all()]);

        if ((int) $request->input('resultCode') === 0) {
            $this->markPaid($transaction, (string) $request->input('transId'));
            return true;
        }

        $transaction->update(['status' => 'failed']);
        return false;
    }

    // ── VNPAY ────────────────────────────────────────────

    private function createVnPay(Order $order): JsonResponse
    {
        $tmnCode = config('services.vnpay.tmn_code');
        $secretKey = config('services.vnpay.hash_secret');

        if (!$tmnCode || !$secretKey) {
            return response()->json([
                'message' => 'Cổng thanh toán VNPAY chưa được cấu hình. Vui lòng chọn COD hoặc chuyển khoản.',
                'configured' => false,
            ], 503);
        }

        $providerRef = $order->order_code . '-' . now()->timestamp;
        $params = [
            'vnp_Version'    => '2.1.0',
            'vnp_Command'    => 'pay',
            'vnp_TmnCode'    => $tmnCode,
            'vnp_Amount'     => (int) $order->total * 100,
            'vnp_CurrCode'   => 'VND',
            'vnp_TxnRef'     => $providerRef,
            'vnp_OrderInfo'  => "Thanh toan don hang {$order->order_code}",
            'vnp_OrderType'  => 'other',
            'vnp_Locale'     => 'vn',
            'vnp_ReturnUrl'  => rtrim(config('services.payments.backend_url'), '/') . '/api/v1/payments/vnpay/return',
            'vnp_IpAddr'     => request()->ip() ?: '127.0.0.1',
            'vnp_CreateDate' => now()->format('YmdHis'),
            'vnp_ExpireDate' => now()->addMinutes(15)->format('YmdHis'),
        ];

        ksort($params);
        $hashData = [];
        foreach ($params as $key => $value) {
            $hashData[] = $key . '=' . urlencode((string) $value);
        }
        $queryString = implode('&', $hashData);
        $secureHash = hash_hmac('sha512', $queryString, $secretKey);
        $paymentUrl = config('services.vnpay.endpoint') . '?' . $queryString . '&vnp_SecureHash=' . $secureHash;

        PaymentTransaction::create([
            'order_id'         => $order->id,
            'provider'         => 'vnpay',
            'provider_ref'     => $providerRef,
            'amount'           => (int) $order->total,
            'status'           => 'pending',
            'request_payload'  => $params,
            'response_payload' => null,
        ]);

        return response()->json([
            'payment_url' => $paymentUrl,
            'provider'    => 'vnpay',
        ]);
    }

    /**
     * VNPAY return URL.
     * GET /api/v1/payments/vnpay/return
     */
    public function vnpayReturn(Request $request)
    {
        $valid = $this->verifyVnPay($request->all());
        $success = $valid && ($request->input('vnp_ResponseCode') === '00') && ($request->input('vnp_TransactionStatus') === '00');
        $transaction = PaymentTransaction::with('order')
            ->where('provider', 'vnpay')
            ->where('provider_ref', $request->input('vnp_TxnRef'))
            ->first();

        if ($valid && $transaction) {
            $transaction->update(['response_payload' => $request->all()]);

            if ($success) {
                $this->markPaid($transaction, (string) $request->input('vnp_TransactionNo'));
            } else {
                $transaction->update(['status' => 'failed']);
            }
        }

        return $this->redirectToOrder($transaction?->order, 'vnpay', $success);
    }

    /**
     * VNPAY IPN (server-to-server).
     * GET /api/v1/payments/vnpay/ipn
     */
    public function vnpayIpn(Request $request): JsonResponse
    {
        if (!$this->verifyVnPay($request->all())) {
            return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
        }

        $transaction = PaymentTransaction::with('order')
            ->where('provider', 'vnpay')
            ->where('provider_ref', $request->input('vnp_TxnRef'))
            ->first();

        if (!$transaction) {
            return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
        }

        if ($transaction->status === 'success') {
            return response()->json(['RspCode' => '02', 'Message' => 'Order already confirmed']);
        }

        if ((int) $request->input('vnp_Amount') !== (int) $transaction->amount * 100) {
            return response()->json(['RspCode' => '04', 'Message' => 'Invalid amount']);
        }

        $success = $request->input('vnp_ResponseCode') === '00' && $request->input('vnp_TransactionStatus') === '00';

        $transaction->update(['response_payload' => $request->all()]);

        if ($success) {
            $this->markPaid($transaction, (string) $request->input('vnp_TransactionNo'));
        } else {
            $transaction->update(['status' => 'failed']);
        }

        return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);
    }

    private function verifyVnPay(array $params): bool
    {
        $secretKey = config('services.vnpay.hash_secret');
        $secureHash = $params['vnp_SecureHash'] ?? '';

        if (!$secretKey || !$secureHash) {
            return false;
        }

        unset($params['vnp_SecureHash'], $params['vnp_SecureHashType']);
        $params = array_filter($params, fn($key) => str_starts_with($key, 'vnp_'), ARRAY_FILTER_USE_KEY);
        ksort($params);

        $hashData = [];
        foreach ($params as $key => $value) {
            $hashData[] = $key . '=' . urlencode((string) $value);
        }

        $expected = hash_hmac('sha512', implode('&', $hashData), $secretKey);

        return hash_equals($expected, $secureHash);
    }

    // ── Shared ───────────────────────────────────────────

    private function markPaid(PaymentTransaction $transaction, string $gatewayTransactionId): void
    {
        DB::transaction(function () use ($transaction, $gatewayTransactionId) {
            $transaction->refresh();

            if ($transaction->status === 'success') {
                return;
            }

            $transaction->update([
                'status'      => 'success',
                'paid_at'     => now(),
                'response_payload' => array_merge($transaction->response_payload ?? [], [
                    'gateway_transaction_id' => $gatewayTransactionId,
                ]),
            ]);

            $order = $transaction->order;

            if ($order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'paid_at'        => now(),
                ]);

                OrderStatusLog::create([
                    'order_id'    => $order->id,
                    'status'      => $order->status,
                    'note'        => 'Thanh toán ' . strtoupper($transaction->provider) . ' thành công (GD ' . $gatewayTransactionId . ').',
                    'created_by'  => null,
                ]);
            }
        });
    }

    private function redirectToOrder(?Order $order, string $provider, bool $success)
    {
        $frontend = rtrim(config('services.payments.frontend_url'), '/');

        if (!$order) {
            return redirect($frontend . '/orders?payment=failed');
        }

        $status = $success ? 'success' : 'failed';
        return redirect($frontend . "/orders/{$order->order_code}?payment={$provider}&status={$status}");
    }
}
