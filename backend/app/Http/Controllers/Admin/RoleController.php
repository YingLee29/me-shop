<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    /** GET /api/v1/admin/roles */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions:id,name')
            ->orderByRaw("FIELD(name, 'super-admin', 'admin', 'warehouse', 'support', 'staff', 'customer')")
            ->get()
            ->map(fn(Role $role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->pluck('name')->values(),
                'user_count'  => DB::table('model_has_roles')->where('role_id', $role->id)->count(),
            ]);

        return response()->json(['data' => $roles]);
    }

    /** GET /api/v1/admin/permissions */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('name')->pluck('name')->values();

        return response()->json([
            'data' => $permissions,
            'groups' => $permissions
                ->groupBy(fn(string $name) => explode('.', $name)[0])
                ->map(fn($items) => $items->values()),
        ]);
    }

    /** PUT /api/v1/admin/roles/{role} */
    public function update(Request $request, Role $role): JsonResponse
    {
        if ($role->name === 'super-admin') {
            return response()->json([
                'message' => 'Không thể chỉnh sửa quyền của Super Admin.',
            ], 422);
        }

        $data = $request->validate([
            'permissions'   => ['present', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->syncPermissions($data['permissions']);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'message' => 'Cập nhật quyền cho vai trò ' . $role->name . ' thành công.',
            'data'    => [
                'name'        => $role->name,
                'permissions' => $role->permissions()->pluck('name')->values(),
            ],
        ]);
    }
}
