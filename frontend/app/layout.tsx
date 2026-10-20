import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nông Sản Việt - Nông Sản Hữu Cơ Tươi Sạch Tận Vườn',
    template: '%s | Nông Sản Việt',
  },
  description: 'Chuyên cung cấp nông sản sạch, rau củ quả VietGAP, gạo sạch, trái cây đặc sản nguồn gốc rõ ràng, giao hàng nhanh trong 2h.',
  keywords: ['nông sản sạch', 'rau củ hữu cơ', 'VietGAP', 'trái cây đặc sản', 'gạo sạch', 'giao hàng 2h'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'Nông Sản Việt',
    title: 'Nông Sản Việt - Nông Sản Hữu Cơ Tươi Sạch Tận Vườn',
    description: 'Nông sản hữu cơ chuẩn VietGAP, giao lạnh trong 2h. Nguồn gốc rõ ràng, tươi sạch tận vườn.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Nông Sản Việt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nông Sản Việt - Nông sản sạch tận vườn',
    description: 'Nông sản hữu cơ chuẩn VietGAP, giao lạnh trong 2h.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Nông Sản Việt',
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.svg`,
  description: 'Nông sản hữu cơ chuẩn VietGAP, giao hàng nhanh trong 2h.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84-1900-6868',
    contactType: 'customer service',
    areaServed: 'VN',
    availableLanguage: 'Vietnamese',
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main style={{ flex: 1 }}>{children}</main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
