import { Check, X } from 'lucide-react'

export interface DetailStat {
  label: string
  value: string | number | boolean
}

// boolean은 체크 / 엑스 아이콘으로 표시
function DetailStatValue({ value }: { value: DetailStat['value'] }) {
  if (typeof value !== 'boolean') {
    return <span className="text-xs font-semibold text-white">{value}</span>
  }
  return value
    ? <Check size={14} className="text-green-400" aria-label="예" />
    : <X size={14} className="text-red-400" aria-label="아니오" />
}

interface DetailStatsProps {
  stats: DetailStat[]
  /** 한 열에 세로로 쌓을 항목 수. 초과하면 다음 열로 이어짐 */
  rows?: number
}

const rowClasses: Record<number, string> = {
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  4: 'grid-rows-4',
  5: 'grid-rows-5',
  6: 'grid-rows-6',
}

// label: value 를 세로로 rows 개씩 쌓고, 넘으면 다음 열로 이어짐
export function DetailStats({ stats, rows = 4 }: DetailStatsProps) {
  return (
    <div className={`grid grid-flow-col ${rowClasses[rows]} gap-x-6 gap-y-0.5`}>
      {stats.map(({ label, value }) => (
        <div key={label} className="flex w-28 items-center justify-between gap-1">
          <span className="truncate text-xs text-gray-400">{label}</span>
          <DetailStatValue value={value} />
        </div>
      ))}
    </div>
  )
}
