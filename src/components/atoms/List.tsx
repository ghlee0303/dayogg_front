import { forwardRef } from 'react'

interface ListProps {
  children: React.ReactNode
  className?: string
  fontSize?: number
  backgroundColor?: keyof typeof backgroundColors
  width?: number | string
  /** 설정 시 해당 높이(px)를 넘으면 세로 스크롤 */
  maxHeight?: number
}

const backgroundColors = {
  'default': 'bg-gray-700',
  'blue': 'bg-blue-700',
  'green': 'bg-green-700',
  'red': 'bg-red-700',
  'dark': 'bg-gray-900',
} as const

export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { children, className = '', fontSize, backgroundColor = 'default', width, maxHeight },
  ref
) {
  const overflow = maxHeight != null ? 'overflow-y-auto' : 'overflow-hidden'
  return (
    <ul ref={ref} className={`rounded-sm shadow-lg ${overflow} ${className} ${backgroundColors[backgroundColor]} `} style={{ fontSize, width, maxHeight }}>
      {children}
    </ul>
  )
})

interface ListItemProps {
  onClick?: () => void
  children: React.ReactNode
  fontSize?: number
}

export function ListItem({ onClick, children, fontSize }: ListItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className="flex gap-1 items-center w-full text-left px-2 py-2 text-sm text-white hover:bg-gray-600 transition-colors"
        style={{ fontSize }}
      >
        {children}
      </button>
    </li>
  )
}