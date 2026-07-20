import { useMemo, useState } from 'react'
import { useTierRange } from '@/contexts/meta/TierRangeContext'
import { type SelectorOptions } from '@/components/molecules/Selector'
import {
  type RangeEndpoint,
  type RangeSideEnum,
  type SearchRangeLimit,
  type SearchRangeOption,
  applyOptionChanges,
  buildTierOptions,
  createNewOption,
} from "@/pages/player/components/search-range/type/SearchRangeOptionType"
import { isTopTier, TierEnum, TierRange } from '@/types/TierType'

const resolveMmr = (
  side: RangeSideEnum,
  range: TierRange
): number | undefined => {
  const tier = range.tierEnum;
  
  if (tier === 'MITHRIL') return side === 'START' ? range.start : undefined
  if (!isTopTier(tier)) return side === 'START' ? range.start : range.end

  return undefined
}

export function useSearchRangeOptions(
  initialOptions: SearchRangeOption[],
  limit: SearchRangeLimit,
) {
  const { tierRangeMap, findTierRangeByMmr, findTierRangeByTierEnum } = useTierRange()

  const [options, setOptions] = useState<SearchRangeOption[]>(initialOptions)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    initialOptions.length > 0 ? 0 : null,
  )

  const selected = selectedIndex !== null ? options[selectedIndex] : null

  const tierOptions = useMemo<SelectorOptions[]>(
    () => buildTierOptions(limit.tierEnumList, tierRangeMap),
    [tierRangeMap, limit],
  )

  const mutateSelected = (mutate: (opt: SearchRangeOption) => SearchRangeOption) => {
    if (selectedIndex === null) return

    setOptions((prev) =>
      prev.map((opt, i) => (i === selectedIndex ? mutate(opt) : opt)),
    )
  }

  const updateSelected = (changes: Partial<SearchRangeOption>) =>
    mutateSelected((opt) => applyOptionChanges(opt, changes, tierRangeMap))

  const updateRange = (side: RangeSideEnum, changes: Partial<RangeEndpoint>) =>
    mutateSelected((opt) => {

      const mergedSide = { ...opt.range[side], ...resolveEndpoint(side, changes) }

      const range: Record<RangeSideEnum, RangeEndpoint> =
        side === 'START'
          ? { ...opt.range, START: mergedSide }
          : { ...opt.range, END: mergedSide }

      return applyOptionChanges(opt, { range }, tierRangeMap)
    })

  const resolveEndpoint = (side: RangeSideEnum, changes: Partial<RangeEndpoint>): Partial<RangeEndpoint> => {
    if (changes.mmr) {
      const tierRange = findTierRangeByMmr(changes.mmr);

      return {
        ...changes,
        tierEnum: isTopTier(tierRange.tierEnum) ? 'MITHRIL' : tierRange.tierEnum
      }
    }

    if (changes.tierEnum) {
      const tierRange = findTierRangeByTierEnum(changes.tierEnum);

      return {
        ...changes,
        mmr: resolveMmr(side, tierRange),
      }
    }

    return changes;
  }

  const addOption = () => {
    setOptions([...options, createNewOption(limit, tierRangeMap)])
  }

  const deleteOption = (index: number) => {
    const next = options.filter((_, i) => i !== index)
    setOptions(next)
    if (selectedIndex === null) return
    if (next.length === 0) setSelectedIndex(null)
    else if (index < selectedIndex) setSelectedIndex(selectedIndex - 1)
    else if (index === selectedIndex) setSelectedIndex(Math.min(selectedIndex, next.length - 1))
  }

  return {
    options,
    selected,
    selectedIndex,
    tierOptions,
    selectOption: setSelectedIndex,
    addOption,
    deleteOption,
    updateSelected,
    updateRange,
  }
}
