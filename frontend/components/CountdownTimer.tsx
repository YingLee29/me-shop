'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  initialSeconds?: number;
  endAt?: string;
}

export default function CountdownTimer({ initialSeconds = 7200, endAt }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (endAt) {
      const diff = Math.floor((new Date(endAt).getTime() - Date.now()) / 1000);
      return Math.max(0, diff);
    }
    return initialSeconds;
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brown)' }}>
        <Clock size={16} color="var(--color-red)" /> Kết thúc sau:
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          background: 'var(--color-brown-dark)',
          color: '#FFF',
          fontWeight: 800,
          fontSize: '0.9rem',
          padding: '4px 8px',
          borderRadius: '6px',
          minWidth: '32px',
          textAlign: 'center',
        }}>
          {pad(hours)}
        </span>
        <span style={{ fontWeight: 800, color: 'var(--color-brown-dark)' }}>:</span>
        <span style={{
          background: 'var(--color-brown-dark)',
          color: '#FFF',
          fontWeight: 800,
          fontSize: '0.9rem',
          padding: '4px 8px',
          borderRadius: '6px',
          minWidth: '32px',
          textAlign: 'center',
        }}>
          {pad(minutes)}
        </span>
        <span style={{ fontWeight: 800, color: 'var(--color-brown-dark)' }}>:</span>
        <span style={{
          background: 'var(--color-red)',
          color: '#FFF',
          fontWeight: 800,
          fontSize: '0.9rem',
          padding: '4px 8px',
          borderRadius: '6px',
          minWidth: '32px',
          textAlign: 'center',
        }}>
          {pad(seconds)}
        </span>
      </div>
    </div>
  );
}
