import { useEffect, useState, type ReactNode } from 'react'
import { ImageFrame } from '@/components/atoms/ImageFrame'
import { Pagination } from '@/components/molecules/Pagination'
import { DetailStats, type DetailStat } from '@/components/molecules/DetailStats'
import { BattleResult } from '@/types/battle/BattleType'
import { Statistics } from '@/types/statistics/StatisticsType'
import { fromStatistics } from '@/types/battle/request/BattleResultRangeRequestType'
import { BATTLE_PAGE_SIZE, useBattleResult } from '@/contexts/BattleResultContext'
import { usePlayer } from '@/contexts/PlayerContext'
import { useSeason } from '@/contexts/meta/SeasonContext'
import { getCharacterImgSrc, getImgSrc } from '@/utils/imgSrc'
import { useTrait } from '@/contexts/meta/TraitContext'
import { useEquip } from '@/contexts/meta/EquipContext'
import { GRADE_COLOR } from '@/types/EquipType'
import { formatPlayTime, formatTimeAgo } from '@/utils/timeUtils'

function rankAccent(rank: number) {
  if (rank === 1) return { bar: 'bg-green-500', text: 'text-green-400' }
  if (rank <= 3) return { bar: 'bg-blue-500', text: 'text-blue-400' }
  return { bar: 'bg-gray-500', text: 'text-gray-300' }
}

function RpDelta({ delta }: { delta: number }) {
  if (delta === 0) return null

  // 상승 빨강(▲), 하락 파랑(▼)
  const rising = delta > 0
  return (
    <span className={`text-xs font-semibold ${rising ? 'text-red-400' : 'text-blue-400'}`}>
      {rising ? '▲' : '▼'}{Math.abs(delta)}
    </span>
  )
}

// 순위 / 시간
function RankInfo({ result, accentText }: { result: BattleResult; accentText: string }) {
  return (
    <div className="flex w-16 shrink-0 flex-col gap-0.5 pl-2">
      <span className={`text-lg font-bold leading-tight ${accentText}`}>#{result.gameRank}</span>
      <span className="text-xs text-gray-400">{formatPlayTime(result.playTime)}</span>
      <span className="text-xs text-gray-500">{formatTimeAgo(result.startDtm)}</span>
    </div>
  )
}

interface CharacterInfoProps {
  characterNum: string;
  level: number;
}

// 캐릭터
function CharacterInfo({ characterNum, level }: CharacterInfoProps) {
  const characterImg = getCharacterImgSrc('MINI', characterNum)

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative">
        <ImageFrame size={54} src={characterImg} isCircle placeholder="캐릭터" />
        <span className="absolute -bottom-0.5 -left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[12px] font-semibold text-white">
          {level}
        </span>
      </div>
    </div>
  )
}

// 무기 + 특성
function WeaponAndTraits({ result, }: { result: BattleResult }) {
  const { findTraitMeta } = useTrait();

  const subTraitMeta = findTraitMeta(result.traitSecondSub[0]);

  const weaponImg = getImgSrc('WEAPON', result.bestWeapon);
  const traitCoreImg = getImgSrc('TRAIT', result.traitFirstCore);
  const traitSubImg = getImgSrc('TRAIT', subTraitMeta?.group_code);
  const tacticalSkillImg = getImgSrc('TACTICAL_SKILL', result.tacticalSkill)

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <div className="grid grid-cols-2 gap-1">
        <ImageFrame size={24} src={weaponImg} alt="무기" isCircle bgColor='bg-gray-600' placeholder="" />
        <ImageFrame size={24} src={traitCoreImg} alt="주 특성" placeholder="" />
        <ImageFrame size={24} src={tacticalSkillImg} alt="전술 스킬" placeholder="" />
        <ImageFrame size={24} src={traitSubImg} alt="보조 특성" placeholder="" />
      </div>
    </div>
  )
}

interface MainStatProps {
  label: string
  value: ReactNode
  /** 컬럼 폭 (Tailwind width 클래스) */
  width?: string
}

// 값(위) / 라벨(아래)
function MainStat({ label, value, width = 'w-24' }: MainStatProps) {
  return (
    <div className={`flex ${width} shrink-0 flex-col gap-0.5`}>
      <span className="flex items-center gap-1 text-base font-bold text-white">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}

// 장비 5칸 (첫 줄 3, 둘째 줄 2)
function EquipmentGrid({ equipments }: { equipments: string[] }) {
  const { findEquipInfo } = useEquip()

  const infos = equipments.map((code) => findEquipInfo(Number(code)))
  const rows = [infos.slice(0, 3), infos.slice(3, 5)]
  
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {row.map((info, colIndex) => (
            <ImageFrame
              key={colIndex}
              height={27}
              width={48}
              src={getImgSrc('EQUIP', info?.code)}
              alt={info?.code.toString()}
              bgColor={info ? GRADE_COLOR[info.itemGrade] : 'bg-gray-700'}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function detailStats(result: BattleResult): DetailStat[] {
  return [
    { label: '시야', value: Math.round(result.viewContribution).toLocaleString() },
    { label: '보안콘솔', value: result.useSecurityConsole },
    { label: '크레딧', value: result.sumGainCredits.toLocaleString() },
    { label: '2낮 1분 크레딧', value: result.targetTimeCredits },
  ]
}

function BattleResultRow({ result }: { result: BattleResult }) {
  const accent = rankAccent(result.gameRank)

  return (
    <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3 overflow-hidden rounded-md bg-gray-700/50 px-4 py-3 md:flex-nowrap md:gap-x-5 md:gap-y-0">
      {/* 좌측 순위 컬러 바 */}
      <div className={`absolute left-0 top-0 h-full w-1.5 ${accent.bar}`} />

      <RankInfo result={result} accentText={accent.text} />
      <CharacterInfo characterNum={result.characterNum} level={result.characterLevel} />
      <WeaponAndTraits result={result} />

      <div className="flex flex-wrap items-center gap-2">
        <MainStat
          label="TK / 제거 / 빈사"
          value={`${result.teamKill} / ${result.teamElimination} / ${result.teamDown}`}
        />
        <MainStat label="딜량" value={result.damageToPlayer.toLocaleString()} width="w-17" />
        <MainStat
          label="RP"
          value={
            <>
              {(result.mmrBefore + result.mmrGain).toLocaleString()}
              <RpDelta delta={result.mmrGain} />
            </>
          }
        />
      </div>

      <DetailStats stats={detailStats(result)} />
      <EquipmentGrid equipments={result.equipments} />
    </div>
  )
}

export function BattleResultTab({ statistics }: { statistics: Statistics }) {
  const { player } = usePlayer()
  const { seasonId } = useSeason()
  const { pageResult, loading, getBattleList, reset } = useBattleResult()
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(statistics.totalGames / BATTLE_PAGE_SIZE)

  useEffect(() => {
    reset()
    setPage(0)
    getBattleList(player.id, seasonId, fromStatistics(statistics), 0)
  }, [player.id, seasonId, statistics])

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    getBattleList(player.id, seasonId, fromStatistics(statistics), nextPage)
  }

  // 최초 로딩(탭/범위 변경)일 때만 로딩 표시, 페이지 이동 중엔 기존 리스트 유지
  if (loading && !pageResult) {
    return <p className="py-4 text-center text-sm text-gray-400">전적을 불러오는 중...</p>
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      {pageResult?.games.map((result) => (
        <BattleResultRow key={result.gameId} result={result} />
      ))}
      <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
    </div>
  )
}
