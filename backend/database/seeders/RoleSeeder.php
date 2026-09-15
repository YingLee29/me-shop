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
            // Products
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            // Orders
            'orders.view',
            'orders.update-status',
            // Users
            'users.view',
            'users.manage',
            // Settings
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Tạo roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $admin      = Role::firstOrCreate(['name' => 'admin']);
        $staff      = Role::firstOrCreate(['name' => 'staff']);
        Role::firstOrCreate(['name' => 'customer']);

        // Gán permissions
        $superAdmin->syncPermissions(Permission::all());

        $admin->syncPermissions([
            'products.view', 'products.create', 'products.update', 'products.delete',
            'orders.view', 'orders.update-status',
            'users.view',
        ]);

        $staff->syncPermissions([
            'products.view',
            'orders.view', 'orders.update-status',
        ]);

        $this->command->info('✅ Roles & Permissions đã được tạo.');
    }
}
