"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

interface CategoryEvent {
  id: number
  name_fr: string | null
  name_en: string | null
}

interface CategoryEventsSelectorProps {
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
}

export default function CategoryEventsSelector({ 
  value, 
  onValueChange, 
  placeholder = "Sélectionner une catégorie",
  disabled = false 
}: CategoryEventsSelectorProps) {
  const [categories, setCategories] = useState<CategoryEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { locale } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('category_events')
        .select('id, name_fr, name_en')
        .order('name_fr', { ascending: true })

      if (error) {
        console.error('Error loading event categories:', error)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Unexpected error loading event categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (category: CategoryEvent) => {
    if (locale === 'en' && category.name_en) {
      return category.name_en
    }
    return category.name_fr || 'Catégorie sans nom'
  }

  return (
    <Select 
      value={value?.toString() || ""} 
      onValueChange={(val) => onValueChange(val ? parseInt(val) : null)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Chargement..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {getCategoryName(category)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
