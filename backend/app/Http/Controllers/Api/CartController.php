<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Lấy giỏ hàng của user hiện tại
     * GET /api/v1/cart
     */
    public function index(Request $request): JsonResponse
    {
        $items = Cart::with(['product.primaryImage', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'data'  => $this->formatItems($items),
            'total' => $this->calcTotal($items),
        ]);
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
        $variant = $data['variant_id'] ? ProductVariant::find($data['variant_id']) : null;

        // Kiểm tra tồn kho
        $stock = $variant ? $variant->stock : $product->stock_quantity;
        if ($stock < $data['quantity']) {
            return response()->json(['message' => 'Số lượng vượt quá tồn kho.'], 422);
        }

        // Upsert: nếu đã có → cộng thêm quantity
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->where('variant_id', $data['variant_id'] ?? null)
            ->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $data['quantity'];
            if ($newQty > $stock) {
                return response()->json(['message' => 'Tổng số lượng vượt quá tồn kho.'], 422);
            }
            $cartItem->update(['quantity' => $newQty]);
        } else {
            // Tính giá tại thời điểm thêm vào giỏ
            $price = $product->current_price;
            if ($variant && $variant->price_adjust != 0) {
                $price += $variant->price_adjust;
            }

            $cartItem = Cart::create([
                'user_id'    => $request->user()->id,
                'product_id' => $data['product_id'],
                'variant_id' => $data['variant_id'] ?? null,
                'quantity'   => $data['quantity'],
                'price'      => $price,
            ]);
        }

        return response()->json(['message' => 'Đã thêm vào giỏ hàng!', 'item_id' => $cartItem->id], 201);
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

        // Kiểm tra tồn kho
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

    private function formatItems($items): array
    {
        return $items->map(fn($item) => [
            'id'         => $item->id,
            'product_id' => $item->product_id,
            'name'       => $item->product->name,
            'slug'       => $item->product->slug,
            'image'      => $item->product->primaryImage?->image_url,
            'variant_id' => $item->variant_id,
            'variant'    => $item->variant ? $item->variant->name . ': ' . $item->variant->value : null,
            'price'      => (float) $item->price,
            'quantity'   => $item->quantity,
            'subtotal'   => (float) ($item->price * $item->quantity),
        ])->toArray();
    }

    private function calcTotal($items): float
    {
        return $items->sum(fn($item) => $item->price * $item->quantity);
    }
}
