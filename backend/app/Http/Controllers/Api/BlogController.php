<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Danh sách bài viết đã xuất bản.
     * GET /api/v1/blogs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with(['category:id,name,slug', 'author:id,name'])
            ->where('is_published', true)
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('excerpt', 'LIKE', "%{$search}%");
            });
        }

        $blogs = $query->paginate(min((int) $request->input('per_page', 9), 30));

        return response()->json([
            'data' => $blogs->getCollection()->map(fn(Blog $blog) => $this->formatCard($blog)),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page'    => $blogs->lastPage(),
                'total'        => $blogs->total(),
            ],
        ]);
    }

    /**
     * Danh mục bài viết.
     * GET /api/v1/blogs/categories
     */
    public function categories(): JsonResponse
    {
        $categories = BlogCategory::where('is_active', true)
            ->withCount(['blogs' => fn($q) => $q->where('is_published', true)])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Chi tiết bài viết theo slug.
     * GET /api/v1/blogs/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $blog = Blog::with(['category:id,name,slug', 'author:id,name'])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $blog->incrementQuietly('view_count');

        $related = Blog::with('category:id,name,slug')
            ->where('is_published', true)
            ->where('id', '!=', $blog->id)
            ->when($blog->blog_category_id, fn($q) => $q->where('blog_category_id', $blog->blog_category_id))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn(Blog $item) => $this->formatCard($item));

        return response()->json([
            'data' => [
                ...$this->formatCard($blog),
                'content'         => $blog->content,
                'meta_title'      => $blog->meta_title,
                'meta_description' => $blog->meta_description,
                'view_count'      => $blog->view_count + 1,
                'updated_at'      => $blog->updated_at?->toDateString(),
            ],
            'related' => $related,
        ]);
    }

    private function formatCard(Blog $blog): array
    {
        return [
            'id'         => $blog->id,
            'title'      => $blog->title,
            'slug'       => $blog->slug,
            'excerpt'    => $blog->excerpt,
            'thumbnail'  => $blog->thumbnail,
            'category'   => $blog->category ? [
                'name' => $blog->category->name,
                'slug' => $blog->category->slug,
            ] : null,
            'author'     => $blog->author?->name,
            'published_at' => $blog->published_at?->toDateString(),
            'view_count' => $blog->view_count,
        ];
    }
}
