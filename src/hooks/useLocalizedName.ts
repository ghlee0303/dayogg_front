import { useCallback } from 'react'
import { useLocale, type LocaleEnums } from '@/contexts/meta/LocaleContext'

export function useLocalizedName(category: LocaleEnums) {
  const { locale } = useLocale()

  const map = locale?.[category]

  return useCallback((key: string) => map?.[key] ?? key, [map])
}
