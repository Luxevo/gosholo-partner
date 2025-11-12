"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, X, Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export interface SpecialHour {
  id: string // Temporary ID for UI (will be replaced by DB ID on save)
  date: string // YYYY-MM-DD format
  open_time: string
  close_time: string
  is_closed: boolean
  label_fr: string
  label_en: string
}

interface SpecialHoursEditorProps {
  specialHours: SpecialHour[]
  onChange: (hours: SpecialHour[]) => void
}

// Common holiday suggestions
const COMMON_HOLIDAYS = [
  { label_fr: "Noël", label_en: "Christmas", typical_date: "-12-25" },
  { label_fr: "Jour de l'an", label_en: "New Year's Day", typical_date: "-01-01" },
  { label_fr: "Fête du travail", label_en: "Labour Day", typical_date: "-05-01" },
  { label_fr: "Fête nationale", label_en: "Bastille Day", typical_date: "-07-14" },
  { label_fr: "Vacances d'été", label_en: "Summer Vacation", typical_date: "" },
  { label_fr: "Inventaire annuel", label_en: "Annual Inventory", typical_date: "" },
]

export default function SpecialHoursEditor({ specialHours, onChange }: SpecialHoursEditorProps) {
  const { locale } = useLanguage()
  const [showSuggestions, setShowSuggestions] = useState(true)

  const addSpecialHour = (preset?: { label_fr: string; label_en: string; typical_date: string }) => {
    const today = new Date()
    const year = today.getFullYear()
    const defaultDate = preset?.typical_date
      ? `${year}${preset.typical_date}`
      : today.toISOString().split('T')[0]

    const newHour: SpecialHour = {
      id: `temp-${Date.now()}`,
      date: defaultDate,
      open_time: "",
      close_time: "",
      is_closed: true,
      label_fr: preset?.label_fr || "",
      label_en: preset?.label_en || ""
    }

    onChange([...specialHours, newHour])
    setShowSuggestions(false)
  }

  const updateSpecialHour = (id: string, updates: Partial<SpecialHour>) => {
    onChange(
      specialHours.map(hour =>
        hour.id === id ? { ...hour, ...updates } : hour
      )
    )
  }

  const removeSpecialHour = (id: string) => {
    onChange(specialHours.filter(hour => hour.id !== id))
    if (specialHours.length === 1) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-primary">
            {locale === 'fr' ? 'Horaires spéciaux' : 'Special Hours'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === 'fr'
              ? 'Jours fériés, vacances ou horaires exceptionnels'
              : 'Holidays, vacations, or exceptional hours'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSpecialHour()}
        >
          <Plus className="h-4 w-4 mr-1" />
          {locale === 'fr' ? 'Ajouter' : 'Add'}
        </Button>
      </div>

      {/* Common holiday suggestions */}
      {showSuggestions && specialHours.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900 mb-2">
            {locale === 'fr' ? 'Suggestions rapides :' : 'Quick suggestions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_HOLIDAYS.map((holiday, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => addSpecialHour(holiday)}
              >
                {locale === 'fr' ? holiday.label_fr : holiday.label_en}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Special hours list */}
      {specialHours.length > 0 && (
        <div className="space-y-3">
          {specialHours.map((hour) => (
            <div
              key={hour.id}
              className="border rounded-lg p-4 space-y-3 bg-white"
            >
              {/* Header with delete button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {locale === 'fr' ? 'Date spéciale' : 'Special Date'}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSpecialHour(hour.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Date picker */}
              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  {locale === 'fr' ? 'Date' : 'Date'} *
                </label>
                <Input
                  type="date"
                  value={hour.date}
                  onChange={(e) => updateSpecialHour(hour.id, { date: e.target.value })}
                  className="text-sm"
                  required
                />
              </div>

              {/* Labels (bilingual) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-primary mb-1">
                    {locale === 'fr' ? 'Raison (Français)' : 'Reason (French)'}
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Noël"
                    value={hour.label_fr}
                    onChange={(e) => updateSpecialHour(hour.id, { label_fr: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary mb-1">
                    {locale === 'fr' ? 'Raison (Anglais)' : 'Reason (English)'}
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Christmas"
                    value={hour.label_en}
                    onChange={(e) => updateSpecialHour(hour.id, { label_en: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Closed checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`closed-${hour.id}`}
                  checked={hour.is_closed}
                  onCheckedChange={(checked) =>
                    updateSpecialHour(hour.id, { is_closed: checked as boolean })
                  }
                />
                <label
                  htmlFor={`closed-${hour.id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {locale === 'fr' ? 'Fermé toute la journée' : 'Closed all day'}
                </label>
              </div>

              {/* Time inputs (only if not closed) */}
              {!hour.is_closed && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-primary mb-1">
                      {locale === 'fr' ? 'Ouverture' : 'Opening'}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-brand-primary/50" />
                      <Input
                        type="time"
                        value={hour.open_time}
                        onChange={(e) => updateSpecialHour(hour.id, { open_time: e.target.value })}
                        className="pl-8 text-sm"
                        required={!hour.is_closed}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary mb-1">
                      {locale === 'fr' ? 'Fermeture' : 'Closing'}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-brand-primary/50" />
                      <Input
                        type="time"
                        value={hour.close_time}
                        onChange={(e) => updateSpecialHour(hour.id, { close_time: e.target.value })}
                        className="pl-8 text-sm"
                        required={!hour.is_closed}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {specialHours.length === 0 && !showSuggestions && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {locale === 'fr'
            ? 'Aucun horaire spécial ajouté. Cliquez sur "Ajouter" pour en créer un.'
            : 'No special hours added. Click "Add" to create one.'}
        </p>
      )}
    </div>
  )
}
