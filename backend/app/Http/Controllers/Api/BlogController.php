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
     * Danh mục bài viết
     * GET /api/v1/blog-categories
     */
    public function categories(): JsonResponse
    {
        $categories = BlogCategory::withCount(['blogs' => function ($q) {
            $q->published();
        }])->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Danh sách bài viết tin tức & cẩm nang
     * GET /api/v1/blogs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with(['category:id,name,slug', 'author:id,name'])
            ->published()
            ->latest('published_at');

        if ($request->filled('category')) {
            $catSlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        $blogs = $query->paginate(9);

        return response()->json($blogs);
    }

    /**
     * Chi tiết bài viết
     * GET /api/v1/blogs/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $blog = Blog::with(['category:id,name,slug', 'author:id,name'])
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        // Tăng lượt xem
        $blog->increment('views_count');

        // Bài viết liên quan
        $related = Blog::published()
            ->where('id', '!=', $blog->id)
            ->where('category_id', $blog->category_id)
            ->take(3)
            ->get();

        return response()->json([
            'data'    => $blog,
            'related' => $related,
        ]);
    }
}
