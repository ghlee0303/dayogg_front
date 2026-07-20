import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { EquipInfo } from '@/types/EquipType'

// 백엔드 Map<Integer, EquipInfo> → JSON 객체 (키는 문자열)
type EquipInfoMap = Record<string, EquipInfo>

interface EquipContextValue {
  equipInfoMap: EquipInfoMap
  findEquipInfo: (code: number) => EquipInfo | undefined
}

const EquipContext = createContext<EquipContextValue | null>(null)

export function EquipProvider({ children }: { children: ReactNode }) {
  const { data: equipInfoMap, execute: getEquipInfo } = useApi<EquipInfoMap>('meta/equip')

  useEffect(() => {
    getEquipInfo({
      onError: (error) => console.error(error),
    })
  }, [])

  const findEquipInfo = (code: number): EquipInfo | undefined => {
    return equipInfoMap?.[code]
  }

  return (
    <EquipContext.Provider
      value={{
        equipInfoMap: equipInfoMap ?? {},
        findEquipInfo,
      }}
    >
      {children}
    </EquipContext.Provider>
  )
}

export function useEquip() {
  const ctx = useContext(EquipContext)
  if (!ctx) throw new Error('useEquip must be used within EquipProvider')
  return ctx
}
