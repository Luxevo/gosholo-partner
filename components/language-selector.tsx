"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage()

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm h-10 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 active:ring-0 focus:outline-none focus-visible:outline-none active:outline-none"
        >
          <span>
            {currentLanguage?.code.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code as 'fr' | 'en')}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{language.code.toUpperCase()}</span>
            {locale === language.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
