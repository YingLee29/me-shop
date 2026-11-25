/** @type {import('next').NextConfig} */
const nextConfig = {
  // Đóng gói server tối giản cho Docker production
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: false, // nginx đã gzip
};

export default nextConfig;
