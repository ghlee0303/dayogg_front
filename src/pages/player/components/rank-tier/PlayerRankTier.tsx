import { TierCard } from './TierCard'
import { TierCardList } from './TierCardList'
import { useStatistics } from '@/contexts/StatisticsContext'

interface PlayerRankTierProps {
}

export function PlayerRankTier({ }: PlayerRankTierProps) {
  const { statistics, } = useStatistics()

  const renderTierCards = () => {
    return statistics.map((stat, index) => (
      <TierCard
        key={index}
        statistics={stat}
      />
    ))
  }

  return (
    <>
      <div className="mx-auto max-w-5xl mt-3 px-4 md:px-0 flex items-center justify-center">
        <span className="text-white font-semibold text-sm">랭크 리스트</span>
      </div>
      <TierCardList>
        {renderTierCards()}
      </TierCardList>
    </>
  )
}