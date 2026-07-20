import { RangeSideEnum } from "@/pages/player/components/search-range/type/SearchRangeOptionType";
import { ResponseSide, Statistics } from "@/types/statistics/StatisticsType";
import { TierEnum } from "@/types/TierType";

export interface BattleResultRangeRequest {
  range: Record<RangeSideEnum, RequestSide>
}

export interface RequestSide {
  tierEnum: TierEnum
  mmr?: number
  date?: string
}

const toRequestSide = (side: ResponseSide): RequestSide => {
  return {
    tierEnum: side.tierEnum,
    mmr: side.mmr,
    date: side.dateTime,
  }
}

export const fromStatistics = (stat: Statistics): BattleResultRangeRequest => ({
  range: {
    START: toRequestSide(stat.range.START),
    END: toRequestSide(stat.range.END),
  },
})
