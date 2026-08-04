import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { usePlayer } from '@/contexts/PlayerContext'
import { useSeason } from '@/contexts/meta/SeasonContext'
import { useStatistics } from '@/contexts/StatisticsContext'
import { SearchRangeModal } from './SearchRangeModal'
import {
  fromSeasonTotalToRangeLimit,
  fromStatistics,
  type SearchRangeLimit,
  type SearchRangeOption,
} from "@/pages/player/components/search-range/type/SearchRangeOptionType";
import { fromSearchRangeOptions } from '@/types/statistics/request/StatisticsRangeRequestType'

export function SearchRangeModalButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { player } = usePlayer()
  const { seasonId } = useSeason()
  const { statistics, getStatisticsByRange } = useStatistics()
  const [rangeLimit, setRangeLimit] = useState<SearchRangeLimit>();

  useEffect(() => {
    if (statistics.length === 0) return

    const seasonTotal = statistics.find((stat) => stat.type === 'SEASON_TOTAL');
    if (!seasonTotal) return

    setRangeLimit(fromSeasonTotalToRangeLimit(seasonTotal))

  }, [statistics])

  const initialOptions = useMemo(
    () =>
      statistics
        .map(fromStatistics)
        .filter((o): o is SearchRangeOption => o !== null),
    [statistics],
  )

  const onModalConfirm = (confirmOptions: SearchRangeOption[]) => {
    if (!player || !seasonId) return;

    const requestList = fromSearchRangeOptions(confirmOptions);

    getStatisticsByRange(player.id, seasonId, requestList);
  }

  return (
    <>
      {isOpen && rangeLimit && (
        <SearchRangeModal
          rangeLimit={rangeLimit}
          initialOptions={initialOptions}
          onConfirm={onModalConfirm}
          onClose={() => setIsOpen(false)}
        />
      )}
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        disabled={!rangeLimit}
        className="text-sm font-bold! px-3 py-1.5"
      >
        세부 검색
      </Button>
    </>
  )
}
