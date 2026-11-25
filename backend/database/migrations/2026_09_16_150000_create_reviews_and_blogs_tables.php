<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Reviews Table ──
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->tinyInteger('rating')->default(5); // 1 - 5 stars
            $table->text('comment')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'is_approved']);
            $table->index(['user_id', 'product_id']);
        });

        // Add avg_rating and review_count to products table if not present
        if (!Schema::hasColumn('products', 'avg_rating')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('avg_rating', 3, 2)->default(5.00)->after('price');
                $table->integer('review_count')->default(0)->after('avg_rating');
            });
        }

        // ── Blog Categories ──
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // ── Blogs / Articles ──
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->string('thumbnail')->nullable();
            $table->boolean('is_published')->default(true);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_published', 'published_at']);
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('reviews');

        if (Schema::hasColumn('products', 'avg_rating')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn(['avg_rating', 'review_count']);
            });
        }
    }
};
