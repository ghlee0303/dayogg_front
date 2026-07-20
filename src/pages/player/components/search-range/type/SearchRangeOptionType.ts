import { type SelectorOptions } from '@/components/molecules/Selector'
import { TierEnum, TierRangeMap } from '@/types/TierType'
import { ResponseSide, Statistics } from '@/types/statistics/StatisticsType'
import { RequestSide } from '@/types/statistics/request/StatisticsRangeRequestType'
import { formatDateMMDD } from '@/utils/timeUtils'

export type RangeSideEnum = 'START' | 'END'

export interface Bound {
  min: number
  max: number
}

export interface SearchRangeLimit {
  lowestMmr: number
  lowestTier: TierEnum
  highestMmr: number
  highestTier: TierEnum
  tierEnumList: TierEnum[]
  tierBound: Record<TierEnum, Bound>
}

const fromResponseSideToBound = (range: Record<RangeSideEnum, ResponseSide>): Bound => {
  return {
    min: range.START.mmr,
    max: range.END.mmr
  }
}

export const fromSeasonTotalToRangeLimit = (seasonTotal: Statistics.SeasonTotal): SearchRangeLimit => {
  const tierEnumSet = new Set<TierEnum>()
  const tierBound = {} as Record<TierEnum, Bound>

  for (const [tierEnum, range] of Object.entries(seasonTotal.totalRange) as [TierEnum, Record<RangeSideEnum, ResponseSide>][]) {
    tierEnumSet.add(tierEnum)
    tierBound[tierEnum] = fromResponseSideToBound(range)
  }

  return {
    lowestMmr: seasonTotal.range.START.mmr,
    lowestTier: seasonTotal.range.START.tierEnum,
    highestMmr: seasonTotal.range.END.mmr,
    highestTier: seasonTotal.range.END.tierEnum,
    tierEnumList: [...tierEnumSet],
    tierBound
  }
}

export interface RangeEndpoint {
  tierEnum: TierEnum
  mmr?: number
  date?: string
}

export interface SearchRangeOption {
  label: string
  isLabelManual?: boolean
  range: Record<RangeSideEnum, RangeEndpoint>
}

export const LABEL_MAX_LENGTH = 20

export const DEFAULT_PRESETS: SearchRangeOption[] = [
  {
    label: '1',
    range: {
      START: { mmr: 100, tierEnum: 'IRON' },
      END: { mmr: 8300, tierEnum: 'IRON' }
    }
  },
]

const resolveEndpointText = (
  endpoint: RangeEndpoint,
  tierRangeMap: TierRangeMap,
): string => {
  if (endpoint.tierEnum) return tierRangeMap[endpoint.tierEnum].label ?? endpoint.tierEnum
  if (endpoint.mmr !== undefined) return `${endpoint.mmr}`
  return ''
}

const joinRange = (start: string, end: string, separator: string): string =>
  start === end ? start : `${start}${separator}${end}`

export const buildOptionLabel = (
  option: SearchRangeOption,
  tierRangeMap: TierRangeMap,
): string => {
  const startText = resolveEndpointText(option.range.START, tierRangeMap)
  const endText = resolveEndpointText(option.range.END, tierRangeMap)

  const mmrPart = joinRange(startText, endText, '-')

  const startDate = formatDateMMDD(option.range.START.date)
  const endDate = formatDateMMDD(option.range.END.date)
  if (!startDate && !endDate) return mmrPart

  return `${mmrPart} | ${joinRange(startDate, endDate, '~')}`
}

export function buildTierOptions(
  targetTierEnumList: TierEnum[],
  tierRangeMap: TierRangeMap,
): SelectorOptions[] {
  const options: SelectorOptions[] = []

  for (const tierEnum of targetTierEnumList) {
    if (tierEnum === 'UNRANK') continue

    options.push({
      value: tierEnum,
      label: tierRangeMap[tierEnum].label ?? tierEnum,
    })
  }

  return options
}

export const createNewOption = (
  limit: SearchRangeLimit,
  tierRangeMap: TierRangeMap,
): SearchRangeOption => {
  const option: SearchRangeOption = {
    label: '',
    range: {
      START: { mmr: limit.lowestMmr, tierEnum: limit.lowestTier },
      END: { mmr: limit.highestMmr, tierEnum: limit.highestTier },
    },
  }

  option.label = buildOptionLabel(option, tierRangeMap)
  return option
}

const fromRequestSide = (request: RequestSide): RangeEndpoint => {
  return {
    tierEnum: request.tierEnum,
    mmr: request.mmr,
    date: request.date
  }
}

const fromResponseSide = (response: ResponseSide): RangeEndpoint => {
  return {
    tierEnum: response.tierEnum,
    mmr: response.mmr
  }
}

export const fromStatistics = (stat: Statistics): SearchRangeOption | null => {
  switch (stat.type) {
    case 'SEASON_TOTAL':
      return {
        label: "전체",
        range: {
          START: fromResponseSide(stat.range.START),
          END: fromResponseSide(stat.range.END),
        },
      }
    case 'TIER': {
      return {
        label: stat.label,
        range: {
          START: stat.request ? fromRequestSide(stat.request.START) : fromResponseSide(stat.range.START),
          END: stat.request ? fromRequestSide(stat.request.END) : fromResponseSide(stat.range.END),
        },
      }
    }
    case 'RANGE':
      return {
        label: stat.label,
        range: {
          START: stat.request ? fromRequestSide(stat.request.START) : fromResponseSide(stat.range.START),
          END: stat.request ? fromRequestSide(stat.request.END) : fromResponseSide(stat.range.END),
        },
      }
  }
}

/**
 * 변경값을 option에 머지만 한다. label 외에는 어떤 파생도 책임지지 않음.
 * mmr↔tier 같은 상호 영향은 저장값(options)에 반영하지 않고, MmrRange의 표시 계산에서만 처리.
 */
export const applyOptionChanges = (
  option: SearchRangeOption,
  changes: Partial<SearchRangeOption>,
  tierRangeMap: TierRangeMap,
): SearchRangeOption => {
  const merged = { ...option, ...changes }

  const isManual =
    changes.label !== undefined
      ? changes.label !== ''
      : merged.isLabelManual ?? false

  return {
    ...merged,
    isLabelManual: isManual,
    label: isManual ? merged.label : buildOptionLabel(merged, tierRangeMap),
  }
}
