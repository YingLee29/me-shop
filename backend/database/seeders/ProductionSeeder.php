<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeder dùng cho production:
 * - roles/permissions
 * - danh mục + sản phẩm MocSon + flash sale/coupon/blog/review
 * - 1 tài khoản super-admin (email/mật khẩu lấy từ env)
 *
 * Không tạo khách demo có mật khẩu mặc định.
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

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

        // ReviewSeeder tra cứu user này để tạo đơn/review mẫu.
        // Mật khẩu ngẫu nhiên → không thể đăng nhập bằng mật khẩu mặc định.
        User::firstOrCreate(
            ['email' => 'khach@example.com'],
            [
                'name'     => 'Khách hàng mẫu',
                'password' => Hash::make(Str::random(40)),
                'phone'    => '0909876543',
                'address'  => 'TP. Hồ Chí Minh',
            ]
        );

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            FlashSaleSeeder::class,
            CouponSeeder::class,
            BlogSeeder::class,
            ReviewSeeder::class,
        ]);

        $this->command->info("👤 Admin: {$email}");
    }
}
