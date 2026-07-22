import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlayerHeader, Tab } from '@/pages/player/components/header/PlayerHeader'
import { PlayerError } from '@/pages/player/components/PlayerError'
import { PlayerLoading } from '@/pages/player/components/PlayerLoading'
import { StatisticsProvider, useStatistics } from '@/contexts/StatisticsContext'
import { PlayerRankTierVertical } from './components/rank-tier/vertical/PlayerRankTierVertical'
import { PlayerCharacterTable } from './components/character-table/PlayerCharacterTable'
import { useSeason } from '@/contexts/meta/SeasonContext'
import { PlayerProvider, usePlayer } from '@/contexts/PlayerContext'
import { RouteAuthProvider, useRouteAuth } from '@/contexts/RouteAuthContext'
import { BattleResultProvider, useBattleResult } from '@/contexts/BattleResultContext'
import { useEquip } from '@/contexts/meta/EquipContext'

export function PlayerPage() {
  return (
    <PlayerProvider>
      <RouteAuthProvider>
        <StatisticsProvider>
          <BattleResultProvider>
            <PlayerPageContent />
          </BattleResultProvider>
        </StatisticsProvider>
      </RouteAuthProvider>
    </PlayerProvider>
  )
}

function PlayerPageContent() {
  const { name } = useParams<{ name: string }>()
  const { setSeasonId, initSeasonId } = useSeason()
  const { player, latestSeasonId, status, error } = usePlayer()
  const { getRouteAuth, reset: resetRouteAuth } = useRouteAuth()
  const { getSeasonStatistics, reset: resetStatistics } = useStatistics()
  const { reset: resetBattleResult } = useBattleResult()

  const [activeTab, setActiveTab] = useState<Tab>('프로필')

  const handleSeasonChange = (newSeasonId: string) => {
    setSeasonId(parseInt(newSeasonId))
    getSeasonStatistics(player.id, parseInt(newSeasonId))
  }

  // 유저가 바뀌면 이전 유저의 파생 데이터를 비운다
  useEffect(() => {
    resetStatistics()
    resetRouteAuth()
    resetBattleResult()
  }, [name])

  // 탭 이름을 "DAYO GG :: {유저명}"으로, 페이지를 떠나면 기본값으로 복원한다
  useEffect(() => {
    document.title = name ? `DAYO GG :: ${name}` : 'DAYO GG'
    return () => {
      document.title = 'DAYO GG'
    }
  }, [name])

  // 조회 완료(최초 로드·갱신 완료 공통) 시 파생 데이터를 조회한다
  useEffect(() => {
    if (status !== 'ready' || !latestSeasonId) return

    const targetSeasonId = initSeasonId(latestSeasonId)
    getSeasonStatistics(player.id, targetSeasonId)
    getRouteAuth(player.id)
  }, [status, player.id])

  const renderContent = () => {
    if (status === 'error') return <PlayerError apiError={error} />
    if (status === 'searching') return <PlayerLoading />

    return (
      <>
        <PlayerHeader
          onSelectSeason={handleSeasonChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {status === 'syncing' ? (
          <PlayerLoading />
        ) : (
          <>
            {activeTab === '프로필' && <PlayerRankTierVertical />}
            {activeTab === '실험체' && <PlayerCharacterTable />}
          </>
        )}
      </>
    )
  }

  return (
    <div className="w-full  text-white mt-10">
      {renderContent()}
    </div>
  )
}
