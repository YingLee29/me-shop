<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles trước để có thể gán quyền cho tài khoản mẫu
        $this->call(RoleSeeder::class);

        // Tạo tài khoản Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@nongsan.vn'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('Admin@123456'),
                'phone'    => '0901234567',
                'address'  => 'TP. Hồ Chí Minh',
            ]
        );
        $admin->assignRole('super-admin');

        // Tạo tài khoản Customer mẫu
        $customer = User::firstOrCreate(
            ['email' => 'khach@example.com'],
            [
                'name'     => 'Nguyễn Văn A',
                'password' => Hash::make('password'),
                'phone'    => '0909876543',
                'address'  => '123 Nguyễn Trãi, Q.5, TP.HCM',
            ]
        );
        $customer->assignRole('customer');

        // Dữ liệu mẫu phụ thuộc vào tài khoản ở trên
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            FlashSaleSeeder::class,
            CouponSeeder::class,
            BlogSeeder::class,
            ReviewSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('🌾 ====== SEED HOÀN TẤT ======');
        $this->command->info('👤 Admin: admin@nongsan.vn / Admin@123456');
        $this->command->info('👤 Customer: khach@example.com / password');
        $this->command->info('================================');
    }
}
