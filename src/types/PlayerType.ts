import { SelectorOptions } from "@/components/molecules/Selector"
import { TierEnum } from "./TierType"

export interface PlayerResponse {
  player: Player
  seasonList: PlayerSeason[]
  status: "OK" | "CONTINUE"
  latestSeasonId: number
}

export interface Player {
  id: number
  searchId: string
  name: string
  level: number
  lastSearchTime: string
}

export interface PlayerSeason {
  seasonId: number
  mmr: number
  rank: number
  serverRank: number
  serverEnum: string
}

export interface PlayerSeasonDetail {
  seasonId: number
  mmr: number
  rank: number
  serverRank: number
  serverEnum: string
  tierEnum: TierEnum
  mostCharacterNum: number      // 모스트 캐릭터
  latestSkinCode: number        // 최근 사용 스킨
}

export const toSeasonOptions = (
  seasonList: PlayerSeason[],
  seasonLocale?: Record<string, string>
): SelectorOptions[] => {
  return seasonList.map((season) => {
    const seasonId = season.seasonId.toString()
    const seasonName = seasonLocale?.[seasonId] ?? seasonId
    
    return { value: seasonId, label: seasonName }
  })
}