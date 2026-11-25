<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'summary',
        'content',
        'thumbnail',
        'is_published',
        'views_count',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'views_count'  => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }
}
