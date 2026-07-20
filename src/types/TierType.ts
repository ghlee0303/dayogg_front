
export interface TierRange {
  start: number
  end: number
  step: number
  gap: number
  tierEnum: TierEnum
  label?: string
}

export type TierEnum = 'UNRANK' | 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'METEORITE' | 'MITHRIL' | 'DEMIGOD' | 'ETERNITY'

export type TierRangeMap = Record<TierEnum, TierRange>

export const findTierByRange = (
  tierRangeMap: Partial<TierRangeMap> | undefined,
  startMmr: number,
  endMmr: number,
): TierEnum | null => {
  if (!tierRangeMap) return null

  if (!tierRangeMap.DEMIGOD || !tierRangeMap.ETERNITY) {
    const mithril = tierRangeMap.MITHRIL
    if (mithril && startMmr >= mithril.start) return 'MITHRIL'
  }

  const found = Object.entries(tierRangeMap).find(
    ([, range]) => startMmr >= range.start && endMmr <= range.end
  )
  return (found?.[0] as TierEnum) ?? null
}

export const isTopTier = (tier: TierEnum | null | undefined): boolean =>
  tier === 'DEMIGOD' || tier === 'ETERNITY'