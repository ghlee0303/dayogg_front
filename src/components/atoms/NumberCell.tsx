import { clampNumber } from '@/utils/valueUtils'
import { CommitInput } from './CommitInput'

interface NumberCellProps {
  value: number | null
  min: number
  max: number
  onCommit: (value: number) => void
  placeholder?: string
}

const toText = (v: number | null) => (v === null ? '' : String(v))

const cellClass =
  `!px-2 !py-1 !rounded-md text-sm text-center [appearance:textfield]
  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`

export function NumberCell({ value, min, max, onCommit, placeholder }: NumberCellProps) {
  const normalize = (text: string): string => {
    const v = Number(text);

    if (text === '' || Number.isNaN(v)) return toText(value)
      
    return String(clampNumber(v, min, max))
  }

  return (
    <CommitInput
      variant="black"
      type="number"
      placeholder={placeholder}
      className={cellClass}
      value={toText(value)}
      normalize={normalize}
      onCommit={(text) => onCommit(Number(text))}
    />
  )
}
