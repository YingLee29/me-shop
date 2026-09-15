<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_code')->unique();   // NS + timestamp + random
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'shipping',
                'delivered',
                'completed',
                'cancelled',
                'refunded',
            ])->default('pending');
            $table->enum('payment_method', ['cod', 'momo', 'vnpay', 'bank_transfer'])->default('cod');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            // Địa chỉ giao hàng (snapshot tại thời điểm đặt hàng)
            $table->string('shipping_name');
            $table->string('shipping_phone');
            $table->string('shipping_email')->nullable();
            $table->string('shipping_province')->nullable();
            $table->string('shipping_district')->nullable();
            $table->string('shipping_ward')->nullable();
            $table->string('shipping_address');
            // Tiền
            $table->decimal('subtotal', 12, 0);       // Tổng sản phẩm
            $table->decimal('shipping_fee', 12, 0)->default(0);
            $table->decimal('discount_amount', 12, 0)->default(0);
            $table->decimal('total', 12, 0);           // Tổng thanh toán
            $table->string('coupon_code')->nullable();
            $table->text('note')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('order_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
