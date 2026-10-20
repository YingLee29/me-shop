'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ProductCard, { Product } from './ProductCard';

interface FlashSaleSectionProps {
  products: Product[];
  endsAt?: string | null;
  saleName?: string | null;
}

function breakdown(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function FlashSaleSection({ products, endsAt, saleName }: FlashSaleSectionProps) {
  const target = useMemo(() => (endsAt ? new Date(endsAt).getTime() : null), [endsAt]);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (products.length === 0) return null;

  const remaining = target ? target - now : 0;
  const time = breakdown(remaining);
  const isOver = target !== null && remaining <= 0;

  return (
    <section style={{ padding: '60px 0', background: 'linear-gradient(180deg, #FAF7F0 0%, #F5EDD6 100%)' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'linear-gradient(135deg, #FF4D4D 0%, #D32F2F 100%)',
              color: '#FFF',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              ⚡ GIỜ VÀNG GIÁ SỐC
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-brown-dark)', margin: 0 }}>
              {saleName || 'Flash Sale Hôm Nay'}
            </h2>
          </div>

          {target !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brown)' }}>
                {isOver ? 'Đã kết thúc' : 'Kết thúc sau:'}
              </span>
              {!isOver && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { value: time.days, label: 'NGÀY' },
                    { value: time.hours, label: 'GIỜ' },
                    { value: time.minutes, label: 'PHÚT' },
                    { value: time.seconds, label: 'GIÂY' },
                  ].map((unit) => (
                    <div key={unit.label} style={{
                      minWidth: '46px',
                      textAlign: 'center',
                      background: 'var(--color-brown-dark)',
                      color: '#FFF',
                      borderRadius: '8px',
                      padding: '6px 4px',
                    }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                        {pad(unit.value)}
                      </div>
                      <div style={{ fontSize: '0.58rem', letterSpacing: '0.4px', color: 'var(--color-primary-light)' }}>
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
