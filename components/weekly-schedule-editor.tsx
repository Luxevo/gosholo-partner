"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export interface DaySchedule {
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

interface WeeklyScheduleEditorProps {
  schedule: DaySchedule[]
  onChange: (schedule: DaySchedule[]) => void
}

const DAY_NAMES = {
  fr: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
}

const SHORT_DAY_NAMES = {
  fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

export default function WeeklyScheduleEditor({ schedule, onChange }: WeeklyScheduleEditorProps) {
  const { locale } = useLanguage()

  const updateDay = (dayIndex: number, updates: Partial<DaySchedule>) => {
    const newSchedule = schedule.map((day, idx) =>
      idx === dayIndex ? { ...day, ...updates } : day
    )
    onChange(newSchedule)
  }

  const copyToAllDays = () => {
    if (schedule.length === 0) return
    const firstDay = schedule[0]
    const newSchedule = schedule.map((day) => ({
      ...day,
      open_time: firstDay.open_time,
      close_time: firstDay.close_time,
      is_closed: firstDay.is_closed
    }))
    onChange(newSchedule)
  }

  const copyWeekdayHours = () => {
    if (schedule.length === 0) return
    const monday = schedule[0] // Monday is index 0
    const newSchedule = schedule.map((day, idx) => {
      // Copy Monday's hours to Tuesday-Friday (indices 1-4)
      if (idx >= 1 && idx <= 4) {
        return {
          ...day,
          open_time: monday.open_time,
          close_time: monday.close_time,
          is_closed: monday.is_closed
        }
      }
      return day
    })
    onChange(newSchedule)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm font-medium text-primary">
          {locale === 'fr' ? 'Horaires de la semaine' : 'Weekly Schedule'}
        </h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyWeekdayHours}
            className="text-xs flex-1 sm:flex-none"
          >
            <Copy className="h-3 w-3 mr-1" />
            {locale === 'fr' ? 'Lun-Ven' : 'Mon-Fri'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToAllDays}
            className="text-xs flex-1 sm:flex-none"
          >
            <Copy className="h-3 w-3 mr-1" />
            {locale === 'fr' ? 'Tous' : 'All'}
          </Button>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {schedule.map((day, idx) => (
          <div
            key={day.day_of_week}
            className={`p-2.5 sm:p-3 rounded-lg border ${
              day.is_closed ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            {/* Row 1: Day name + Closed checkbox */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                <span className="sm:hidden">{SHORT_DAY_NAMES[locale][day.day_of_week]}</span>
                <span className="hidden sm:inline">{DAY_NAMES[locale][day.day_of_week]}</span>
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Checkbox
                  id={`closed-${day.day_of_week}`}
                  checked={day.is_closed}
                  onCheckedChange={(checked) =>
                    updateDay(idx, { is_closed: checked as boolean })
                  }
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <label
                  htmlFor={`closed-${day.day_of_week}`}
                  className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
                >
                  {locale === 'fr' ? 'Fermé' : 'Closed'}
                </label>
              </div>
            </div>

            {/* Row 2: Time inputs (if not closed) */}
            {!day.is_closed && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="time"
                  value={day.open_time}
                  onChange={(e) => updateDay(idx, { open_time: e.target.value })}
                  className="flex-1 text-sm h-9"
                  required={!day.is_closed}
                />
                <span className="text-muted-foreground text-sm">-</span>
                <Input
                  type="time"
                  value={day.close_time}
                  onChange={(e) => updateDay(idx, { close_time: e.target.value })}
                  className="flex-1 text-sm h-9"
                  required={!day.is_closed}
                />
              </div>
            )}

            {day.is_closed && (
              <p className="text-xs text-muted-foreground italic mt-1">
                {locale === 'fr' ? 'Fermé toute la journée' : 'Closed all day'}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {locale === 'fr'
          ? 'Utilisez les boutons ci-dessus pour copier rapidement les mêmes horaires.'
          : 'Use the buttons above to quickly copy the same hours.'}
      </p>
    </div>
  )
}
