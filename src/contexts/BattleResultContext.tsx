import { createContext, useContext, useState, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { BattlePageResponse, BattleResult } from '@/types/battle/BattleType'
import { BattleResultRangeRequest } from '@/types/battle/request/BattleResultRangeRequestType'

export const BATTLE_PAGE_SIZE = 10

interface BattleResultContextValue {
  battleList: BattleResult[]
  pageResult: BattlePageResponse | null
  loading: boolean
  getBattleList: (playerId: number, seasonId: number, request: BattleResultRangeRequest, page: number) => void
  reset: () => void
}

const BattleResultContext = createContext<BattleResultContextValue | null>(null)

export function BattleResultProvider({ children }: { children: ReactNode }) {
  const [pageResult, setPageResult] = useState<BattlePageResponse | null>(null)
  const { loading, execute } = useApi<BattlePageResponse, BattleResultRangeRequest>('battle/range/page')

  const getBattleList = (playerId: number, seasonId: number, request: BattleResultRangeRequest, page: number) => {
    if (!playerId || !seasonId) return

    execute({
      method: 'POST',
      params: {
        playerId: `${playerId}`,
        seasonId: `${seasonId}`,
        page: `${page}`,
        size: `${BATTLE_PAGE_SIZE}`,
      },
      body: request,
      onSuccess: (data) => setPageResult(data),
      onError: (error) => console.error(error),
    })
  }

  const reset = () => setPageResult(null)

  return (
    <BattleResultContext.Provider
      value={{ battleList: pageResult?.games ?? [], pageResult, loading, getBattleList, reset }}
    >
      {children}
    </BattleResultContext.Provider>
  )
}

export function useBattleResult() {
  const ctx = useContext(BattleResultContext)
  if (!ctx) throw new Error('useBattleResult must be used within BattleResultProvider')
  return ctx
}
