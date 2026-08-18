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
import { getCharacterImgSrc, } from '@/utils/imgSrc'
import { formatTimeAgo, minutesSince } from '@/utils/timeUtils'
import { useParams } from 'react-router-dom'

interface PlayerHeaderProps {
  onSelectSeason: (seasonId: string) => void,
  activeTab: Tab,
  onTabChange: (tab: Tab) => void,
}

const TABS = ['프로필', '실험체'] as const
export type Tab = typeof TABS[number]

// 마지막 조회 후 이 시간이 지나야 다시 갱신할 수 있다
const REFRESH_COOLDOWN_MINUTES = 10

// 모스트 캐릭터 정보를 받았는데도 이미지를 구할 수 없을 때 쓰는 기본 이미지
const DEFAULT_PROFILE_IMG = '/img/adina_01.png'

export function PlayerHeader({ /* onSelectSeason, */ activeTab, onTabChange }: PlayerHeaderProps) {
  return (
    <div className="bg-gray-800 text-white max-w-5xl mx-4 md:mx-auto rounded-lg shadow-md">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {/* 상단 영역 (pr은 우측 시즌 선택 자리) */}
        <div className="relative py-6 pr-0 md:pr-24">
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
  const { name } = useParams<{ name: string }>()
  const { player, playerSeasonDetail } = usePlayer()
  const src = getCharacterImgSrc('MINI', playerSeasonDetail?.mostCharacterNum)

  return (
    <div className="flex items-center gap-4 md:gap-6 min-w-0">
      <ImageFrame
        size={150}
        className="!w-[100px] !h-[100px] md:!w-[150px] md:!h-[150px]"
        src={src}
        // 모스트 캐릭터 정보가 오기 전에는 기본 이미지 대신 placeholder를 보여준다
        fallbackSrc={playerSeasonDetail ? DEFAULT_PROFILE_IMG : undefined}
        isCircle
        alt='character'
        placeholder={name ?? '캐릭터'}
      />

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
  const { player, status, refresh } = usePlayer()
  // 갱신 사이클(refresh SSE + info 재조회) 전체를 커버하는 버튼 로딩 상태
  const refreshLoading = status === 'refreshing' || status === 'syncing'

  // lastSearchTime이 없거나 파싱할 수 없으면(초기값 '-') 쿨다운을 걸지 않는다
  const elapsedMinutes = minutesSince(player.lastSearchTime)
  const isFresh = elapsedMinutes != null && elapsedMinutes < REFRESH_COOLDOWN_MINUTES
  // 갱신 중에는 로딩 표시가 우선이다
  const showFresh = isFresh && !refreshLoading

  return (
    <Button
      variant={showFresh ? 'warning' : 'success'}
      // disabled 대신 핸들러를 떼서, 흐려지거나 커서가 바뀌지 않는 상태 표시로 남긴다
      onClick={showFresh ? undefined : refresh}
      disabled={refreshLoading}
      // Button base의 font-medium이 CSS 순서상 뒤에 와서 이기므로 !로 덮는다
      className={`flex items-center gap-1 text-sm font-bold! px-3 py-1.5 ${showFresh ? 'cursor-default' : ''}`}
    >
      {refreshLoading && <RefreshCw size={14} />}
      {refreshLoading ? '갱신 중...' : showFresh ? '최신 정보' : '전적 갱신'}
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
