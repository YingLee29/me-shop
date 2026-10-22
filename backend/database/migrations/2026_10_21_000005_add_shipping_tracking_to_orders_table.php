<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_provider')->nullable()->after('shipping_ward');
            $table->string('tracking_code')->nullable()->unique()->after('shipping_provider');
            $table->string('shipping_status')->nullable()->after('tracking_code');
            $table->timestamp('shipping_estimated_at')->nullable()->after('shipping_status');
        });

        Schema::create('shipment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('ghn');
            $table->string('tracking_code')->nullable();
            $table->string('event_id')->nullable();
            $table->string('status');
            $table->string('description')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'occurred_at']);
            $table->unique(['provider', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_events');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['tracking_code']);
            $table->dropColumn(['shipping_provider', 'tracking_code', 'shipping_status', 'shipping_estimated_at']);
        });
    }
};
