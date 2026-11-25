<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * Danh sách bài viết Admin
     * GET /api/v1/admin/blogs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with(['category:id,name', 'author:id,name'])->latest();

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        $blogs = $query->paginate(15);

        return response()->json($blogs);
    }

    /**
     * Tạo bài viết mới
     * POST /api/v1/admin/blogs
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id'  => ['nullable', 'exists:blog_categories,id'],
            'title'        => ['required', 'string', 'max:255'],
            'summary'      => ['nullable', 'string', 'max:500'],
            'content'      => ['required', 'string'],
            'thumbnail'    => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);

        $data['author_id']    = $request->user()?->id;
        $data['slug']         = Str::slug($data['title']) . '-' . time();
        $data['published_at'] = ($data['is_published'] ?? true) ? now() : null;

        $blog = Blog::create($data);

        return response()->json([
            'message' => 'Tạo bài viết thành công!',
            'data'    => $blog,
        ], 201);
    }

    /**
     * Chi tiết bài viết
     * GET /api/v1/admin/blogs/{id}
     */
    public function show(int $id): JsonResponse
    {
        $blog = Blog::with(['category', 'author'])->findOrFail($id);

        return response()->json(['data' => $blog]);
    }

    /**
     * Cập nhật bài viết
     * PUT /api/v1/admin/blogs/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $blog = Blog::findOrFail($id);

        $data = $request->validate([
            'category_id'  => ['nullable', 'exists:blog_categories,id'],
            'title'        => ['required', 'string', 'max:255'],
            'summary'      => ['nullable', 'string', 'max:500'],
            'content'      => ['required', 'string'],
            'thumbnail'    => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);

        if ($data['title'] !== $blog->title) {
            $data['slug'] = Str::slug($data['title']) . '-' . time();
        }

        if (($data['is_published'] ?? false) && !$blog->published_at) {
            $data['published_at'] = now();
        }

        $blog->update($data);

        return response()->json([
            'message' => 'Cập nhật bài viết thành công!',
            'data'    => $blog,
        ]);
    }

    /**
     * Xóa bài viết
     * DELETE /api/v1/admin/blogs/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();

        return response()->json(['message' => 'Đã xóa bài viết.']);
    }
}
