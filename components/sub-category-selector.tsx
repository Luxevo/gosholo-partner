"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

interface SubCategory {
  id: number
  category_id: number
  name_fr: string | null
  name_en: string | null
}

interface SubCategorySelectorProps {
  categoryId: number | null
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
}

export default function SubCategorySelector({ 
  categoryId,
  value, 
  onValueChange, 
  placeholder = "Sélectionner une sous-catégorie",
  disabled = false 
}: SubCategorySelectorProps) {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { locale } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    if (categoryId) {
      loadSubCategories()
    } else {
      // Si pas de catégorie sélectionnée, vider les sous-catégories
      setSubCategories([])
      onValueChange(null)
    }
  }, [categoryId, locale])

  const loadSubCategories = async () => {
    if (!categoryId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('sub_category')
        .select('id, category_id, name_fr, name_en')
        .eq('category_id', categoryId)

      if (error) {
        console.error('Error loading sub-categories:', error)
        return
      }

      // Sort by the appropriate language field
      const sortedData = (data || []).sort((a, b) => {
        const nameA = locale === 'en' && a.name_en ? a.name_en : a.name_fr || ''
        const nameB = locale === 'en' && b.name_en ? b.name_en : b.name_fr || ''
        return nameA.localeCompare(nameB)
      })

      setSubCategories(sortedData)
    } catch (error) {
      console.error('Unexpected error loading sub-categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSubCategoryName = (subCategory: SubCategory) => {
    if (locale === 'en' && subCategory.name_en) {
      return subCategory.name_en
    }
    return subCategory.name_fr || 'Sous-catégorie sans nom'
  }

  // Ne pas afficher le sélecteur si aucune catégorie n'est sélectionnée ou aucune sous-catégorie disponible
  if (!categoryId || (subCategories.length === 0 && !isLoading)) {
    return null
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
        {subCategories.map((subCategory) => (
          <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
            {getSubCategoryName(subCategory)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

