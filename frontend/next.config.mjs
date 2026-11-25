import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Ảnh sản phẩm chủ yếu là SVG/ảnh đã tối ưu; tắt optimizer để nhẹ RAM,
    // không cần native `sharp` trong image Docker ARM64.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'nginx' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: `${process.env.INTERNAL_STORAGE_URL || 'http://nginx'}/storage/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
