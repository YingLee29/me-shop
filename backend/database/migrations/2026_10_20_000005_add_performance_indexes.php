<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_active', 'created_at'], 'products_active_created_at_index');
            $table->index('sold_count', 'products_sold_count_index');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->index(['is_active', 'sort_order'], 'banners_active_sort_index');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_active_created_at_index');
            $table->dropIndex('products_sold_count_index');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('banners_active_sort_index');
        });
    }
};
