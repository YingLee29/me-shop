<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            // Snapshot thông tin sản phẩm tại thời điểm đặt hàng
            $table->string('product_name');
            $table->string('variant_name')->nullable();   // VD: "1kg"
            $table->string('product_sku')->nullable();
            $table->string('product_image')->nullable();
            $table->decimal('price', 12, 0);              // Giá tại thời điểm đặt
            $table->unsignedInteger('quantity');
            $table->decimal('subtotal', 12, 0);           // price * quantity
            $table->boolean('is_reviewed')->default(false);
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
