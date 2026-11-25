/** @type {import('next').NextConfig} */
const nextConfig = {
  // Đóng gói server tối giản (chỉ node_modules cần thiết) → image nhỏ, ít RAM
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: false, // nginx đã gzip
};

module.exports = nextConfig;
