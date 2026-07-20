import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { SeasonMeta } from '@/types/SeasonType'

interface SeasonContextValue {
  seasonId: number
  setSeasonId: (id: number) => void
  initSeasonId: (latestSeasonId: number) => number

  seasonMetaList: SeasonMeta[]
  nowSeasonMeta: SeasonMeta | undefined
  findSeasonMeta: (seasonId: number) => SeasonMeta | undefined
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [seasonId, setSeasonIdState] = useState<number>(() => {
    const param = searchParams.get('seasonId')
    return param ? parseInt(param) : 0
  })

  const { data: seasonMetaList, execute: getSeasonMeta } = useApi<SeasonMeta[]>('meta/season')

  useEffect(() => {
    getSeasonMeta({
      onError: (error) => console.error(error),
    })
  }, [])

  const setSeasonId = (id: number) => {
    setSeasonIdState(id)
    setSearchParams({ seasonId: `${id}` })
  }

  const initSeasonId = (latestSeasonId: number) => {
    if (seasonId != 0) return seasonId;

    setSeasonIdState(latestSeasonId)

    return latestSeasonId;
  }

  const findSeasonMeta = (seasonId: number): SeasonMeta | undefined => {
    if (!seasonMetaList) return
    return seasonMetaList.find((meta) => meta.seasonId === seasonId)
  }

  const nowSeasonMeta = useMemo(
    () => (seasonId === 0 ? undefined : seasonMetaList?.find((meta) => meta.seasonId === seasonId)),
    [seasonId, seasonMetaList]
  )

  return (
    <SeasonContext.Provider
      value={{
        seasonId,
        setSeasonId,
        initSeasonId,
        seasonMetaList: seasonMetaList ?? [],
        nowSeasonMeta,
        findSeasonMeta,
      }}
    >
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within SeasonProvider')
  return ctx
}
