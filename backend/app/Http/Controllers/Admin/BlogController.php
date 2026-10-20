<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BlogController extends Controller
{
    /**
     * GET /api/v1/admin/blogs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with(['category:id,name,slug', 'author:id,name'])->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('title', 'LIKE', "%{$search}%")->orWhere('slug', 'LIKE', "%{$search}%"));
        }

        if ($request->filled('status')) {
            $query->where('is_published', $request->status === 'published');
        }

        if ($request->filled('category_id')) {
            $query->where('blog_category_id', $request->category_id);
        }

        $blogs = $query->paginate(15);

        return response()->json([
            'data' => $blogs->getCollection(),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page'    => $blogs->lastPage(),
                'total'        => $blogs->total(),
            ],
        ]);
    }

    /** GET /api/v1/admin/blogs/{id} */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'data' => Blog::with(['category:id,name,slug', 'author:id,name'])->findOrFail($id),
        ]);
    }

    /** POST /api/v1/admin/blogs */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateBlog($request);
        $data['user_id'] = $request->user()->id;
        $data['slug'] = $this->uniqueSlug($data['title'], $data['slug'] ?? null);
        $data['excerpt'] = ($data['excerpt'] ?? null) ?: Str::limit(strip_tags($data['content']), 180);
        if (!empty($data['is_published']) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $blog = Blog::create($data);

        return response()->json([
            'message' => 'Bài viết đã được tạo.',
            'data'    => $blog->load('category:id,name,slug'),
        ], 201);
    }

    /** POST /api/v1/admin/blogs/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $blog = Blog::findOrFail($id);
        $data = $this->validateBlog($request);
        $data['slug'] = $this->uniqueSlug($data['title'], $data['slug'] ?? null, $blog->id);
        $data['excerpt'] = ($data['excerpt'] ?? null) ?: Str::limit(strip_tags($data['content']), 180);

        if (!empty($data['is_published']) && !$blog->published_at && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $blog->update($data);

        return response()->json([
            'message' => 'Bài viết đã được cập nhật.',
            'data'    => $blog->fresh(['category:id,name,slug']),
        ]);
    }

    /** DELETE /api/v1/admin/blogs/{id} */
    public function destroy(int $id): JsonResponse
    {
        Blog::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xóa bài viết.']);
    }

    /**
     * GET /api/v1/admin/blog-categories
     */
    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => BlogCategory::withCount('blogs')->orderBy('sort_order')->get(),
        ]);
    }

    /** POST /api/v1/admin/blog-categories */
    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
            'is_active'   => ['boolean'],
        ]);

        $data['slug'] = $this->uniqueCategorySlug($data['name']);
        $category = BlogCategory::create($data);

        return response()->json(['message' => 'Đã tạo danh mục bài viết.', 'data' => $category], 201);
    }

    /** POST /api/v1/admin/blog-categories/{id} */
    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
            'is_active'   => ['boolean'],
        ]);

        if ($data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueCategorySlug($data['name'], $category->id);
        }

        $category->update($data);

        return response()->json(['message' => 'Đã cập nhật danh mục bài viết.', 'data' => $category]);
    }

    /** DELETE /api/v1/admin/blog-categories/{id} */
    public function destroyCategory(int $id): JsonResponse
    {
        $category = BlogCategory::withCount('blogs')->findOrFail($id);

        if ($category->blogs_count > 0) {
            throw ValidationException::withMessages([
                'category' => 'Danh mục còn bài viết, không thể xóa.',
            ]);
        }

        $category->delete();
        return response()->json(['message' => 'Đã xóa danh mục bài viết.']);
    }

    // ── Helpers ───────────────────────────────────────────

    private function validateBlog(Request $request): array
    {
        return $request->validate([
            'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'title'            => ['required', 'string', 'max:255'],
            'slug'             => ['nullable', 'string', 'max:255'],
            'excerpt'          => ['nullable', 'string', 'max:500'],
            'content'          => ['required', 'string'],
            'thumbnail'        => ['nullable', 'string', 'max:1000'],
            'is_published'     => ['boolean'],
            'published_at'     => ['nullable', 'date'],
            'meta_title'       => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function uniqueSlug(string $title, ?string $slug = null, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $title);
        $slug = $base;
        $i = 1;

        while (Blog::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function uniqueCategorySlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (BlogCategory::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
