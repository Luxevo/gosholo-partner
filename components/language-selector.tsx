"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function LanguageSelector() {
  const { locale, toggleLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-sm"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">
        {locale === 'fr' ? 'EN' : 'FR'}
      </span>
    </Button>
  )
}
