import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactWidget from '../components/ContactWidget';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MocSon Farm - Đặc Sản Nghệ An Từ Tâm',
    template: '%s | MocSon Farm',
  },
  description: 'MocSon Farm cung cấp đặc sản Nghệ An: gừng Kỳ Sơn, tinh bột nghệ, trà Shan Tuyết, mật ong rừng và quà tặng. Nguồn gốc rõ ràng, chế biến thủ công.',
  keywords: ['MocSon Farm', 'đặc sản Nghệ An', 'gừng Kỳ Sơn', 'tinh bột nghệ', 'trà Shan Tuyết', 'mật ong rừng'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'MocSon Farm',
    title: 'MocSon Farm - Đặc Sản Nghệ An Từ Tâm',
    description: 'Gừng Kỳ Sơn, tinh bột nghệ, trà Shan Tuyết, mật ong rừng và quà tặng đặc sản Nghệ An.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'MocSon Farm' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MocSon Farm - Đặc Sản Nghệ An Từ Tâm',
    description: 'Gừng Kỳ Sơn, tinh bột nghệ, trà Shan Tuyết, mật ong rừng và quà tặng đặc sản Nghệ An.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

// Dữ liệu lấy từ API lúc request — build Docker không có DB/API
export const dynamic = 'force-dynamic';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MocSon Farm',
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.svg`,
  description: 'Đặc sản Nghệ An: gừng Kỳ Sơn, tinh bột nghệ, trà Shan Tuyết, mật ong rừng.',
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
              <ContactWidget />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
