import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export const metadata: Metadata = {
  title: 'Nông Sản Việt - Nông Sản Hữu Cơ Tươi Sạch Tận Vườn',
  description: 'Chuyên cung cấp nông sản sạch, rau củ quả VietGAP, gạo sạch, trái cây đặc sản nguồn gốc rõ ràng, giao hàng nhanh trong 2h.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
