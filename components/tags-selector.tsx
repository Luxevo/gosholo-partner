"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Tag {
  id: number
  name_fr: string
  name_en: string
  group_fr: string
  group_en: string
  applies_to: string
  sort_order: number
}

interface TagGroup {
  group_fr: string
  group_en: string
  tags: Tag[]
}

interface TagsSelectorProps {
  value: number[]
  onChange: (value: number[]) => void
  appliesTo?: "offer" | "event"
}

export default function TagsSelector({ value, onChange, appliesTo }: TagsSelectorProps) {
  const [groups, setGroups] = useState<TagGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadTags()
  }, [appliesTo])

  const loadTags = async () => {
    try {
      let query = supabase
        .from('tags')
        .select('*')
        .order('sort_order')

      if (appliesTo) {
        query = query.in('applies_to', ['both', appliesTo])
      }

      const { data, error } = await query
      if (error || !data) return

      const groupMap = new Map<string, TagGroup>()
      for (const tag of data) {
        if (!groupMap.has(tag.group_fr)) {
          groupMap.set(tag.group_fr, { group_fr: tag.group_fr, group_en: tag.group_en, tags: [] })
        }
        groupMap.get(tag.group_fr)!.tags.push(tag)
      }

      setGroups(Array.from(groupMap.values()))
    } finally {
      setIsLoading(false)
    }
  }

  const MAX_TAGS = 5

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id))
    } else if (value.length < MAX_TAGS) {
      onChange([...value, id])
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement des tags...</p>

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">{value.length}/{MAX_TAGS} tags sélectionnés</p>
      {groups.map((group) => (
        <div key={group.group_fr}>
          <p className="text-sm font-semibold text-primary mb-2">{group.group_fr}</p>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => {
              const selected = value.includes(tag.id)
              const disabled = !selected && value.length >= MAX_TAGS
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggle(tag.id)}
                  disabled={disabled}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selected
                      ? "bg-primary text-white border-primary"
                      : disabled
                      ? "bg-gray-50 text-muted-foreground/40 border-border cursor-not-allowed"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {tag.name_fr}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
