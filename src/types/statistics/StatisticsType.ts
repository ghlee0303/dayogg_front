import { SelectorOptions } from "@/components/molecules/Selector";
import { TierEnum } from "../TierType";
import { RangeSideEnum } from "@/pages/player/components/search-range/type/SearchRangeOptionType";
import { RequestSide } from "./request/StatisticsRangeRequestType";

export interface Average {
  // 누적
  sumMmrGain: number;
  totalGames: number;
  wins: number;
  top2: number;
  top3: number;

  preMadeGameCount: number;
  enterDimensionRiftCount: number;
  winDimensionRiftCount: number;

  // 평균
  winRate: number;
  top2Rate: number;
  top3Rate: number;
  avgMmrGain: number;
  winDimensionRiftRate: number;
  lateGameRate: number;
  creditUsageRate: number;

  gameRank: number;
  teamKill: number;
  monsterKill: number;
  viewContribution: number;
  playTime: number;

  damageToPlayer: number;
  damageFromPlayer: number;

  gainCredits: number;
  bountyGainCredits: number;
  usedCredits: number;
  usedEpicMaterialCredits: number;
  buyViewItemCredits: number;
  targetTimeCredits: number;

  useSecurityConsole: number;
  deployCamera: number;
  removeCamera: number;
  buyCamera: number;
  useReconDrone: number;
  buyReconDrone: number;
  useEmpDrone: number;
  buyEmpDrone: number;

  teamElimination: number;
  teamDown: number;
  teamDownCanNotEliminate: number;
  teamDownCanEliminate: number;
}

interface BaseStatistics extends Average {
  characterList: CharacterStat[];
  totalGames: number;
  wins: number;
  label: string;
  range: Record<RangeSideEnum, ResponseSide>;
}

export interface ResponseSide {
  dateTime: string;
  mmr: number;
  tierEnum: TierEnum;
  tierLabel?: string;
}

export interface SeasonTotalStatistics extends BaseStatistics {
  type: 'SEASON_TOTAL';
  tierEnum: TierEnum;
  mmr: number;
  totalRank: number;
  serverRank: number;
  serverName: string;
  totalRange: Partial<Record<TierEnum, Record<RangeSideEnum, ResponseSide>>>;
}

export interface TierStatistics extends BaseStatistics {
  type: 'TIER';
  tierEnum: TierEnum;
  request?: Record<RangeSideEnum, RequestSide>;
}

export interface RangeStatistics extends BaseStatistics {
  type: 'RANGE';
  request: Record<RangeSideEnum, RequestSide>;
}

export type Statistics =
  | SeasonTotalStatistics
  | TierStatistics
  | RangeStatistics;

export interface CharacterStat extends Average {
  characterNum: string
  characterName?: string
  weaponNum?: string
  weaponName?: string
  weaponList: WeaponStat[];
}

export interface WeaponStat extends Average {
  weaponNum: string
  equipWeaponCode: string
  weaponName?: string
}

export const toStatisticsOptions = (
  statList: Statistics[]
): SelectorOptions[] => {

  return statList.map((stat, index) =>
    stat.type === "SEASON_TOTAL"
      ? { value: 'SEASON_TOTAL', label: '전체' }
      : { value: String(index), label: stat.label }
  );
}

export const toCharacterOptions = (
  stat: Statistics
): SelectorOptions[] => {
  return stat.characterList.map((char) => ({
    value: char.characterNum,
    label: char.characterName || char.characterNum
  }))
}

export const getMostCharacterList = (
  stat: Statistics
): CharacterStat[] => {
  return [...stat.characterList]
    .sort((a, b) => b.totalGames - a.totalGames)
    .slice(0, 3)
}

export const toCharacterList = (
  stat: Statistics,
  isWeapon: boolean
): CharacterStat[] => {
  const characterList = [...stat.characterList].sort((a, b) => b.totalGames - a.totalGames);

  if (!isWeapon) {
    return characterList;
  }

  return characterList.flatMap((char) =>
    char.weaponList.map((weapon) => ({
      ...weapon,
      characterNum: char.characterNum,
      characterName: char.characterName,
      weaponNum: weapon.weaponNum,
      weaponName: weapon.weaponName,
      weaponList: [],
    }))
  )
}