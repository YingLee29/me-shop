<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Tạo permissions
        $permissions = [
            // Sản phẩm & kho
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'categories.view',
            'categories.manage',
            'inventory.view',
            'inventory.update',
            // Đơn hàng
            'orders.view',
            'orders.update-status',
            // Khuyến mãi
            'coupons.view',
            'coupons.manage',
            'flash-sales.view',
            'flash-sales.manage',
            // Người dùng & phân quyền
            'users.view',
            'users.manage',
            'roles.manage',
            // Báo cáo & cài đặt
            'reviews.view',
            'reviews.manage',
            'blogs.view',
            'blogs.manage',
            'reports.view',
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Tạo roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $admin      = Role::firstOrCreate(['name' => 'admin']);
        $warehouse  = Role::firstOrCreate(['name' => 'warehouse']);
        $support    = Role::firstOrCreate(['name' => 'support']);
        $staff      = Role::firstOrCreate(['name' => 'staff']);
        Role::firstOrCreate(['name' => 'customer']);

        // Gán permissions
        $superAdmin->syncPermissions(Permission::all());

        $admin->syncPermissions([
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view', 'categories.manage',
            'inventory.view', 'inventory.update',
            'orders.view', 'orders.update-status',
            'coupons.view', 'coupons.manage',
            'flash-sales.view', 'flash-sales.manage',
            'reviews.view', 'reviews.manage',
            'blogs.view', 'blogs.manage',
            'users.view', 'users.manage',
            'reports.view', 'settings.manage',
        ]);

        // Thủ kho: xem/sửa sản phẩm & tồn kho, xem đơn hàng
        $warehouse->syncPermissions([
            'products.view', 'products.update',
            'categories.view',
            'inventory.view', 'inventory.update',
            'orders.view',
            'flash-sales.view',
        ]);

        // CSKH: xem & cập nhật trạng thái đơn hàng, xem khách hàng
        $support->syncPermissions([
            'products.view',
            'orders.view', 'orders.update-status',
            'reviews.view',
            'users.view',
        ]);

        // Vai trò cũ (tương thích) – quyền tương đương CSKH
        $staff->syncPermissions([
            'products.view',
            'orders.view', 'orders.update-status',
        ]);

        $this->command->info('✅ Roles & Permissions đã được tạo.');
    }
}
