import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react'
import { useApi } from '@/hooks/useApi'
import { EquipInfo } from '@/types/EquipType'
import { useLocalizedName } from '@/hooks/useLocalizedName'

// 백엔드 Map<Integer, EquipInfo> → JSON 객체 (키는 문자열)
type EquipInfoMap = Record<string, EquipInfo>

interface EquipContextValue {
  equipInfoMap: EquipInfoMap
  findEquipInfo: (code: number) => EquipInfo | undefined
}

const EquipContext = createContext<EquipContextValue | null>(null)

export function EquipProvider({ children }: { children: ReactNode }) {
  const { data: equipInfoMap, execute: getEquipInfo } = useApi<EquipInfoMap>('meta/equip')
  const equipLocalizer = useLocalizedName("EQUIP")

  useEffect(() => {
    getEquipInfo({
      onError: (error) => console.error(error),
    })
  }, [])

  // 캐시된 원본을 건드리지 않도록 지역화된 name 을 입힌 사본을 반환
  const findEquipInfo = useCallback((code: number): EquipInfo | undefined => {
    const info = equipInfoMap?.[code]
    
    if (!info) return undefined

    return { ...info, name: equipLocalizer(String(code)) }
  }, [equipInfoMap, equipLocalizer])

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
