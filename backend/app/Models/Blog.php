<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Blog extends Model
{
    protected $fillable = [
        'blog_category_id', 'user_id', 'title', 'slug', 'excerpt', 'content',
        'thumbnail', 'is_published', 'published_at', 'view_count',
        'meta_title', 'meta_description',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'view_count'   => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (Blog $blog) {
            if (!$blog->slug) {
                $blog->slug = Str::slug($blog->title);
            }

            if ($blog->is_published && !$blog->published_at) {
                $blog->published_at = now();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
