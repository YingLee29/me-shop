import { Star } from 'lucide-react';

export function formatRating(value: number): string {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}

interface StarRatingProps {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  showCount?: boolean;
  className?: string;
}

/**
 * Dải 5 sao kiểu Google: fill một phần theo điểm trung bình.
 * VD: 4.4 → 4.4/5 sao (ngôi thứ 5 tô 40%).
 */
export default function StarRating({
  value,
  count,
  size = 16,
  showValue = false,
  showCount = false,
  className = '',
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const percent = (clamped / 5) * 100;
  const label = `${formatRating(clamped)} trên 5 sao${
    typeof count === 'number' ? `, ${count} đánh giá` : ''
  }`;

  const renderStars = (color: string) =>
    [1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill={color} color={color} strokeWidth={0} aria-hidden="true" />
    ));

  return (
    <span className={`star-rating ${className}`.trim()} role="img" aria-label={label}>
      <span className="star-rating__stars" aria-hidden="true">
        <span className="star-rating__row">{renderStars('#DCD6C8')}</span>
        <span className="star-rating__row star-rating__row--fill" style={{ width: `${percent}%` }}>
          <span className="star-rating__row-inner">{renderStars('#F5A623')}</span>
        </span>
      </span>
      {showValue && <span className="star-rating__value">{formatRating(clamped)}</span>}
      {showCount && <span className="star-rating__count">({count ?? 0})</span>}
    </span>
  );
}
