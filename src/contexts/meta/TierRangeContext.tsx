import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { TierEnum, TierRange, TierRangeMap } from '@/types/TierType'
import { useLocalizedName } from '@/hooks/useLocalizedName'
import { useSeason } from './SeasonContext'

interface TierRangeContextValue {
  tierRangeMap: TierRangeMap,
  getTierRange: (seasonId: number, dateTime?: string) => void
  findTierRangeByMmr: (mmr: number) => TierRange
  findTierRangeByTierEnum: (tierEnum: TierEnum) => TierRange
}

const TierRangeContext = createContext<TierRangeContextValue | null>(null)

function localizeTierRangeMap(
  data: TierRangeMap,
  tierLocalizer: (key: string) => string
): TierRangeMap {
  const result = {} as TierRangeMap

  for (const [tierKey, meta] of Object.entries(data) as [TierEnum, TierRange][]) {
    result[tierKey] = {
      ...meta,
      label: tierLocalizer(tierKey),
    }
  }

  return result
}

export function TierRangeProvider({ children }: { children: ReactNode }) {
  const { data, execute } = useApi<TierRangeMap>('tier/range')
  const { seasonId } = useSeason();
  const [localized, setLocalized] = useState<TierRangeMap>({} as TierRangeMap)
  const tierLocalizer = useLocalizedName("TIER")

  const getTierRange = (seasonId: number, dateTime?: string) => {
    execute({
      params: {
        seasonId: seasonId,
        dateTime: dateTime,
      },
      onError: (error) => console.error(error),
    })
  }

  const findTierRangeByMmr = (mmr: number): TierRange => {
    for (const range of Object.values(localized)) {
      if (mmr >= range.start && mmr <= range.end) return range
    }

    return localized["UNRANK"];
  }

  const findTierRangeByTierEnum = (tierEnum: TierEnum): TierRange => {
    return localized[tierEnum] ?? localized["UNRANK"]
  }

  useEffect(() => {
    if (!seasonId) return;

    getTierRange(seasonId)
  }, [seasonId])

  useEffect(() => {
    if (!data) return
    setLocalized(localizeTierRangeMap(data, tierLocalizer))
  }, [data, tierLocalizer])

  return (
    <TierRangeContext.Provider value={{ tierRangeMap: localized, getTierRange, findTierRangeByMmr, findTierRangeByTierEnum }}>
      {children}
    </TierRangeContext.Provider>
  )
}

export function useTierRange() {
  const ctx = useContext(TierRangeContext)
  if (!ctx) throw new Error('useTierRange must be used within TierRangeProvider')
  return ctx
}
