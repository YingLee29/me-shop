<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\ShipmentEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Lớp tích hợp vận chuyển.
 *
 * Mặc định chạy ở chế độ demo để không cần credential GHN:
 * - Tính phí theo khu vực tỉnh/thành
 * - Sinh mã vận đơn GHN-DEMO
 * - Nhận webhook để cập nhật trạng thái/timeline
 *
 * Khi có GHN_TOKEN/ GHN_SHOP_ID, có thể bổ sung lời gọi API thật
 * mà không phải thay đổi controller/UI.
 */
class ShippingService
{
    public const PROVIDER = 'ghn';

    public const FREE_SHIP_THRESHOLD = 300000;

    public const DEFAULT_FEE = 25000;

    private const STATUS_LABELS = [
        'ready_to_pick'         => 'Đã tạo đơn vận chuyển, chờ lấy hàng',
        'picking'               => 'Nhân viên GHN đang đến lấy hàng',
        'money_collect_picking' => 'Đang thu tiền khi lấy hàng',
        'picked'                => 'Đã lấy hàng từ người gửi',
        'storing'               => 'Hàng đang lưu tại kho GHN',
        'transporting'          => 'Hàng đang được vận chuyển',
        'sorting'               => 'Hàng đang được phân loại',
        'delivering'            => 'Hàng đang được giao đến người nhận',
        'money_collect_delivering' => 'Đang thu tiền khi giao hàng',
        'delivered'             => 'Giao hàng thành công',
        'return'                => 'Đơn hàng đang được hoàn về',
        'returned'              => 'Đơn hàng đã hoàn về người gửi',
        'cancel'                => 'Đơn vận chuyển đã bị hủy',
    ];

    public function isDemo(): bool
    {
        return (bool) config('services.ghn.demo', true) || !config('services.ghn.token');
    }

    /**
     * Báo giá vận chuyển theo địa chỉ.
     *
     * @return array{fee: float, original_fee: float, estimated_days: string, zone: string, provider: string}
     */
    public function quote(?string $province, ?string $district = null, float $subtotal = 0, int $weightGram = 500): array
    {
        $zone = $this->zoneFor($province);
        $originalFee = match ($zone) {
            'hanoi', 'hcm' => 22000,
            'central'      => 30000,
            'other'        => 35000,
            default        => self::DEFAULT_FEE,
        };

        // Hàng nặng hơn 2kg cộng thêm 5.000đ mỗi kg tiếp theo (demo).
        if ($weightGram > 2000) {
            $originalFee += (int) ceil(($weightGram - 2000) / 1000) * 5000;
        }

        $fee = $subtotal >= self::FREE_SHIP_THRESHOLD ? 0 : $originalFee;

        return [
            'fee'            => (float) $fee,
            'original_fee'   => (float) $originalFee,
            'estimated_days' => match ($zone) {
                'hanoi', 'hcm' => '1–2 ngày',
                'central'      => '2–3 ngày',
                default        => '3–5 ngày',
            },
            'zone'           => $zone,
            'provider'       => $this->isDemo() ? 'ghn-demo' : self::PROVIDER,
        ];
    }

    /**
     * Tạo vận đơn khi admin xác nhận đơn hàng.
     * Demo trả mã vận đơn nội bộ, không gọi mạng.
     */
    public function createShipment(Order $order): Order
    {
        if ($order->tracking_code) {
            return $order;
        }

        $trackingCode = $this->generateTrackingCode($order);
        $estimatedAt = now()->addDays($this->estimatedDaysFor($order->shipping_province));

        DB::transaction(function () use ($order, $trackingCode, $estimatedAt) {
            $fresh = Order::lockForUpdate()->findOrFail($order->id);

            if ($fresh->tracking_code) {
                $order->setRawAttributes($fresh->getAttributes(), true);
                return;
            }

            $fresh->update([
                'shipping_provider'     => $this->isDemo() ? 'ghn-demo' : self::PROVIDER,
                'tracking_code'         => $trackingCode,
                'shipping_status'       => 'ready_to_pick',
                'shipping_estimated_at' => $estimatedAt,
            ]);

            $this->recordEvent($fresh, [
                'event_id'    => 'created-' . $fresh->id,
                'status'      => 'ready_to_pick',
                'description' => 'Đơn vận chuyển đã được tạo, chờ GHN lấy hàng.',
                'occurred_at' => now(),
            ]);

            $order->setRawAttributes($fresh->getAttributes(), true);
        });

        return $order->refresh();
    }

