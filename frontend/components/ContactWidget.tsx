'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Phone, X } from 'lucide-react';

const ZALO_URL = process.env.NEXT_PUBLIC_ZALO_URL || 'https://zalo.me/';
const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/';
const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || '1900 6868';
const HOTLINE_TEL = HOTLINE.replace(/[^\d+]/g, '');

function MessengerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.6 7.2V22l3.3-1.8c.9.2 1.9.4 3.1.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1 12.4-2.5-2.7-4.9 2.7 5.4-5.7 2.6 2.7 4.8-2.7-5.4 5.7z" />
    </svg>
  );
}

export default function ContactWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // Ẩn ở các trang form/thanh toán để không che CTA & input
  const hiddenOn = ['/login', '/register', '/checkout', '/cart', '/payment', '/orders'];
  if (hiddenOn.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <div className={`contact-widget ${open ? 'is-open' : ''}`} ref={rootRef}>
      <div className={`contact-widget__actions ${open ? 'is-open' : ''}`}>
        <a
          className="cw-item cw-item--fb"
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat qua Facebook Messenger"
        >
          <MessengerIcon />
          <span className="cw-label">Messenger</span>
        </a>

        <a className="cw-item cw-item--phone" href={`tel:${HOTLINE_TEL}`} aria-label={`Gọi hotline ${HOTLINE}`}>
          <Phone size={21} />
          <span className="cw-label">Gọi {HOTLINE}</span>
        </a>

        <a
          className="cw-item cw-item--zalo"
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat qua Zalo"
        >
          <span className="cw-item__zalo">Zalo</span>
          <span className="cw-label">Chat Zalo</span>
        </a>
      </div>

      <button
        type="button"
        className={`cw-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Đóng liên hệ' : 'Mở liên hệ'}
        title={open ? 'Đóng' : 'Liên hệ với MocSon Farm'}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && <span className="cw-ping" aria-hidden="true" />}
        {!open && <span className="cw-toggle-label">Liên hệ</span>}
      </button>
    </div>
  );
}
