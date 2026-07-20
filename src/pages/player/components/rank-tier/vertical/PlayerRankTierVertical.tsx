import { VerticalTierCard } from './VerticalTierCard'
import { useStatistics } from '@/contexts/StatisticsContext'

export function PlayerRankTierVertical() {
  const { statistics } = useStatistics()

  return (
    <div className="mx-auto mt-3 max-w-5xl px-4 md:px-0 flex flex-col gap-3">
      {statistics.map((stat, index) => (
        <VerticalTierCard key={index} statistics={stat} />
      ))}
    </div>
  )
}
