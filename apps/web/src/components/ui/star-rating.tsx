'use client';

import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const interactive = !readonly && !!onChange;
  const display = hovered || value;

  const handleClick = useCallback(
    (star: number) => {
      if (!interactive) return;
      onChange(star);
    },
    [interactive, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, star: number) => {
      if (!interactive) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(star);
      }
    },
    [interactive, onChange],
  );

  return (
    <div
      className="inline-flex gap-0.5"
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            tabIndex={interactive ? 0 : -1}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={cn(
              'transition-colors',
              interactive
                ? 'cursor-pointer text-amber-400 hover:text-amber-500'
                : 'cursor-default',
              filled ? 'text-amber-400' : 'text-border',
              !interactive && filled && 'text-amber-400',
            )}
          >
            {filled ? (
              <IconStarFilled size={size} />
            ) : (
              <IconStar size={size} />
            )}
          </button>
        );
      })}
    </div>
  );
}
