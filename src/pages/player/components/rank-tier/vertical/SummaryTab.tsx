import { useMemo, useState } from 'react'
import { Statistics, WeaponStat } from '@/types/statistics/StatisticsType'
import { Selector, SelectorOptions } from '@/components/molecules/Selector'
import { getCharacterImgSrc, getImgSrc } from '@/utils/imgSrc'
import { useEquip } from '@/contexts/meta/EquipContext'
import { StatRow, ExpandedTitle } from './StatComponents'

const ALL_VALUE = 'ALL'

export function SummaryTab({ statistics }: { statistics: Statistics }) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>(ALL_VALUE)
  const [selectedWeapon, setSelectedWeapon] = useState<string>(ALL_VALUE)
  const { findEquipInfo } = useEquip()

  const character = useMemo(
    () => statistics.characterList.find((c) => c.characterNum === selectedCharacter),
    [statistics, selectedCharacter]
  )

  // equipWeaponCode 가 있고 해당 EquipInfo 를 찾으면 그 EquipInfo, 아니면 undefined
  const resolveEquip = (weapon: WeaponStat) =>
    weapon.equipWeaponCode != null ? findEquipInfo(Number(weapon.equipWeaponCode)) : undefined

  // Selector option value + 하단 통계 매칭에 함께 쓰는 값
  const weaponValue = (weapon: WeaponStat) => {
    const equip = resolveEquip(weapon)
    return equip ? String(equip.code) : weapon.weaponNum
  }

  const characterOptions = useMemo<SelectorOptions[]>(() => [
    { value: ALL_VALUE, label: '전체' },
    ...[...statistics.characterList]
      .sort((a, b) => b.totalGames - a.totalGames)
      .map((char) => ({
        value: char.characterNum,
        label: char.characterName || char.characterNum,
        imgSrc: getCharacterImgSrc('MINI', char.characterNum),
      })),
  ], [statistics])

  const weaponOptions = useMemo<SelectorOptions[]>(() => {
    if (!character || character.weaponList.length === 0) {
      return [{ value: ALL_VALUE, label: '전체' }]
    }

    const weapons = [...character.weaponList]
      .sort((a, b) => b.totalGames - a.totalGames)
      .map((weapon) => {
        const equip = resolveEquip(weapon)
        return equip
          ? {
            value: String(equip.code),
            label: equip.name || weapon.weaponName || weapon.weaponNum,
            imgSrc: getImgSrc('EQUIP', equip.code),
          }
          : {
            value: weapon.weaponNum,
            label: weapon.weaponName || weapon.weaponNum,
            imgSrc: getImgSrc('WEAPON', weapon.weaponNum),
          }
      })

    // 무기가 하나뿐이면 "전체" 항목은 제외
    return weapons.length === 1
      ? weapons
      : [{ value: ALL_VALUE, label: '전체' }, ...weapons]
  }, [character, findEquipInfo])

  // 캐릭터가 바뀌면 무기 선택 초기화(무기가 하나뿐이면 그 무기를 선택)
  const handleCharacterChange = (value: string) => {
    setSelectedCharacter(value)
    const char = statistics.characterList.find((c) => c.characterNum === value)
    setSelectedWeapon(char?.weaponList.length === 1 ? weaponValue(char.weaponList[0]) : ALL_VALUE)
  }

  // 캐릭터 > 무기 순으로 좁혀 표시할 통계를 결정(없으면 상위 통계)
  const data = useMemo(() => {
    if (!character) return statistics
    return character.weaponList.find((w) => weaponValue(w) === selectedWeapon) ?? character
  }, [statistics, character, selectedWeapon, findEquipInfo])

  return (
    <div className='px-2'>
      <div className='mb-4 flex flex-wrap gap-2'>
        <Selector
          options={characterOptions}
          value={selectedCharacter}
          onChange={handleCharacterChange}
          isUseImg
          width={180}
          backgroundColor='dark'
          maxVisibleOptions={6}
        />
        {character && (
          <Selector
            options={weaponOptions}
            value={selectedWeapon}
            onChange={setSelectedWeapon}
            isUseImg
            width={180}
            backgroundColor='dark'
            maxVisibleOptions={6}
          />
        )}
      </div>
      <div className='mb-5 flex flex-col gap-8 md:flex-row'>
        <div className='flex-1'>
          <ExpandedTitle>생존</ExpandedTitle>
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '게임 수', value: data.totalGames },
              { label: '승률', value: data.winRate, type: 'percent', labelColor: 'text-green-400' },
              { label: 'TOP 2', value: data.top2Rate, type: 'percent', labelColor: 'text-blue-300' },
              { label: 'TOP 3', value: data.top3Rate, type: 'percent', labelColor: 'text-blue-300' },
            ]}
          />
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '평균 순위', value: data.gameRank },
              { label: '생존시간', value: data.playTime, type: 'time', description: '7일차(임시금구) 시작 시간은 20분 40초', labelColor: 'text-orange-300' },
              { label: '후반 생존률', value: data.lateGameRate, type: 'percent', description: '5일차까지 살아남는 비율', labelColor: 'text-orange-300' },
            ]}
          />
        </div>
        <div className='flex-1'>
          <ExpandedTitle>크레딧</ExpandedTitle>
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '크레딧 효율', value: data.creditUsageRate, type: 'percent', description: '전체 크레딧 사용량에서 영웅 재료를 구입하는데 쓰인 크레딧의 비율' },
              { label: '실 크레딧 획득', value: data.gainCredits - data.bountyGainCredits, type: 'round', description: '현상금을 제외한 크레딧' },
              { label: '2낮 1분 크레딧 획득', value: data.targetTimeCredits, type: 'round', labelColor: 'text-orange-300' },
            ]}
          />
        </div>
      </div>
      <div className='mb-5 flex flex-col gap-8 md:flex-row'>
        <div className='flex-1'>
          <ExpandedTitle>시야</ExpandedTitle>
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '시야점수', value: data.viewContribution },
              { label: 'CCTV 작동', value: data.useSecurityConsole },
              { label: '평균 소모 크레딧', value: data.buyViewItemCredits, type: 'round', description: "카메라, 드론 구매에 사용한 크레딧의 평균", labelColor: 'text-blue-300' },
            ]}
          />
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '카메라 설치', value: data.deployCamera },
              { label: '카메라 제거', value: data.removeCamera },
              { label: '카메라 구매', value: data.buyCamera },
            ]}
          />
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '드론 사용', value: data.useReconDrone, },
              { label: '드론 구매', value: data.buyCamera },
            ]}
          />
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: 'EMP드론 사용', value: data.useEmpDrone },
              { label: 'EMP드론 구매', value: data.buyEmpDrone },
            ]}
          />
        </div>
        <div className='flex-1'>
          <ExpandedTitle>교전</ExpandedTitle>
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: 'TK', value: data.teamKill, labelColor: 'text-red-400' },
              { label: '평균 딜량', value: data.damageToPlayer, type: 'round', labelColor: 'text-blue-300' },
            ]}
          />
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '처치', value: data.teamElimination },
              { label: '빈사', value: data.teamDown },
              { label: '1일차 빈사', value: data.teamDownCanNotEliminate },
            ]}
          />
          <StatRow
            className='mb-2'
            columns={4}
            items={[
              { label: '균열 승률', value: data.winDimensionRiftRate, type: 'percent', description: "부전승도 포함", },
              { label: '균열 입장 수', value: data.enterDimensionRiftCount },
              { label: '균열 승리 수', value: data.winDimensionRiftCount },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
