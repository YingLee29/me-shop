<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Danh sách danh mục (admin – dạng phẳng kèm số sản phẩm)
     * GET /api/v1/admin/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->with('parent:id,name')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Tạo danh mục
     * POST /api/v1/admin/categories
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validateCategory($request);
        $data['slug'] = $this->uniqueSlug($data['name'], $data['slug'] ?? null);

        $category = Category::create($data);
        $this->clearCache();

        return response()->json([
            'message' => 'Danh mục đã được tạo.',
            'data'    => $category,
        ], 201);
    }

    /**
     * Cập nhật danh mục
     * POST /api/v1/admin/categories/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $data = $this->validateCategory($request, $category->id);

        if (!empty($data['parent_id']) && (int) $data['parent_id'] === $category->id) {
            throw ValidationException::withMessages([
                'parent_id' => 'Danh mục không thể là danh mục cha của chính nó.',
            ]);
        }

        if (!empty($data['parent_id']) && $this->isDescendant($category->id, (int) $data['parent_id'])) {
            throw ValidationException::withMessages([
                'parent_id' => 'Không thể chọn danh mục con làm danh mục cha.',
            ]);
        }

        if (!empty($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $data['slug'] ?? null, $category->id);
        }

        $category->update($data);
        $this->clearCache();

        return response()->json([
            'message' => 'Danh mục đã được cập nhật.',
            'data'    => $category->fresh(),
        ]);
    }

    /**
     * Xóa danh mục
     * DELETE /api/v1/admin/categories/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount(['products', 'children'])->findOrFail($id);

        if ($category->products_count > 0) {
            throw ValidationException::withMessages([
                'category' => 'Danh mục còn sản phẩm, vui lòng chuyển sản phẩm trước khi xóa.',
            ]);
        }

        if ($category->children_count > 0) {
            throw ValidationException::withMessages([
                'category' => 'Danh mục còn danh mục con, vui lòng xóa hoặc chuyển danh mục con trước.',
            ]);
        }

        $category->delete();
        $this->clearCache();

        return response()->json(['message' => 'Danh mục đã bị xóa.']);
    }

    // ── Helpers ───────────────────────────────────────────

    private function validateCategory(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'parent_id'   => ['nullable', 'integer', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255'],
            'icon'        => ['nullable', 'string', 'max:20'],
            'image'       => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
            'is_active'   => ['boolean'],
        ]);
    }

    private function uniqueSlug(string $name, ?string $slug = null, ?int $ignoreId = null): string
    {
        $base = $slug ? Str::slug($slug) : Str::slug($name);
        $slug = $base;
        $i = 1;

        while (
            Category::where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function isDescendant(int $categoryId, int $candidateParentId): bool
    {
        $current = Category::find($candidateParentId);

        while ($current) {
            if ($current->parent_id === $categoryId) {
                return true;
            }
            $current = $current->parent_id ? Category::find($current->parent_id) : null;
        }

        return false;
    }

    private function clearCache(): void
    {
        Cache::forget('categories.tree');
        Cache::forget('categories.featured');
    }
}
