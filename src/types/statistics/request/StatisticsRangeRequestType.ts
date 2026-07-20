import { RangeEndpoint, RangeSideEnum, SearchRangeOption } from "@/pages/player/components/search-range/type/SearchRangeOptionType";
import { TierEnum } from "@/types/TierType";

export interface StatisticsRangeRequest {
  label: string
  range: Record<RangeSideEnum, RequestSide>
}

export interface RequestSide {
  tierEnum: TierEnum
  mmr?: number
  date?: string
}

const toRequestSide = (endpoint: RangeEndpoint): RequestSide => {
  return { 
    tierEnum: endpoint.tierEnum, 
    mmr: endpoint.mmr,
    date: endpoint.date 
  }
}

export const fromSearchRangeOptions = (
  options: SearchRangeOption[],
): StatisticsRangeRequest[] =>
  options.map((option) => ({
    label: option.label,
    range: {
      START: toRequestSide(option.range.START),
      END: toRequestSide(option.range.END),
    },
  }))
