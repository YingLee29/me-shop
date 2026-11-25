<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder dùng cho production:
 * - roles/permissions
 * - catalog 35 sản phẩm
 * - 1 tài khoản super-admin (email/mật khẩu lấy từ env)
 *
 * Không tạo dữ liệu demo (khách hàng mẫu, sản phẩm cũ...).
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ProductCatalogSeeder::class,
        ]);

        $email    = env('ADMIN_EMAIL', 'admin@mocson.vn');
        $password = env('ADMIN_PASSWORD', 'Admin@123456');

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make($password),
                'phone'    => '0901234567',
                'address'  => 'TP. Hồ Chí Minh',
            ]
        );

        $admin->assignRole('super-admin');

        $this->command->info("👤 Admin: {$email}");
    }
}
