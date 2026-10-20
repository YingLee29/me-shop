<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Lấy giỏ hàng của user hiện tại
     * GET /api/v1/cart
     */
    public function index(Request $request): JsonResponse
    {
        return $this->cartResponse($request->user()->id);
    }

    /**
     * Thêm sản phẩm vào giỏ
     * POST /api/v1/cart
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id'  => ['required', 'integer', 'exists:products,id'],
            'variant_id'  => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity'    => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $product = Product::active()->findOrFail($data['product_id']);
        $variant = $this->resolveVariant($product, $data['variant_id'] ?? null);

        if (($data['variant_id'] ?? null) && !$variant) {
            return response()->json(['message' => 'Biến thể không thuộc sản phẩm đã chọn.'], 422);
        }

        $stock = $variant ? $variant->stock : $product->stock_quantity;

        if ($stock < $data['quantity']) {
            return response()->json(['message' => 'Số lượng vượt quá tồn kho.'], 422);
        }

        // Upsert: nếu đã có → cộng thêm quantity
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->where('variant_id', $variant?->id)
            ->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $data['quantity'];
            if ($newQty > $stock) {
                return response()->json(['message' => 'Tổng số lượng vượt quá tồn kho.'], 422);
            }
            $cartItem->update(['quantity' => $newQty]);
        } else {
            $cartItem = Cart::create([
                'user_id'    => $request->user()->id,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'quantity'   => $data['quantity'],
                'price'      => $this->unitPrice($product, $variant),
            ]);
        }

        return response()->json(['message' => 'Đã thêm vào giỏ hàng!', 'item_id' => $cartItem->id], 201);
    }

    /**
     * Đồng bộ giỏ guest (localStorage) lên server sau khi đăng nhập.
     * POST /api/v1/cart/sync
     */
    public function sync(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items'              => ['present', 'array', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity'   => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $userId = $request->user()->id;

        DB::transaction(function () use ($data, $userId) {
            foreach ($data['items'] as $item) {
                $product = Product::active()->find($item['product_id']);
                if (!$product) {
                    continue; // sản phẩm đã ngừng bán → bỏ qua
                }

                $variant = $this->resolveVariant($product, $item['variant_id'] ?? null);
                if (($item['variant_id'] ?? null) && !$variant) {
                    continue; // biến thể không thuộc sản phẩm → bỏ qua
                }

                $stock = $variant ? $variant->stock : $product->stock_quantity;
                if ($stock <= 0) {
                    continue;
                }

                $quantity = min($item['quantity'], $stock);

                $cartItem = Cart::where('user_id', $userId)
                    ->where('product_id', $product->id)
                    ->where('variant_id', $variant?->id)
                    ->lockForUpdate()
                    ->first();

                if ($cartItem) {
                    $cartItem->update([
                        'quantity' => min($cartItem->quantity + $quantity, $stock),
                    ]);
                } else {
                    Cart::create([
                        'user_id'    => $userId,
                        'product_id' => $product->id,
                        'variant_id' => $variant?->id,
                        'quantity'   => $quantity,
                        'price'      => $this->unitPrice($product, $variant),
                    ]);
                }
            }
        });

        return $this->cartResponse($userId, 'Đã đồng bộ giỏ hàng.');
    }

    /**
     * Cập nhật số lượng
     * PUT /api/v1/cart/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $cartItem = Cart::where('user_id', $request->user()->id)->findOrFail($id);

        $stock = $cartItem->variant ? $cartItem->variant->stock : $cartItem->product->stock_quantity;
        if ($data['quantity'] > $stock) {
            return response()->json(['message' => 'Số lượng vượt quá tồn kho.'], 422);
        }

        $cartItem->update(['quantity' => $data['quantity']]);

        return response()->json(['message' => 'Đã cập nhật giỏ hàng.']);
    }

    /**
     * Xóa 1 item khỏi giỏ
     * DELETE /api/v1/cart/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        Cart::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Đã xóa khỏi giỏ hàng.']);
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * DELETE /api/v1/cart
     */
    public function clear(Request $request): JsonResponse
    {
        Cart::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng.']);
    }

    // ── Helpers ───────────────────────────────────────────

    private function cartResponse(int $userId, ?string $message = null): JsonResponse
    {
        $items = Cart::with(['product.primaryImage', 'product.activeFlashSaleItem', 'variant'])
            ->where('user_id', $userId)
            ->get();

        $payload = [
            'data'  => $this->formatItems($items),
            'total' => $this->calcTotal($items),
        ];

        if ($message) {
            $payload['message'] = $message;
        }

        return response()->json($payload);
    }

    /** Chỉ chấp nhận biến thể thuộc đúng sản phẩm */
    private function resolveVariant(Product $product, ?int $variantId): ?ProductVariant
    {
        if (!$variantId) {
            return null;
        }

        return ProductVariant::where('product_id', $product->id)->find($variantId);
    }

    private function unitPrice(Product $product, ?ProductVariant $variant): float
    {
        return (float) $product->current_price + (float) ($variant?->price_adjust ?? 0);
    }

    private function formatItems($items): array
    {
        return $items->map(function ($item) {
            // Luôn dùng giá hiện tại (đã gồm flash sale) để khớp với lúc đặt hàng
            $price = $this->unitPrice($item->product, $item->variant);

            return [
                'id'         => $item->id,
                'product_id' => $item->product_id,
                'name'       => $item->product->name,
                'slug'       => $item->product->slug,
                'image'      => $item->product->primaryImage?->image_url,
                'variant_id' => $item->variant_id,
                'variant'    => $item->variant ? $item->variant->name . ': ' . $item->variant->value : null,
                'price'      => $price,
                'quantity'   => $item->quantity,
                'subtotal'   => $price * $item->quantity,
            ];
        })->toArray();
    }

    private function calcTotal($items): float
    {
        return $items->sum(
            fn($item) => $this->unitPrice($item->product, $item->variant) * $item->quantity
        );
    }
}
