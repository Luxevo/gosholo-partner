"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, MapPin, Phone, Mail, Globe, Check, Building2, Facebook, Instagram, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import ImageUpload from "@/components/image-upload"
import { geocodePostalCode, validateCanadianPostalCode, formatPostalCode, geocodeAddress, validateAddress, AddressSuggestion } from "@/lib/mapbox-geocoding"
import { formatSocialMediaUrl, validateSocialMediaLinks } from "@/lib/social-media-utils"
import { getCategoriesWithLabels, getRestaurantSubcategories, t } from "@/lib/category-translations"
import { useLanguage } from "@/contexts/language-context"
import AddressAutocomplete from "@/components/address-autocomplete"
import CategorySelector from "@/components/category-selector"
import WeeklyScheduleEditor, { DaySchedule } from "@/components/weekly-schedule-editor"
import SpecialHoursEditor, { SpecialHour } from "@/components/special-hours-editor"

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string | null
  address: string
  category: string
  category_id: number | null
  sub_category: string | null
  email: string | null
  phone: string | null
  website: string | null
  image_url: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  facebook_url: string | null
  instagram_url: string | null
  status: string
  created_at: string | null
  updated_at: string | null
}

interface CommerceCreationFlowProps {
  onCancel?: () => void
  onSuccess?: () => void
  commerce?: Commerce // For editing existing commerce
}

