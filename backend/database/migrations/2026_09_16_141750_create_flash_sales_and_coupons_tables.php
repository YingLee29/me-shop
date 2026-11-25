<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ── Flash Sales ──
        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('banner_url')->nullable();
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Flash Sale Products ──
        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('flash_sale_price', 12, 0);
            $table->integer('limit_quantity')->default(100);
            $table->integer('sold_quantity')->default(0);
            $table->timestamps();

            $table->unique(['flash_sale_id', 'product_id']);
        });

        // ── Coupons ──
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['percent', 'fixed', 'freeship'])->default('fixed');
            $table->decimal('value', 12, 0); // e.g. 10 (%) or 20000 (VND)
            $table->decimal('min_order_amount', 12, 0)->default(0);
            $table->decimal('max_discount_amount', 12, 0)->nullable(); // limit for % discount
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('start_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Coupon Usages ──
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->decimal('discount_amount', 12, 0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('flash_sale_products');
        Schema::dropIfExists('flash_sales');
    }
};
