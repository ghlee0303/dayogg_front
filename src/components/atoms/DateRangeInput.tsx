interface DateRangeInputProps {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
  min?: string
  max?: string
  width?: number | string
}

const inputClass =
  'flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 [color-scheme:dark]'

export function DateRangeInput({
  startDate,
  endDate,
  onChange,
  min,
  max,
  width,
}: DateRangeInputProps) {

  return (
    <div className="flex items-center gap-2" style={{ width }}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
        min={min}
        max={endDate || max}
        className={inputClass}
      />
      <span className="text-gray-400 text-sm">-</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
        min={startDate || min}
        max={max}
        className={inputClass}
      />
    </div>
  )
}
