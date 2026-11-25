<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Services\MomoPaymentService;
use App\Services\VnpayPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected MomoPaymentService $momoService;
    protected VnpayPaymentService $vnpayService;

    public function __construct(MomoPaymentService $momoService, VnpayPaymentService $vnpayService)
    {
        $this->momoService  = $momoService;
        $this->vnpayService = $vnpayService;
    }

    /**
     * Khởi tạo thanh toán MoMo
     * POST /api/v1/payment/momo/create
     */
    public function createMoMo(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => ['required', 'string', 'exists:orders,order_code'],
        ]);

        $order = Order::where('order_code', $request->input('order_code'))->firstOrFail();

        $frontendBase = config('app.frontend_url', 'http://localhost:3000');
        $returnUrl = $frontendBase . '/payment/result?method=momo&order_code=' . $order->order_code;
        $notifyUrl = url('/api/v1/payment/momo/ipn');

        $result = $this->momoService->createPayment($order, $returnUrl, $notifyUrl);

        return response()->json([
            'success'   => true,
            'pay_url'   => $result['pay_url'],
            'simulated' => $result['simulated'] ?? false,
        ]);
    }

    /**
     * Khởi tạo thanh toán VNPAY
     * POST /api/v1/payment/vnpay/create
     */
    public function createVnpay(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => ['required', 'string', 'exists:orders,order_code'],
        ]);

        $order = Order::where('order_code', $request->input('order_code'))->firstOrFail();

        $frontendBase = config('app.frontend_url', 'http://localhost:3000');
        $returnUrl = $frontendBase . '/payment/result?method=vnpay&order_code=' . $order->order_code;

        $payUrl = $this->vnpayService->createPaymentUrl($order, $returnUrl, $request->ip());

        return response()->json([
            'success' => true,
            'pay_url' => $payUrl,
        ]);
    }

    /**
     * Callback / IPN từ MoMo
     * POST /api/v1/payment/momo/ipn
     */
    public function momoIpn(Request $request): JsonResponse
    {
        $data = $request->all();
        Log::info('MoMo IPN received:', $data);

        $orderCode = $data['order_code'] ?? null;
        if (!$orderCode && !empty($data['extraData'])) {
            $extra = json_decode(base64_decode($data['extraData']), true);
            $orderCode = $extra['order_code'] ?? null;
        }

        if (!$orderCode) {
            return response()->json(['message' => 'Missing order code'], 400);
        }

        $order = Order::where('order_code', $orderCode)->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Cập nhật trạng thái thanh toán thành công
        if ($order->payment_status !== 'paid') {
            $fromStatus = $order->status;
            $order->update([
                'payment_status' => 'paid',
                'status'         => 'confirmed',
                'paid_at'        => now(),
            ]);

            OrderStatusLog::create([
                'order_id' => $order->id,
                'status'   => 'confirmed',
                'note'     => 'Thanh toán thành công qua Ví điện tử MoMo',
            ]);
        }

        return response()->json(['message' => 'IPN Processed Successfully'], 200);
    }

    /**
     * Xác nhận thanh toán Sandbox (dùng cho mô phỏng trực tiếp từ Gateway UI)
     * POST /api/v1/payment/confirm
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => ['required', 'string', 'exists:orders,order_code'],
            'method'     => ['required', 'in:momo,vnpay,bank_transfer'],
        ]);

        $order = Order::where('order_code', $request->input('order_code'))->firstOrFail();

        $fromStatus = $order->status;
        $order->update([
            'payment_method' => $request->input('method'),
            'payment_status' => 'paid',
            'status'         => $fromStatus === 'pending' ? 'confirmed' : $fromStatus,
            'paid_at'        => now(),
        ]);

        OrderStatusLog::create([
            'order_id' => $order->id,
            'status'   => $order->status,
            'note'     => 'Thanh toán online thành công qua cổng ' . strtoupper($request->input('method')),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xác nhận thanh toán thành công!',
            'order'   => [
                'order_code'     => $order->order_code,
                'payment_status' => $order->payment_status,
                'status'         => $order->status,
            ],
        ]);
    }
}
