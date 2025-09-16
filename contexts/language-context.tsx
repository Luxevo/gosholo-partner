"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'fr' | 'en'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>('fr')

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('gosholo-locale') as Locale
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
      setLocale(savedLocale)
    }
  }, [])

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('gosholo-locale', locale)
  }, [locale])

  const toggleLanguage = () => {
    setLocale(prev => prev === 'fr' ? 'en' : 'fr')
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
