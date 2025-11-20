"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

interface Category {
  id: number
  name_fr: string | null
  name_en: string | null
}

interface CategorySelectorProps {
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
}

export default function CategorySelector({ 
  value, 
  onValueChange, 
  placeholder = "Sélectionner une catégorie",
  disabled = false 
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { locale } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    loadCategories()
  }, [locale])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('category')
        .select('id, name_fr, name_en')

      if (error) {
        console.error('Error loading categories:', error)
        return
      }

      // Sort by the appropriate language field
      const sortedData = (data || []).sort((a, b) => {
        const nameA = locale === 'en' && a.name_en ? a.name_en : a.name_fr || ''
        const nameB = locale === 'en' && b.name_en ? b.name_en : b.name_fr || ''
        return nameA.localeCompare(nameB)
      })

      setCategories(sortedData)
    } catch (error) {
      console.error('Unexpected error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (category: Category) => {
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