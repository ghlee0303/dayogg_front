import { Statistics } from '@/types/statistics/StatisticsType'
import { displayFormatNumber, toPercent, ValueType } from '@/utils/valueUtils'
import { TierInfo } from './TierInfo'

interface StatRowProps {
  label: string
  value: string | number
  max?: number
  barColor?: string
  type?: ValueType
  decimals?: number
}

function StatRow({ label, value, max, barColor = 'bg-gray-400', type = 'number', decimals }: StatRowProps) {
  const barWidth = type === 'percent'
    ? Number(value) * 100
    : max !== undefined ? toPercent(value, max) : 0

  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5 whitespace-pre-line">{label}</p>
      <div className="h-1 w-full bg-gray-600 rounded-sm mb-0.5">
        <div className={`h-1 rounded-sm ${barColor}`} style={{ width: `${barWidth}%` }} />
      </div>
      <p className="text-sm font-semibold text-white">{displayFormatNumber(value, type, decimals)}</p>
    </div>
  )
}

interface TierCardProps {
  statistics: Statistics
}

export function TierCard({ statistics }: TierCardProps) {

  return (
    <div
      className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3 h-full"
      style={{
        minWidth: 320,
        maxWidth: 400
      }}
    >
      <TierInfo
        stat={statistics}
      />
      <div className="grid grid-cols-3 gap-x-3 gap-y-3">
        <StatRow label="TK" value={statistics.teamKill} max={10}/>
        <StatRow label="게임 수" value={statistics.totalGames} max={500} />
        <StatRow label="평균 순위" value={`#${statistics.gameRank?.toFixed(1) ?? '-'}`} />
        <StatRow label="승률" value={statistics.winRate} type="percent" barColor="bg-orange-500" />
        <StatRow label="TOP 2" value={statistics.top2Rate} type="percent" barColor="bg-green-500" />
        <StatRow label="TOP 3" value={statistics.top3Rate} type="percent" barColor="bg-blue-500" />
        <StatRow label="딜량" value={statistics.damageToPlayer} type="round" />
        <StatRow label="평균 RP" value={statistics.avgMmrGain} />
        <StatRow label="평균 생존시간" value={statistics.playTime} type="time" />
        <StatRow label="평균 시야" value={statistics.viewContribution} max={50} barColor="bg-blue-200" />
        <StatRow label="정찰드론 사용" value={statistics.useReconDrone} />
        <StatRow label="EMP드론 사용" value={statistics.useEmpDrone} />
        <StatRow label="보안콘솔 사용" value={statistics.useSecurityConsole} />
        <StatRow label="카메라 설치" value={statistics.deployCamera} />
        <StatRow label="카메라 제거" value={statistics.removeCamera} />
      </div>
    </div>
  )
}
