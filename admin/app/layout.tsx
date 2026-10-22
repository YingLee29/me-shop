import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import AdminLayoutWrapper from '../components/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'Quản Trị Hệ Thống - MocSon Farm',
  description: 'Trang quản trị đặc sản Nghệ An',
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
