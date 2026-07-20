import { TierEnum } from '../TierType'

// 백엔드 BattlePageResult record 대응
export interface BattlePageResponse {
  games: BattleResult[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface BattleResult {
  playerId: number
  gameId: number
  seasonId: number
  tierEnum: TierEnum

  characterNum: string           // 캐릭터
  skinCode: string               // 스킨
  characterLevel: number         // 레벨
  bestWeapon: string             // 주 사용 무기
  bestWeaponLevel: number        // 무기 숙련도

  gameRank: number               // 최종 순위
  teamKill: number               // TK
  viewContribution: number       // 시야 점수
  isLateGame: boolean            // 후반게임 생존 여부: 5일차 까지

  mmrBefore: number              // 게임 전 랭크 점수
  mmrGain: number                // 랭크 점수 획득량
  playTime: number               // 게임 시간 (초)
  startDtm: string               // 게임 시작 시각 (ISO LocalDateTime)

  damageToPlayer: number         // 총 가한 데미지

  sumGainCredits: number         // 총 획득 크레딧
  targetTimeCredits: number      // 지정한 시간까지 모은 크레딧 (시즌 11기준 2낮 1분 -> 5분 10초 전 까지)

  useSecurityConsole: number     // 보안콘솔 사용 횟수

  teamElimination: number            // 제거
  teamDown: number                   // 빈사
  teamDownCanNotEliminate: number    // 사출방지(1일차) 빈사
  teamDownCanEliminate: number       // 사출방지(1일차) 이후 빈사
  
  traitFirstCore: string
  traitFirstSub: string[]
  traitSecondSub: string[]

  tacticalSkill: string

  equipments: string[]
}
