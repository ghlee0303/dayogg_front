import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { List, ListItem } from '@/components/atoms/List'
import { ImageFrame } from '../atoms/ImageFrame'

export const HIDDEN_PREFIX = 'HIDDEN_'

export interface SelectorOptions {
  value: string
  label: string
  imgSrc?: string
  /** true면 현재 선택값일 때 라벨은 표시되지만 드롭다운 목록에는 노출되지 않음 */
  hidden?: boolean
}

interface SelectorProps {
  options: SelectorOptions[]
  value: string | null
  onChange: (value: string, option?: SelectorOptions) => void
  isUseImg?: boolean
  width?: number | string
  fontSize?: number
  backgroundColor?: 'default' | 'blue' | 'green' | 'red' | 'dark',
  /** 드롭다운에 한 번에 보여줄 최대 항목 수. 초과 시 세로 스크롤 */
  maxVisibleOptions?: number
}

const backgroundColors = {
  'default': 'bg-gray-700 hover:bg-gray-600',
  'blue': 'bg-blue-700 hover:bg-blue-600',
  'green': 'bg-green-700 hover:bg-green-600',
  'red': 'bg-red-700 hover:bg-red-600',
  'dark': 'bg-gray-900 hover:bg-gray-800',
} as const

const IMGSIZE = 22 as const;

const DEFAULT_OPTION = { value: '', label: '' };

export function Selector({ options, value, onChange, isUseImg = false, width = "100%", fontSize = 14, backgroundColor = 'default', maxVisibleOptions }: SelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen || !maxVisibleOptions) {
      setMaxHeight(undefined)
      return
    }

    const items = listRef.current?.children
    if (!items || items.length <= maxVisibleOptions) {
      setMaxHeight(undefined)
      return
    }

    let height = 0
    for (let i = 0; i < maxVisibleOptions; i++) {
      height += (items[i] as HTMLElement).offsetHeight
    }
    setMaxHeight(height)
  }, [isOpen, maxVisibleOptions, options])

  const getOption = (value: string | null): SelectorOptions => {
    if (value === null) return DEFAULT_OPTION;

    return options.find(o => o.value === value) ?? DEFAULT_OPTION
  }

  return (
    <div ref={ref} className="relative" style={{ width }}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full text-sm text-white px-3 py-2 rounded-sm transition-colors ${backgroundColors[backgroundColor]} `}
      >
        <div className='flex items-center justify-between gap-2'>
          {isUseImg && <ImageFrame size={IMGSIZE} src={getOption(value).imgSrc} alt={getOption(value).value} />}
          <span className="flex-1 text-left" style={{ fontSize }}>
            {getOption(value).label || ' '}
          </span>
          <ChevronDown size={14} className="shrink-0" />
        </div>

      </button>
      {isOpen && (
        <List
          ref={listRef}
          className="absolute right-0 w-32 z-10 mt-1 min-w-[8rem]"
          backgroundColor={backgroundColor}
          fontSize={fontSize}
          width={width}
          maxHeight={maxHeight}
        >
          {options.filter(option => !option.hidden).map(option => (
            <ListItem
              key={option.value}
              onClick={() => { onChange(option.value, option); setIsOpen(false) }}
              fontSize={fontSize}
            >
              {isUseImg && <ImageFrame size={IMGSIZE} src={option.imgSrc} alt={option.value} />}
              {option.label}
            </ListItem>
          ))}
        </List>
      )}
    </div>
  )
}