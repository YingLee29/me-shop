-- MySQL init script – tạo thêm database test nếu cần
-- Database chính đã được tạo qua MYSQL_DATABASE trong docker-compose

CREATE DATABASE IF NOT EXISTS `nongsan_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `nongsan_test`.* TO 'nongsan_user'@'%';
FLUSH PRIVILEGES;
