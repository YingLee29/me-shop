'use client';

import { useState, type ReactNode } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

export default function MobileFilter({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="product-filters-wrap">
      <button
        type="button"
        className="mobile-filter-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={18} /> Bộ lọc sản phẩm
        </span>
        {open ? <X size={18} /> : <ChevronDown size={18} />}
      </button>
      <div className={`product-filters-body ${open ? 'is-open' : ''}`}>{children}</div>
    </div>
  );
}
