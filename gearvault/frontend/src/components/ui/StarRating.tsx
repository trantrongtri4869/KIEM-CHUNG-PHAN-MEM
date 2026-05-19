import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  count?: number
}

export default function StarRating({
  rating,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  count,
}: StarRatingProps) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size]

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const half = !filled && i < rating && rating % 1 >= 0.5
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(i + 1)}
              className={interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'}
            >
              <Star
                className={`${sizeClass} transition-colors ${
                  filled || half ? 'star-filled' : 'star-empty'
                }`}
                fill={filled || half ? 'currentColor' : 'none'}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-[var(--text-primary)]">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-sm text-[var(--text-muted)]">({count})</span>
      )}
    </div>
  )
}
