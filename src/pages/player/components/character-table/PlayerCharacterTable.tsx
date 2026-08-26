import { useState, useEffect, useMemo } from 'react'
import { Selector } from '@/components/molecules/Selector'
import { TableView, TableColumn } from '@/components/molecules/TableView'
import { useStatistics } from '@/contexts/StatisticsContext'
import { CharacterStat, toStatisticsOptions, toCharacterList } from '@/types/statistics/StatisticsType'
import { displayFormatNumber } from '@/utils/valueUtils'
import { RpCell } from '@/components/atoms/RpCell'
import { ImageFrame } from '@/components/atoms/ImageFrame'
import { getCharacterImgSrc, getImgSrc } from '@/utils/imgSrc'

function renderCharacter(row: CharacterStat) {
  const src = getCharacterImgSrc('MINI', row.characterNum)
  const weaponImg = getImgSrc('WEAPON', row.weaponNum);

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: 42, height: 42 }}>
        <ImageFrame size={42} src={src} placeholder={row.characterName} isCircle bgColor='bg-gray-400' />
        {weaponImg && (
          <div className="absolute" style={{ right: -4, bottom: -4 }}>
            <ImageFrame size={20} src={weaponImg} placeholder={row.weaponName} isCircle bgColor='bg-gray-700' />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-white font-medium">{row.characterName}</span>
        <span className="text-xs text-gray-400">{row.totalGames} 게임</span>
      </div>
    </div>
  )
}

const columns: TableColumn<CharacterStat>[] = [
  { key: 'characterName', header: '실험체', align: 'left', width: 170, render: renderCharacter },
  { key: 'wins', header: '승률', className: 'font-semibold text-green-400', render: (row) => displayFormatNumber(row.winRate, 'percent') },
  { key: 'teamKill', header: 'TK', className: 'font-semibold text-red-400' },
  { key: 'mmrGain', header: 'RP', render: (row) => RpCell({ value: row.sumMmrGain }) },
  { key: 'top3', header: 'TOP 3', render: (row) => displayFormatNumber(row.top3Rate, 'percent') },
  { key: 'gameRank', header: '순위', },
  { key: 'viewContribution', header: '시야 점수' },
  { key: 'damageToPlayer', header: '딜량', render: (row) => displayFormatNumber(row.damageToPlayer, 'round') },
  { key: 'targetTimeCredits', header: `2낮 1분 전\n크레딧`, type: 'round', },
  { key: 'lateGameRate', header: '후반\n생존률', type: 'percent', width: 60 },
  { key: 'playTime', header: '평균 생존시간', type: 'time' },
]

export function PlayerCharacterTable() {
  const { statistics } = useStatistics()
  const [selectedRank, setSelectedRank] = useState<string | null>(null)
  const [isWeapon, setIsWeapon] = useState(false)

  const rankOptions = useMemo(
    () => toStatisticsOptions(statistics),
    [statistics]
  )

  const getSelectedStat = (key: string) => {
    return key === "SEASON_TOTAL" ?
      statistics.find((s) => s.type === "SEASON_TOTAL")
      : statistics.find((s, index) => s.type != "SEASON_TOTAL" && String(index) === key)
  }

  useEffect(() => {
    if (rankOptions.length > 0 && selectedRank === null) {
      setSelectedRank(rankOptions[0].value)
    }
  }, [rankOptions])

  const characterTable = useMemo(() => {
    if (!selectedRank) return [];
    const selectedStatistics = getSelectedStat(selectedRank);

    if (!selectedStatistics) return []

    return toCharacterList(selectedStatistics, isWeapon);
  }, [selectedRank, isWeapon])

  return (
    <div className="max-w-5xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 w-1/3">
          <Selector
            options={rankOptions}
            value={selectedRank}
            onChange={setSelectedRank}
            width={160}
            fontSize={14}
            backgroundColor='dark'
          />
          <label className="flex items-center gap-2 text-sm text-gray-300 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={isWeapon}
              onChange={(e) => setIsWeapon(e.target.checked)}
              className="accent-blue-500"
            />
            무기별
          </label>
        </div>
      </div>
      <TableView
        columns={columns}
        data={characterTable}
        rowKey={(row) => {
          const character = row.characterNum || "character";
          const weapon = row.weaponNum || "weapon";

          return `${character}-${weapon}`
        }}
        emptyMessage="실험체 데이터가 없습니다."
      />
    </div>
  )
}
