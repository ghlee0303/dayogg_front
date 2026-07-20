import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { CharacterStat, WeaponStat, Statistics, ResponseSide } from '@/types/statistics/StatisticsType'
import { useLocalizedName } from '@/hooks/useLocalizedName'
import { StatisticsRangeRequest } from '@/types/statistics/request/StatisticsRangeRequestType'

interface StatisticsContextValue {
  statistics: Statistics[]
  getSeasonStatistics: (playerId: number, seasonId: number) => void
  getStatisticsByRange: (playerId: number, seasonId: number, requestList: StatisticsRangeRequest[]) => void
  reset: () => void
}

const StatisticsContext = createContext<StatisticsContextValue | null>(null)

function localizeCharacter(
  stat: Statistics,
  characterLocalizer: (key: string) => string,
  weaponLocalizer: (key: string) => string,
): CharacterStat[] {
  const characterList: CharacterStat[] = []

  for (const char of stat.characterList) {
    const weaponList = localizeWeapon(char, weaponLocalizer);

    characterList.push({
      ...char,
      characterName: characterLocalizer(char.characterNum),
      weaponList,
    })
  }

  return characterList;
}

function localizeWeapon(
  character: CharacterStat,
  weaponLocalizer: (key: string) => string,
): WeaponStat[] {
  const weaponList: WeaponStat[] = []

  for (const weapon of character.weaponList) {
    weaponList.push({
      ...weapon,
      weaponName: weaponLocalizer(weapon.weaponNum),
    })
  }

  return weaponList;
}

function localizeResponseSide(
  side: ResponseSide,
  tierLocalizer: (key: string) => string,
): ResponseSide {
  return {
    ...side,
    tierLabel: tierLocalizer(side.tierEnum)
  }
}

function localizeStatistics(
  data: Statistics[],
  tierLocalizer: (key: string) => string,
  characterLocalizer: (key: string) => string,
  weaponLocalizer: (key: string) => string,
): Statistics[] {
  const result: Statistics[] = []

  for (const stat of data) {
    result.push({
      ...stat,
      label: tierLocalizer(stat.label),
      characterList: localizeCharacter(stat, characterLocalizer, weaponLocalizer),
      range: {
        START: localizeResponseSide(stat.range.START, tierLocalizer),
        END: localizeResponseSide(stat.range.END, tierLocalizer),
      }
    })
  }

  return result
}

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const { data, execute } = useApi<Statistics[]>('statistics/:type')
  const [localized, setLocalized] = useState<Statistics[]>([])
  const tierLocalizer = useLocalizedName("TIER")
  const characterLocalizer = useLocalizedName("CHARACTER")
  const weaponLocalizer = useLocalizedName("WEAPON")

  useEffect(() => {
    if (!data) return
    setLocalized(localizeStatistics(data, tierLocalizer, characterLocalizer, weaponLocalizer))
  }, [data, tierLocalizer, characterLocalizer, weaponLocalizer])

  const getSeasonStatistics = (playerId: number, seasonId: number) => {
    if (!playerId || !seasonId) return

    execute({
      urlParams: ['season'],
      params: {
        playerId: `${playerId}`,
        seasonId: `${seasonId}`,
      },
      onSuccess: (value) => console.log(value),
      onError: (error) => console.error(error),
    })
  }

  const getStatisticsByRange = (
    playerId: number,
    seasonId: number,
    requestList: StatisticsRangeRequest[]
  ) => {

    execute({
      method: "POST",
      urlParams: ['range'],
      params: {
        playerId: `${playerId}`,
        seasonId: `${seasonId}`,
      },
      body: requestList,
      onSuccess: (value) => console.log(value),
      onError: (error) => console.error(error),
    })
  }

  const reset = () => setLocalized([])

  return (
    <StatisticsContext.Provider value={{ statistics: localized, getSeasonStatistics, getStatisticsByRange, reset }}>
      {children}
    </StatisticsContext.Provider>
  )
}

export function useStatistics() {
  const ctx = useContext(StatisticsContext)
  if (!ctx) throw new Error('useStatistics must be used within StatisticsProvider')
  return ctx
}
