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

  // Load saved language preference from localStorage or detect system language for auth pages
  useEffect(() => {
    const savedLocale = localStorage.getItem('gosholo-locale') as Locale
    if (savedLocale && (savedLocale === 'fr' || savedLocale === 'en')) {
      // Use saved preference if available
      setLocale(savedLocale)
    } else {
      // Detect system language for first-time users (especially useful for auth pages)
      const systemLanguage = navigator.language || navigator.languages?.[0] || 'fr'
      const detectedLocale = systemLanguage.startsWith('en') ? 'en' : 'fr'
      setLocale(detectedLocale)
      // Save the detected language as the initial preference
      localStorage.setItem('gosholo-locale', detectedLocale)
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