    /**
     * Xử lý webhook GHN. Idempotent theo event_id.
     */
    public function handleWebhook(array $payload): Order
    {
        $order = Order::where('order_code', $payload['order_code'])->firstOrFail();
        $rawStatus = strtolower((string) $payload['status']);
        $description = $payload['description'] ?? self::STATUS_LABELS[$rawStatus] ?? $rawStatus;
        $occurredAt = $payload['occurred_at']
            ? Carbon::parse($payload['occurred_at'])
            : now();

        DB::transaction(function () use ($order, $payload, $rawStatus, $description, $occurredAt) {
            $order->update([
                'shipping_provider' => self::PROVIDER,
                'tracking_code'     => $order->tracking_code ?: ($payload['tracking_code'] ?? null),
                'shipping_status'   => $rawStatus,
            ]);

            $this->recordEvent($order, [
                'event_id'    => $payload['event_id'] ?? null,
                'status'      => $rawStatus,
                'description' => $description,
                'occurred_at' => $occurredAt,
            ]);

            $nextStatus = $this->mapOrderStatus($rawStatus);
            if ($nextStatus && $nextStatus !== $order->status) {
                $order->update(['status' => $nextStatus]);
                OrderStatusLog::create([
                    'order_id'   => $order->id,
                    'status'     => $nextStatus,
                    'note'       => 'GHN: ' . $description,
                    'created_by' => null,
                ]);
            }
        });

        return $order->refresh();
    }

    public function statusLabel(?string $status): ?string
    {
        if (!$status) {
            return null;
        }

        return self::STATUS_LABELS[$status] ?? $status;
    }

    private function recordEvent(Order $order, array $data): ShipmentEvent
    {
        $attributes = [
            'order_id'      => $order->id,
            'provider'      => self::PROVIDER,
            'tracking_code' => $order->tracking_code,
            'event_id'      => $data['event_id'] ?? null,
            'status'        => $data['status'],
            'description'   => $data['description'] ?? null,
            'occurred_at'   => $data['occurred_at'] ?? now(),
            'raw_payload'   => $data['raw_payload'] ?? null,
        ];

        if (!empty($data['event_id'])) {
            return ShipmentEvent::firstOrCreate(
                ['provider' => self::PROVIDER, 'event_id' => $data['event_id']],
                $attributes,
            );
        }

        return ShipmentEvent::create($attributes);
    }

    private function mapOrderStatus(string $shippingStatus): ?string
    {
        return match ($shippingStatus) {
            'picked', 'storing', 'transporting', 'sorting', 'delivering',
            'money_collect_delivering' => Order::STATUS_SHIPPING,
            'delivered'                => Order::STATUS_DELIVERED,
            default                    => null,
        };
    }

    private function zoneFor(?string $province): string
    {
        $normalized = Str::lower(Str::ascii((string) $province));

        if ($normalized === '') {
            return 'unknown';
        }

        $hanoi = ['ha noi', 'hanoi', 'hai phong', 'quang ninh', 'bac ninh', 'hung yen', 'vinh phuc', 'ha nam', 'thai binh', 'nam dinh', 'ninh binh'];
        $hcm = ['ho chi minh', 'hcm', 'sai gon', 'binh duong', 'dong nai', 'long an', 'ba ria', 'vung tau', 'tay ninh', 'binh phuoc'];
        $central = ['da nang', 'hue', 'quang nam', 'quang ngai', 'binh dinh', 'phu yen', 'khanh hoa', 'nha trang', 'quang tri', 'quang binh', 'ha tinh', 'nghe an', 'thanh hoa'];

        foreach ($hanoi as $keyword) {
            if (str_contains($normalized, $keyword)) return 'hanoi';
        }
        foreach ($hcm as $keyword) {
            if (str_contains($normalized, $keyword)) return 'hcm';
        }
        foreach ($central as $keyword) {
            if (str_contains($normalized, $keyword)) return 'central';
        }

        return 'other';
    }

    private function estimatedDaysFor(?string $province): int
    {
        return match ($this->zoneFor($province)) {
            'hanoi', 'hcm' => 2,
            'central'      => 3,
            default        => 5,
        };
    }

    private function generateTrackingCode(Order $order): string
    {
        do {
            $code = 'GHND' . substr(preg_replace('/\D/', '', $order->order_code), -8) . strtoupper(Str::random(3));
        } while (Order::where('tracking_code', $code)->exists());

        return $code;
    }
}
