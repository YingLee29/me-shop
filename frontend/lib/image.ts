/**
 * Ảnh upload nội bộ có URL dạng http://localhost/storage/...
 * Next.js image optimizer chạy trong container frontend nên không truy cập
 * được "localhost" của máy host. Các ảnh này cần cho trình duyệt tải trực tiếp.
 */
export function shouldUnoptimizeImage(src?: string | null): boolean {
  if (!src) return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(src);
}
