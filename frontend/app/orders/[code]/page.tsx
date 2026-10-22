import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Truck, Package, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchApi, formatPrice } from '../../../lib/api';
import PaymentButton from './PaymentButton';

async function getOrder(code: string) {
  try {
    const res = await fetchApi(`/orders/${code}`);
    return res?.data || null;
  } catch (e) {
    console.error('Failed to get order:', e);
    return null;
  }
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams?: { payment?: string; status?: string };
}) {
  const order = await getOrder(params.code);

  if (!order) {
    notFound();
  }

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Chờ xác nhận', color: '#ED6C02', bg: '#FFF4E5' },
    confirmed: { label: 'Đã xác nhận', color: '#0288D1', bg: '#E1F5FE' },
    preparing: { label: 'Đang chuẩn bị hàng', color: '#7B1FA2', bg: '#F3E5F5' },
    shipping: { label: 'Đang vận chuyển', color: '#1976D2', bg: '#E3F2FD' },
    delivered: { label: 'Đã giao hàng', color: '#00897B', bg: '#E0F2F1' },
    completed: { label: 'Đã hoàn thành', color: '#2E7D32', bg: '#E8F5E9' },
    cancelled: { label: 'Đã hủy', color: '#D32F2F', bg: '#FFEBEE' },
    refunded: { label: 'Đã hoàn tiền', color: '#6B4226', bg: '#FAF7F0' },
  };

  const currentStatus = statusMap[order.status] || { label: order.status, color: '#6B4226', bg: '#FAF7F0' };
  const paymentLabels: Record<string, string> = {
    cod: '💵 Tiền mặt khi nhận hàng (COD)',
    bank_transfer: '🏦 Chuyển khoản ngân hàng',
    momo: '📱 Ví điện tử MoMo',
    vnpay: '💳 VNPAY – Thẻ ATM / QR Code',
  };
  const onlineUnpaid = order.payment_status !== 'paid' && ['momo', 'vnpay'].includes(order.payment_method);
  const trackingEvents = [...(order.tracking_events || [])].reverse();

  return (
    <div style={{ padding: '50px 0 90px 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Success Header */}
        <div style={{
          background: '#FFF',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-green-light)',
            color: 'var(--color-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle2 size={44} />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '8px' }}>
            Đặt Hàng Thành Công!
          </h1>
          <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem', marginBottom: '16px' }}>
            Cảm ơn bạn đã tin dùng nông sản tươi sạch từ Nông Sản Việt. Đơn hàng của bạn đang được nhân viên chuẩn bị.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--color-cream)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-mid)' }}>Mã đơn hàng:</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--color-brown)' }}>{order.order_code}</strong>
          </div>
        </div>

        {searchParams?.status === 'success' && order.payment_status === 'paid' && (
          <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} /> Thanh toán thành công. Đơn hàng đã được ghi nhận!
          </div>
        )}
        {searchParams?.status === 'failed' && (
          <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: 600 }}>
            Giao dịch chưa hoàn tất. Bạn có thể thử thanh toán lại bên dưới.
          </div>
        )}
        {searchParams?.payment === 'unavailable' && (
          <div style={{ background: '#FFF4E5', border: '1px solid #FFCC80', color: '#ED6C02', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: 600 }}>
            Cổng thanh toán online đang ở chế độ minh hoạ. Đơn hàng đã được tạo – vui lòng thanh toán khi nhận hàng hoặc liên hệ hotline 1900 6868.
          </div>
        )}

        {/* Order Details & Tracking */}
        <div style={{
          background: '#FFF',
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Status badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-gray-light)',
            paddingBottom: '20px',
            marginBottom: '24px',
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)', textTransform: 'uppercase', fontWeight: 700 }}>Trạng thái đơn hàng</div>
              <div style={{
                display: 'inline-block',
                marginTop: '6px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: currentStatus.color,
                background: currentStatus.bg,
              }}>
                ● {currentStatus.label}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>Ngày đặt hàng</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>
                {order.created_at || 'Hôm nay'}
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div style={{
            background: 'var(--color-cream)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '8px' }}>
                Người Nhận Hàng
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-dark)', fontSize: '0.95rem' }}>{order.shipping_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)', marginTop: '4px' }}>
                SĐT: {order.shipping_phone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '8px' }}>
                Địa Chỉ Giao Hàng
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-dark)', lineHeight: 1.5 }}>
                {order.shipping_address}
              </div>
              {order.note && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)', marginTop: '6px' }}>
                  Ghi chú: {order.note}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-brown)', marginBottom: '8px' }}>
                Thanh Toán
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-brown-dark)', fontSize: '0.9rem' }}>
                {paymentLabels[order.payment_method] || order.payment_method}
              </div>
              <div style={{ fontSize: '0.8rem', color: order.payment_status === 'paid' ? 'var(--color-green)' : 'var(--color-amber)', marginTop: '4px', fontWeight: 600 }}>
                {order.payment_status === 'paid' ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
              </div>
            </div>
          </div>

          {order.payment_method === 'bank_transfer' && order.payment_status !== 'paid' && (
            <div style={{ background: '#F3F8FF', border: '1px solid #BBDEFB', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: '26px' }}>
              <div style={{ fontWeight: 800, color: '#0D47A1', marginBottom: '8px' }}>Thông tin chuyển khoản</div>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--color-gray-dark)' }}>
                Ngân hàng: <strong>Vietcombank – CN TP.HCM</strong><br />
                Số tài khoản: <strong>0071001234567</strong><br />
                Chủ tài khoản: <strong>CÔNG TY NÔNG SẢN VIỆT</strong><br />
                Số tiền: <strong style={{ color: 'var(--color-red)' }}>{formatPrice(order.total)}</strong><br />
                Nội dung: <strong>{order.order_code}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-mid)', marginTop: '8px' }}>
                Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.
              </div>
            </div>
          )}

          {onlineUnpaid && (
            <div style={{ background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--color-gray-dark)' }}>
                Đơn hàng chưa được thanh toán qua {order.payment_method === 'momo' ? 'MoMo' : 'VNPAY'}.
              </div>
              <PaymentButton orderCode={order.order_code} provider={order.payment_method} />
            </div>
          )}

          {/* Shipment tracking */}
          {order.tracking_code && (
            <div style={{
              background: '#F3F8FF',
              border: '1px solid #BBDEFB',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '28px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0D47A1', marginBottom: '6px' }}>
                    <Truck size={20} /> Theo Dõi Vận Chuyển GHN
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
                    Mã vận đơn: <strong style={{ color: 'var(--color-brown-dark)' }}>{order.tracking_code}</strong>
                  </div>
                  {order.shipping_estimated_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)', marginTop: '3px' }}>
                      Dự kiến giao: {order.shipping_estimated_at}
                    </div>
                  )}
                </div>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: '#E3F2FD',
                  color: '#1565C0',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}>
                  {order.shipping_status_label || order.shipping_status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {(trackingEvents || []).map((event: any, index: number) => (
                  <div key={event.id || index} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: index === 0 ? '#1976D2' : '#90CAF9',
                        marginTop: '5px',
                        flexShrink: 0,
                      }} />
                      {index < trackingEvents.length - 1 && (
                        <span style={{ width: 2, flex: 1, minHeight: 18, background: '#BBDEFB' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: '14px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                        {event.description || event.status}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-gray-mid)', marginTop: '2px' }}>
                        {event.occurred_at ? new Date(event.occurred_at.replace(' ', 'T')).toLocaleString('vi-VN') : ''}
                      </div>
                    </div>
                  </div>
                ))}
                {trackingEvents.length === 0 && (
                  <div style={{ fontSize: '0.86rem', color: 'var(--color-gray-mid)' }}>
                    Chưa có cập nhật vận chuyển.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items Purchased */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brown-dark)', marginBottom: '16px' }}>
            Danh Sách Sản Phẩm
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {order.items?.map((item: any) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--color-gray-light)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-brown-dark)' }}>
                    {item.product_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-mid)' }}>
                    {formatPrice(item.price)} x {item.quantity} {item.variant_name ? `(${item.variant_name})` : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-dark)' }}>
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            borderTop: '2px solid var(--color-border)',
            paddingTop: '16px',
            fontSize: '0.95rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
              <span>Tạm tính hàng:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-dark)' }}>
              <span>Phí giao hàng:</span>
              <span>{order.shipping_fee == 0 ? <strong style={{ color: 'var(--color-green)' }}>Miễn phí</strong> : formatPrice(order.shipping_fee)}</span>
            </div>
            {order.points_discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-green)' }}>
                <span>Điểm thưởng ({order.points_used} điểm):</span>
                <span>-{formatPrice(order.points_discount)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-red)',
              marginTop: '6px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-gray-light)',
            }}>
              <span>Tổng thanh toán:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '36px', justifyContent: 'center' }}>
            <Link href="/" className="btn-primary" style={{ padding: '12px 28px' }}>
              Tiếp Tục Mua Sắm <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
