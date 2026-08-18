import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Statistics } from '@/types/statistics/StatisticsType'
import { displayFormatNumber, toPercent } from '@/utils/valueUtils'
import { TierInfo } from '../TierInfo'
import { StatItemProps } from './StatComponents'
import { SummaryTab } from './SummaryTab'
import { BattleResultTab } from './BattleResultTab'

interface PrimaryStatItemProps extends StatItemProps {
  barColor?: string
  max?: number
}

function PrimaryStatItem({
  label,
  value,
  type = 'number',
  decimals,
  labelColor = 'text-white',
  barColor = 'bg-gray-400',
  max,
}: PrimaryStatItemProps) {
  const barWidth = type === 'percent'
    ? Number(value) * 100
    : max !== undefined ? toPercent(value, max) : 0

  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <p className="font-bold leading-tight text-white text-base">
        {displayFormatNumber(value, type, decimals)}
      </p>
      <div className="h-0.5 w-full bg-gray-600 rounded-sm my-0.5">
        <div className={`h-0.5 rounded-sm ${barColor}`} style={{ width: `${barWidth}%` }} />
      </div>
      <p className={`text-[11px] font-semibold uppercase tracking-wide whitespace-pre-line ${labelColor}`}>
        {label}
      </p>
    </div>
  )
}

function PrimaryStatRow({ items, columns = 4, className }: { items: PrimaryStatItemProps[]; columns?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-3 mx-auto w-[calc(100%)] md:gap-6 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ '--cols': columns } as React.CSSProperties}
      >
        {items.map((item, index) => (
          <PrimaryStatItem key={index} {...item} />
        ))}
      </div>
    </div>
  )
}

const DETAIL_TABS = ['통계', '전적'] as const
type DetailTab = typeof DETAIL_TABS[number]

interface TierCardBodyProps {
  statistics: Statistics
  expanded: boolean
  onToggle: () => void
}

function TierCardBody({ statistics, expanded, onToggle }: TierCardBodyProps) {
  return (
    <div className="p-5 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
      {/* 좌측: 티어 정보 */}
      <div className="w-full md:w-[17rem] md:shrink-0">
        <TierInfo stat={statistics} />
      </div>

      {/* 가운데: 주요 통계 행 */}
      <div className="flex-1 flex flex-col gap-3">
        <PrimaryStatRow
          items={[
            { label: 'TK', value: statistics.teamKill, max: 10, labelColor: 'text-gray-200', barColor: 'bg-red-400' },
            { label: '시야점수', value: statistics.viewContribution, max: 50, labelColor: 'text-orange-300', barColor: 'bg-orange-300' },
            { label: '게임 수', value: statistics.totalGames, max: 500, },
            { label: '사전 팀 게임 수', value: statistics.preMadeGameCount, max: 500, },
          ]}
        />
        <PrimaryStatRow
          items={[
            { label: '승률', value: statistics.winRate, type: 'percent', labelColor: 'text-green-400', barColor: 'bg-green-400' },
            { label: 'TOP 2', value: statistics.top2Rate, type: 'percent', barColor: 'bg-blue-600' },
            { label: 'TOP 3', value: statistics.top3Rate, type: 'percent', barColor: 'bg-blue-400' },
            { label: '평균 순위', value: statistics.gameRank, max: 8 },
          ]}
        />
      </div>

      {/* 펼치기/접기 토글: 모바일은 하단 가로 바, md 이상은 우측 세로 바 */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="-ml-5 -mr-5 -mb-5 mt-1 py-1.5 flex items-center justify-center bg-gray-600 hover:bg-gray-500 transition-colors md:ml-0 md:-mt-5 md:py-0 md:w-[50px] md:shrink-0 md:self-stretch"
      >
        {expanded
          ? <ChevronUp size={20} className="text-gray-200" />
          : <ChevronDown size={20} className="text-gray-200" />}
      </button>
    </div>
  )
}

function TierCardExpanded({ statistics }: { statistics: Statistics }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('통계')

  return (
    <div className="border-t border-gray-700 px-4 py-1 md:px-10">
      {/* 탭 구역 */}
      <div className="flex gap-6 border-b border-gray-700 mb-5">
        {DETAIL_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={`relative py-2 text-sm font-medium transition-colors ${activeTab === tab
              ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '통계' && <SummaryTab statistics={statistics} />}

      {activeTab === '전적' && <BattleResultTab statistics={statistics} />}
    </div>
  )
}

interface VerticalTierCardProps {
  statistics: Statistics
}

export function VerticalTierCard({ statistics }: VerticalTierCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <TierCardBody
        statistics={statistics}
        expanded={expanded}
        onToggle={() => setExpanded(prev => !prev)}
      />

      {expanded && <TierCardExpanded statistics={statistics} />}
    </div>
  )
}
