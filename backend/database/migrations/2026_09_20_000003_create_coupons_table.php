<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['percent', 'fixed', 'freeship'])->default('percent');
            $table->decimal('value', 12, 0)->default(0); // percent: %, fixed: VNĐ
            $table->decimal('min_order_amount', 12, 0)->default(0);
            $table->decimal('max_discount', 12, 0)->nullable(); // chỉ áp dụng cho percent
            $table->unsignedInteger('usage_limit')->nullable();  // null = không giới hạn
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('user_limit')->nullable()->default(1); // null = không giới hạn
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'expired_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
