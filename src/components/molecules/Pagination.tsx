import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  /** 현재 페이지 (0부터 시작) */
  page: number
  totalPages: number
  onChange: (page: number) => void
  /** 한 번에 보여줄 페이지 번호 개수 */
  maxVisiblePages?: number
}

export function Pagination({ page, totalPages, onChange, maxVisiblePages = 5 }: PaginationProps) {
  if (totalPages <= 1) return null

  const visibleCount = Math.min(maxVisiblePages, totalPages)
  const start = Math.max(0, Math.min(page - Math.floor(visibleCount / 2), totalPages - visibleCount))
  const pages = Array.from({ length: visibleCount }, (_, i) => start + i)

  const buttonBase = 'flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-colors'

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className={`${buttonBase} text-gray-300 hover:bg-gray-600 disabled:cursor-default disabled:text-gray-600 disabled:hover:bg-transparent`}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${buttonBase} ${
            p === page
              ? 'bg-blue-600 font-semibold text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        className={`${buttonBase} text-gray-300 hover:bg-gray-600 disabled:cursor-default disabled:text-gray-600 disabled:hover:bg-transparent`}
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
