import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
// import { RotateCcw } from 'lucide-react'
import { SearchRangeModalButton } from '../search-range/SearchRangeModalButton'
import { Button } from '@/components/atoms/Button'
import { ImageFrame } from '@/components/atoms/ImageFrame'
import { Selector, SelectorOptions } from '@/components/molecules/Selector'
import { toSeasonOptions } from '@/types/PlayerType'
import { usePlayer } from '@/contexts/PlayerContext'
import { useLocale } from '@/contexts/meta/LocaleContext'
import { getCharacterImgSrc, getImgSrc } from '@/utils/imgSrc'
import { formatTimeAgo } from '@/utils/timeUtils'

interface PlayerHeaderProps {
  onSelectSeason: (seasonId: string) => void,
  activeTab: Tab,
  onTabChange: (tab: Tab) => void,
}

const TABS = ['프로필', '실험체'] as const
export type Tab = typeof TABS[number]

export function PlayerHeader({ /* onSelectSeason, */ activeTab, onTabChange }: PlayerHeaderProps) {
  return (
    <div className="bg-gray-800 text-white max-w-5xl mx-auto rounded-lg shadow-md">
      <div className="mx-auto max-w-5xl px-6">
        {/* 상단 영역 */}
        <div className="relative py-6 pr-24">
          {/* 좌측: 캐릭터 이미지, 정보 */}
          <PlayerProfile />

          {/* 우측: 시즌 선택 */}
          {/* <div className="absolute top-6 right-0">
            <SeasonSelector onSelectSeason={onSelectSeason} />
          </div> */}
        </div>

        {/* ??*/}
        <PlayerTabs activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}

function PlayerProfile() {
  const { player, playerSeasonDetail } = usePlayer()
  const src = getCharacterImgSrc('MINI', playerSeasonDetail?.mostCharacterNum)

  return (
    <div className="flex items-center gap-6 min-w-0">
      <ImageFrame size={150} src={src} isCircle alt='character' placeholder='캐릭터' />

      {/* 닉네임 및 버튼 */}
      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-sm w-fit">
          Lv. {player?.level}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold truncate">{player?.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton />
          <SearchRangeModalButton />
        </div>
        <span className="text-xs text-gray-400">최근 업데이트: {formatTimeAgo(player.lastSearchTime)}</span>
      </div>
    </div>
  )
}

function RefreshButton() {
  const { status, refresh } = usePlayer()
  // 갱신 사이클(refresh SSE + info 재조회) 전체를 커버하는 버튼 로딩 상태
  const refreshLoading = status === 'refreshing' || status === 'syncing'

  return (
    <Button variant="success" onClick={refresh} disabled={refreshLoading} className="flex items-center gap-1 text-sm px-3 py-1.5">
      <RefreshCw size={14} />
      {refreshLoading ? '갱신 중...' : '전적 갱신'}
    </Button>
  )
}

interface SeasonSelectorProps {
  onSelectSeason: (seasonId: string) => void,
}

export function SeasonSelector({ onSelectSeason }: SeasonSelectorProps) {
  const [seasonOptions, setSeasonOptions] = useState<SelectorOptions[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const { playerSeasonList } = usePlayer()
  const { locale } = useLocale()

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeason(seasonId)
    onSelectSeason?.(seasonId)
  }

  useEffect(() => {
    if (!playerSeasonList.length || !locale?.SEASON) return

    const options = toSeasonOptions(playerSeasonList, locale.SEASON)
    setSeasonOptions(options)
    setSelectedSeason(options[0]?.value ?? null)
  }, [playerSeasonList, locale])

  return (
    <Selector
      options={seasonOptions}
      value={selectedSeason}
      onChange={handleSeasonChange}
    />
  )
}

interface PlayerTabsProps {
  activeTab: Tab,
  onTabChange: (tab: Tab) => void,
}

function PlayerTabs({ activeTab, onTabChange }: PlayerTabsProps) {
  return (
    <div className="flex gap-6 border-t border-gray-700">
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => { onTabChange?.(tab) }}
          className={`relative py-3 text-sm font-medium transition-colors ${activeTab === tab
            ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
            : 'text-gray-400 hover:text-gray-200'
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
