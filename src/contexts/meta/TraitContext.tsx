import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { TraitMeta } from '@/types/TraitType'

interface TraitContextValue {
  traitMetaList: TraitMeta[]
  findTraitMeta: (code: string) => TraitMeta | undefined
  findTraitMetasByGroup: (groupCode: string) => TraitMeta[]
}

const TraitContext = createContext<TraitContextValue | null>(null)

export function TraitProvider({ children }: { children: ReactNode }) {
  const { data: traitMetaList, execute: getTraitMeta } = useApi<TraitMeta[]>('meta/trait')

  useEffect(() => {
    getTraitMeta({
      onError: (error) => console.error(error),
    })
  }, [])

  const findTraitMeta = (code: string): TraitMeta | undefined => {
    if (!traitMetaList) return
    return traitMetaList.find((meta) => meta.code == code)
  }

  const findTraitMetasByGroup = (groupCode: string): TraitMeta[] => {
    if (!traitMetaList) return []
    return traitMetaList.filter((meta) => meta.group_code == groupCode)
  }

  return (
    <TraitContext.Provider
      value={{
        traitMetaList: traitMetaList ?? [],
        findTraitMeta,
        findTraitMetasByGroup,
      }}
    >
      {children}
    </TraitContext.Provider>
  )
}

export function useTrait() {
  const ctx = useContext(TraitContext)
  if (!ctx) throw new Error('useTrait must be used within TraitProvider')
  return ctx
}
