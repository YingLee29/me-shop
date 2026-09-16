import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import AdminLayoutWrapper from '../components/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'Quản Trị Hệ Thống - Nông Sản Việt',
  description: 'Trang quản trị bán hàng nông sản sạch',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AdminAuthProvider>
          <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
