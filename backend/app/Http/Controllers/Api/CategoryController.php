<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Danh sách danh mục dạng tree
     * GET /api/v1/categories
     */
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories.tree', 3600, function () {
            return Category::tree();
        });

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Chi tiết danh mục theo slug
     * GET /api/v1/categories/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->active()->firstOrFail();

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }
}
