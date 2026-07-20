import { useApi } from '@/hooks/useApi';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Language = 'KO' | 'EN'

interface LocaleContextValue {
  locale: Locale | null
  language: Language
  handleLanguageChange: (language: Language) => void
  getLocale: (language: Language) => void
}

export type LocaleEnums = "SKIN" | "CHARACTER" | "WEAPON" | "TIER" | "SEASON";

export type Locale = {
    [key in LocaleEnums]?: Record<string, string>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { data: locale, execute } = useApi<Locale>('meta/locale')
  const [language, setLanguage] = useState<Language>('KO')

  const getLocale = (language: Language) => {
    execute({
      params: {
        hl: language,
      },
      onError: (error) => console.error(error),
    })
  }

  useEffect(() => {
    getLocale(language)
  }, [])

  const handleLanguageChange = (language: Language) => {
    setLanguage(language)
    getLocale(language) // Fetch locale data for the selected language
  }

  return (
    <LocaleContext.Provider value={{ locale, language, handleLanguageChange, getLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