export default function CommerceCreationFlow({ onCancel, onSuccess, commerce }: CommerceCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { locale } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get commerce categories with translated labels based on current locale
  const COMMERCE_CATEGORIES = getCategoriesWithLabels(locale)
  
  // Get restaurant sub-categories with translated labels based on current locale
  const RESTAURANT_SUBCATEGORIES = getRestaurantSubcategories(locale)
  
  // Determine if we're in edit mode
  const isEditMode = !!commerce
  
  // Confirmation mode state
  const [isConfirmationMode, setIsConfirmationMode] = useState(false)
  
  // Initialize default weekly schedule (Monday=0 to Sunday=6)
  const DEFAULT_SCHEDULE: DaySchedule[] = [
    { day_of_week: 0, open_time: "09:00", close_time: "18:00", is_closed: false }, // Monday
    { day_of_week: 1, open_time: "09:00", close_time: "18:00", is_closed: false }, // Tuesday
    { day_of_week: 2, open_time: "09:00", close_time: "18:00", is_closed: false }, // Wednesday
    { day_of_week: 3, open_time: "09:00", close_time: "18:00", is_closed: false }, // Thursday
    { day_of_week: 4, open_time: "09:00", close_time: "18:00", is_closed: false }, // Friday
    { day_of_week: 5, open_time: "10:00", close_time: "17:00", is_closed: false }, // Saturday
    { day_of_week: 6, open_time: "", close_time: "", is_closed: true }, // Sunday - closed by default
  ]

  // Initialize form with commerce data if editing, otherwise with defaults
  const [form, setForm] = useState({
    name: commerce?.name || "",
    description: commerce?.description || "",
    address: commerce?.address || "",
    postal_code: commerce?.postal_code || "",
    category: commerce?.category || "",
    category_id: commerce?.category_id || null,
    sub_category: commerce?.sub_category || "",
    email: commerce?.email || "",
    phone: commerce?.phone || "",
    website: commerce?.website || "",
    facebook_url: commerce?.facebook_url || "",
    instagram_url: commerce?.instagram_url || "",
    image_url: commerce?.image_url || ""
  })

  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([])

  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(null)
  const [categories, setCategories] = useState<Array<{id: number, name_fr: string | null, name_en: string | null}>>([])

  // Load categories on component mount and when locale changes
  useEffect(() => {
    loadCategories()
  }, [locale])



  const loadCategories = async () => {
    try {
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
    }
  }

  // Get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'Non sélectionnée'
    const category = categories.find(c => c.id === categoryId)
    if (!category) return 'Catégorie inconnue'
    return locale === 'en' && category.name_en ? category.name_en : category.name_fr || 'Catégorie sans nom'
  }

  // Handle category change to clear sub_category if not Restaurant
  const handleCategoryChange = (value: string) => {
    setForm(f => ({
      ...f,
      category: value,
      sub_category: value === "Restaurant" ? f.sub_category : ""
    }))
  }

  const validateForm = () => {
    const errors = []
    if (!form.name.trim()) errors.push(t('validation.commerceNameRequired', locale))
    if (!form.postal_code.trim()) errors.push(t('validation.postalCodeRequired', locale))
    if (form.postal_code.trim() && !validateCanadianPostalCode(form.postal_code)) {
      errors.push(t('validation.invalidPostalCode', locale))
    }
    if (!form.address.trim()) errors.push(t('validation.addressRequired', locale))
    if (!form.category_id) errors.push("Veuillez sélectionner une catégorie")

    // Validate weekly schedule
    const hasAtLeastOneOpenDay = weeklySchedule.some(day => !day.is_closed)
    if (!hasAtLeastOneOpenDay) {
      errors.push(locale === 'fr' ? 'Au moins un jour doit être ouvert' : 'At least one day must be open')
    }

    // Validate time ranges for open days
    weeklySchedule.forEach((day, idx) => {
      if (!day.is_closed) {
        if (!day.open_time || !day.close_time) {
          const dayNames = locale === 'fr'
            ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          errors.push(`${dayNames[idx]}: ${locale === 'fr' ? 'Veuillez entrer les heures' : 'Please enter hours'}`)
        } else {
          const openTime = new Date(`2000-01-01T${day.open_time}`)
          const closeTime = new Date(`2000-01-01T${day.close_time}`)
          if (openTime >= closeTime) {
            const dayNames = locale === 'fr'
              ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
              : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            errors.push(`${dayNames[idx]}: ${locale === 'fr' ? 'L\'heure de fermeture doit être après l\'heure d\'ouverture' : 'Closing time must be after opening time'}`)
          }
        }
      }
    })

    // Validate special hours
    specialHours.forEach((hour, idx) => {
      if (!hour.date) {
        errors.push(`${locale === 'fr' ? 'Horaire spécial' : 'Special hour'} ${idx + 1}: ${locale === 'fr' ? 'Date requise' : 'Date required'}`)
      }
      if (!hour.is_closed && (!hour.open_time || !hour.close_time)) {
        errors.push(`${locale === 'fr' ? 'Horaire spécial' : 'Special hour'} ${idx + 1}: ${locale === 'fr' ? 'Heures requises' : 'Hours required'}`)
      }
      if (!hour.is_closed && hour.open_time && hour.close_time) {
        const openTime = new Date(`2000-01-01T${hour.open_time}`)
        const closeTime = new Date(`2000-01-01T${hour.close_time}`)
        if (openTime >= closeTime) {
          errors.push(`${locale === 'fr' ? 'Horaire spécial' : 'Special hour'} ${idx + 1}: ${locale === 'fr' ? 'L\'heure de fermeture doit être après l\'heure d\'ouverture' : 'Closing time must be after opening time'}`)
        }
      }
    })

    // Validate social media URLs
    const socialValidation = validateSocialMediaLinks({
      facebook_url: form.facebook_url,
      instagram_url: form.instagram_url,
      website: form.website
    })

    if (!socialValidation.isValid) {
      errors.push(...socialValidation.errors)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handlePostalCodeChange = async (value: string) => {
    setForm(f => ({ ...f, postal_code: value }))
    
    if (validateCanadianPostalCode(value)) {
      setIsGeocoding(true)
      try {
        const result = await geocodePostalCode(value)
        setGeoData({ latitude: result.latitude, longitude: result.longitude, address: result.address })
        setForm(f => ({ 
          ...f, 
          postal_code: result.postal_code 
        }))
      } catch (error) {
        console.error('Geocoding failed:', error)
        setGeoData(null)
      } finally {
        setIsGeocoding(false)
      }
    } else {
      setGeoData(null)
    }
  }

  const handleAddressChange = async (value: string) => {
    setForm(f => ({ ...f, address: value }))
    
    // If address contains a postal code pattern, try to extract and validate it
    const postalCodeMatch = value.match(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i)
    if (postalCodeMatch) {
      const postalCode = postalCodeMatch[0]
      if (validateCanadianPostalCode(postalCode)) {
        setIsGeocoding(true)
        try {
          const result = await geocodePostalCode(postalCode)
          setGeoData({ latitude: result.latitude, longitude: result.longitude, address: result.address })
          setForm(f => ({ 
            ...f, 
            postal_code: result.postal_code 
          }))
        } catch (error) {
          console.error('Postal code geocoding failed:', error)
        } finally {
          setIsGeocoding(false)
        }
      }
    }
    
    // Also try to geocode the full address if it looks like a complete address
    if (validateAddress(value) && value.length > 10) {
      setIsGeocoding(true)
      try {
        const result = await geocodeAddress(value)
        setGeoData({ latitude: result.latitude, longitude: result.longitude, address: result.address })
        if (result.postal_code) {
          setForm(f => ({ 
            ...f, 
            postal_code: result.postal_code 
          }))
        }
      } catch (error) {
        console.error('Address geocoding failed:', error)
        // Don't clear geoData on failure, keep existing data
      } finally {
        setIsGeocoding(false)
      }
    }
  }

  const handleShowConfirmation = () => {
    const validation = validateForm()
    if (!validation.isValid) {
      alert(`Veuillez corriger les erreurs suivantes :\n${validation.errors.join('\n')}`)
      return
    }
    setIsConfirmationMode(true)
  }

  const handleBackToEdit = () => {
    setIsConfirmationMode(false)
  }

  // Format weekly schedule for display - groups consecutive days with same hours
  const formatWeeklySchedule = (): { days: string; hours: string; isClosed: boolean }[] => {
    const dayNames = locale === 'fr'
      ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const shortDayNames = locale === 'fr'
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    interface ScheduleGroup {
      start: number
      end: number
      hours: string
      isClosed: boolean
    }

    const groups: { days: string; hours: string; isClosed: boolean }[] = []
    let currentGroup: ScheduleGroup | undefined

    const addGroup = (group: ScheduleGroup) => {
      const dayRange = group.start === group.end
        ? dayNames[group.start]
        : `${shortDayNames[group.start]} - ${shortDayNames[group.end]}`
      groups.push({ days: dayRange, hours: group.hours, isClosed: group.isClosed })
    }

    weeklySchedule.forEach((day, idx) => {
      const hours = day.is_closed
        ? (locale === 'fr' ? 'Fermé' : 'Closed')
        : `${day.open_time} - ${day.close_time}`

      if (!currentGroup) {
        currentGroup = { start: idx, end: idx, hours, isClosed: day.is_closed }
      } else if (currentGroup.hours === hours) {
        // Same hours, extend the group
        currentGroup.end = idx
      } else {
        // Different hours, save current group and start new one
        addGroup(currentGroup)
        currentGroup = { start: idx, end: idx, hours, isClosed: day.is_closed }
      }
    })

    // Add the last group
    if (currentGroup) {
      addGroup(currentGroup)
    }

    return groups
  }

  const handleSaveCommerce = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      console.error('Missing required fields:', { 
        name: !!form.name, 
        postal_code: !!form.postal_code, 
        address: !!form.address,
        category: !!form.category 
      })
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Authentication error:', userError)
        setIsLoading(false)
        return
      }

      const commerceData = {
        user_id: user.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim(),
        postal_code: form.postal_code.trim(),
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        category_id: form.category_id,
        sub_category: form.sub_category.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        image_url: form.image_url.trim() || null,
        status: 'active'
      }

      console.log('Saving commerce with data:', commerceData)
      console.log('Category ID being saved:', form.category_id)

      let result: { id: string } | null = null
      
      if (isEditMode && commerce) {
        // Update existing commerce
        const { data: updateData, error: updateError } = await supabase
          .from('commerces')
          .update({
            ...commerceData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', commerce.id)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          setIsLoading(false)
          return
        }

        result = updateData
        console.log('Commerce updated:', result)
      } else {
        // Create new commerce
        const { data: insertData, error: insertError } = await supabase
          .from('commerces')
          .insert([commerceData])
          .select()
          .single()

        if (insertError) {
          console.error('Database insert error:', insertError)
          setIsLoading(false)
          return
        }

        result = insertData
        console.log('Commerce created:', result)

        // Create weekly hours for the new commerce
        if (result && result.id) {
          const commerceId = result.id
          const hoursData = weeklySchedule.map(day => ({
            commerce_id: commerceId,
            day_of_week: day.day_of_week,
            open_time: day.is_closed ? null : day.open_time,
            close_time: day.is_closed ? null : day.close_time,
            is_closed: day.is_closed
          }))

          const { error: hoursError } = await supabase
            .from('commerce_hours')
            .insert(hoursData)

          if (hoursError) {
            console.error('Error creating commerce hours:', hoursError)
            // Note: Commerce was created successfully, but hours failed
            // Could add retry logic or show warning to user
          } else {
            console.log('Commerce hours created successfully')
          }

          // Create special hours if any
          if (specialHours.length > 0) {
            const specialHoursData = specialHours.map(hour => ({
              commerce_id: commerceId,
              date: hour.date,
              open_time: hour.is_closed ? null : hour.open_time,
              close_time: hour.is_closed ? null : hour.close_time,
              is_closed: hour.is_closed,
              label_fr: hour.label_fr || null,
              label_en: hour.label_en || null
            }))

            const { error: specialHoursError } = await supabase
              .from('commerce_special_hours')
              .insert(specialHoursData)

            if (specialHoursError) {
              console.error('Error creating special hours:', specialHoursError)
            } else {
              console.log('Special hours created successfully')
            }
          }
        }
      }

      // Refresh dashboard counts
      refreshCounts()
      
      // Call onSuccess callback if provided (for new commerce creation)
      if (!isEditMode && onSuccess) {
        onSuccess()
      }
      
      // Reset form and close
      if (!isEditMode) {
        setForm({
          name: "",
          description: "",
          address: "",
          postal_code: "",
          category: "",
          category_id: null,
          sub_category: "",
          email: "",
          phone: "",
          website: "",
          facebook_url: "",
          instagram_url: "",
          image_url: ""
        })
        setWeeklySchedule(DEFAULT_SCHEDULE)
        setSpecialHours([])
      }

      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Unexpected error saving commerce:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmation Component
  const CommerceConfirmation = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            {t('buttons.confirmCreation', locale)}
          </h2>
          <p className="text-muted-foreground">
            {t('commerce.confirmCreateDesc', locale)}
          </p>
        </div>

        {/* Confirmation Card */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-primary">
                  {form.name}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {form.description || t('commerce.noDescription', locale)}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {t('commerce.readyToCreate', locale)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Commerce Image */}
            {form.image_url && (
              <div className="mb-4">
                <div className="aspect-square w-32 h-32 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mx-auto">
                  <img
                    src={form.image_url}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('commerce.categoryLabel', locale)}</span>
                <span>{getCategoryName(form.category_id)}</span>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium block">{t('commerce.addressLabel', locale)}</span>
                  <span className="text-sm leading-relaxed break-words">{form.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium block mb-2">{locale === 'fr' ? 'Horaires' : 'Schedule'}</span>
                  <div className="space-y-1.5">
                    {formatWeeklySchedule().map((group, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between py-1.5 px-2 rounded ${
                          group.isClosed ? 'bg-gray-100' : 'bg-green-50'
                        }`}
                      >
                        <span className="text-sm font-medium text-primary">{group.days}</span>
                        <span className={`text-sm ${
                          group.isClosed ? 'text-muted-foreground italic' : 'text-green-700 font-medium'
                        }`}>
                          {group.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  {specialHours.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium text-xs text-muted-foreground block mb-1.5">
                        {locale === 'fr' ? 'Horaires spéciaux' : 'Special hours'}
                      </span>
                      <div className="space-y-1">
                        {specialHours.map((hour, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 bg-blue-50 rounded">
                            <span className="font-medium">
                              {new Date(hour.date).toLocaleDateString(locale, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              {(hour.label_fr || hour.label_en) && (
                                <span className="text-muted-foreground ml-1">
                                  ({locale === 'fr' ? hour.label_fr : hour.label_en})
                                </span>
                              )}
                            </span>
                            <span className={hour.is_closed ? 'text-muted-foreground italic' : 'text-blue-700'}>
                              {hour.is_closed
                                ? (locale === 'fr' ? 'Fermé' : 'Closed')
                                : `${hour.open_time} - ${hour.close_time}`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">{t('commerce.businessWillBeCreated', locale)}</span>
                  </div>
                  <p>
                    {t('commerce.canCreateOffersEvents', locale)}
                  </p>
                  <p>
                    {t('commerce.canModifyDelete', locale)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleBackToEdit}>
            ← {t('buttons.back', locale)}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleSaveCommerce}
            disabled={isLoading}
          >
            {isLoading ? t('messages.saving', locale) : t('buttons.create', locale)}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      {isConfirmationMode ? (
        <CommerceConfirmation />
      ) : (
        <>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-primary">
              {isEditMode ? t('commerce.editTitle', locale) : t('dashboard.addCommerce', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commerce Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('commerce.name', locale)} * <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('commerce.namePlaceholder', locale)}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('commerce.description', locale)}
                </label>
                <Textarea
                  placeholder={t('commerce.descriptionPlaceholder', locale)}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('commerce.image', locale)}
                </label>
                <ImageUpload
                  bucket="gosholo-partner"
                  folder="commerces"
                  currentImage={form.image_url}
                  onUploadComplete={(url) => setForm(f => ({ ...f, image_url: url }))}
                  onRemoveImage={() => setForm(f => ({ ...f, image_url: "" }))}
                  onUploadError={(error) => {
                    console.error('Image upload error:', error)
                    alert(`Erreur: ${error}`)
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('commerce.address', locale)} * <span className="text-red-500">*</span>
                </label>
                <AddressAutocomplete
                  value={form.address}
                  onChange={(value) => setForm(f => ({ ...f, address: value }))}
                  onSelect={(suggestion: AddressSuggestion) => {
                    setForm(f => ({ 
                      ...f, 
                      address: suggestion.place_name,
                      postal_code: suggestion.postal_code 
                    }))
                    setGeoData({ 
                      latitude: suggestion.latitude, 
                      longitude: suggestion.longitude, 
                      address: suggestion.place_name 
                    })
                  }}
                  placeholder={t('commerce.addressPlaceholder', locale)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('commerce.exactAddress', locale)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('commerce.postalCode', locale)} * <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('commerce.postalCodePlaceholder', locale)}
                  value={form.postal_code}
                  onChange={e => handlePostalCodeChange(e.target.value)}
                  required
                  disabled={isGeocoding}
                />
                {isGeocoding && (
                  <p className="text-sm text-gray-500 mt-1">📍 Recherche du secteur...</p>
                )}
                {geoData && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Secteur trouvé: {geoData.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('commerce.category', locale)} * <span className="text-red-500">*</span>
                </label>
                <CategorySelector
                  value={form.category_id}
                  onValueChange={(value) => setForm(f => ({ ...f, category_id: value }))}
                  placeholder={t('commerce.categoryPlaceholder', locale)}
                />
              </div>

              {/* Sub-category dropdown - only show for restaurants */}
              {form.category === "Restaurant" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('commerce.subCategory', locale)}
                  </label>
                  <Select value={form.sub_category} onValueChange={(value) => setForm(f => ({ ...f, sub_category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('commerce.subCategoryPlaceholder', locale)} />
                    </SelectTrigger>
                    <SelectContent>
                      {RESTAURANT_SUBCATEGORIES.map((subCategory) => (
                        <SelectItem key={subCategory.value} value={subCategory.value}>
                          {subCategory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-primary">{t('commerce.contactInfo', locale)}</h3>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('commerce.email', locale)}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                    <Input
                      type="email"
                      placeholder={t('commerce.emailPlaceholder', locale)}
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('commerce.phone', locale)}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                    <Input
                      type="tel"
                      placeholder={t('commerce.phonePlaceholder', locale)}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('commerce.website', locale)}
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                    <Input
                      type="url"
                      placeholder={t('commerce.websitePlaceholder', locale)}
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Facebook
                  </label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                    <Input
                      type="url"
                      placeholder={t('commerce.facebookPlaceholder', locale)}
                      value={form.facebook_url}
                      onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                    <Input
                      type="url"
                      placeholder={t('commerce.instagramPlaceholder', locale)}
                      value={form.instagram_url}
                      onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Schedule */}
              <WeeklyScheduleEditor
                schedule={weeklySchedule}
                onChange={setWeeklySchedule}
              />

              {/* Special Hours */}
              <SpecialHoursEditor
                specialHours={specialHours}
                onChange={setSpecialHours}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 pt-4 border-t">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  {t('buttons.cancel', locale)}
                </Button>
              )}
              <Button
                className="bg-accent hover:bg-accent/80 text-white flex-1"
                onClick={isEditMode ? handleSaveCommerce : handleShowConfirmation}
                disabled={isLoading || !form.name.trim() || !form.address.trim() || !form.category_id}
              >
                {isLoading ? t('messages.saving', locale) : (isEditMode ? t('buttons.save', locale) : t('buttons.next', locale))}
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
