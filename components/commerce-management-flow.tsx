"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, MapPin, Phone, Mail, Globe, Facebook, Instagram } from "lucide-react"
import ImageUpload from "@/components/image-upload"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import { useToast } from "@/hooks/use-toast"
import { geocodePostalCode, validateCanadianPostalCode, geocodeAddress, validateAddress, AddressSuggestion } from "@/lib/mapbox-geocoding"
import { validateSocialMediaLinks } from "@/lib/social-media-utils"
import { t } from "@/lib/category-translations"
import { useLanguage } from "@/contexts/language-context"
import AddressAutocomplete from "@/components/address-autocomplete"
import CategorySelector from "@/components/category-selector"
import SubCategorySelector from "@/components/sub-category-selector"
import WeeklyScheduleEditor, { DaySchedule } from "@/components/weekly-schedule-editor"
import SpecialHoursEditor, { SpecialHour } from "@/components/special-hours-editor"

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string | null
  address: string
  category_id: number | null
  sub_category_id: number | null
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
  status: string | null
  created_at: string | null
  updated_at: string | null
}

interface CommerceManagementFlowProps {
  commerce: Commerce
  onCancel?: () => void
  onCommerceUpdated?: () => void
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day_of_week: 0, open_time: "09:00", close_time: "18:00", is_closed: false }, // Monday
  { day_of_week: 1, open_time: "09:00", close_time: "18:00", is_closed: false }, // Tuesday
  { day_of_week: 2, open_time: "09:00", close_time: "18:00", is_closed: false }, // Wednesday
  { day_of_week: 3, open_time: "09:00", close_time: "18:00", is_closed: false }, // Thursday
  { day_of_week: 4, open_time: "09:00", close_time: "18:00", is_closed: false }, // Friday
  { day_of_week: 5, open_time: "10:00", close_time: "17:00", is_closed: false }, // Saturday
  { day_of_week: 6, open_time: "00:00", close_time: "00:00", is_closed: true },  // Sunday
]

export default function CommerceManagementFlow({ commerce, onCancel, onCommerceUpdated }: CommerceManagementFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { toast } = useToast()
  const { locale } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    name: commerce.name || "",
    description: commerce.description || "",
    address: commerce.address || "",
    postal_code: commerce.postal_code || "",
    category_id: commerce.category_id || null,
    sub_category_id: commerce.sub_category_id || null, // Charger l'ID de sous-catégorie depuis le commerce
    sub_category: commerce.sub_category || "", // Gardé pour compatibilité
    email: commerce.email || "",
    phone: commerce.phone || "",
    website: commerce.website || "",
    facebook_url: commerce.facebook_url || "",
    instagram_url: commerce.instagram_url || "",
    image_url: commerce.image_url || "",
  })

  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([])
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true)

  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(
    commerce.latitude && commerce.longitude
      ? { latitude: commerce.latitude, longitude: commerce.longitude, address: commerce.address }
      : null
  )
  const [categories, setCategories] = useState<Array<{id: number, name_fr: string | null, name_en: string | null}>>([])

  // Load categories on component mount and when locale changes
  useEffect(() => {
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
    loadCategories()
  }, [locale])

  // Load existing schedule when component mounts
  useEffect(() => {
    const loadExistingSchedule = async () => {
      setIsLoadingSchedule(true)
      try {
        // Load weekly hours
        const { data: hoursData, error: hoursError } = await supabase
          .from('commerce_hours')
          .select('*')
          .eq('commerce_id', commerce.id)
          .order('day_of_week')

        if (hoursError) {
          console.error('Error loading schedule:', hoursError)
        } else if (hoursData && hoursData.length > 0) {
          // Transform database data to DaySchedule format
          const schedule = hoursData.map(day => ({
            day_of_week: day.day_of_week,
            open_time: day.open_time || "09:00",
            close_time: day.close_time || "18:00",
            is_closed: day.is_closed
          }))
          setWeeklySchedule(schedule)
        }

        // Load special hours
        const { data: specialData, error: specialError } = await supabase
          .from('commerce_special_hours')
          .select('*')
          .eq('commerce_id', commerce.id)
          .order('date')

        if (specialError) {
          console.error('Error loading special hours:', specialError)
        } else if (specialData && specialData.length > 0) {
          // Transform database data to SpecialHour format
          const special = specialData.map(hour => ({
            id: hour.id,
            date: hour.date,
            open_time: hour.open_time || "09:00",
            close_time: hour.close_time || "18:00",
            is_closed: hour.is_closed,
            label_fr: hour.label_fr || "",
            label_en: hour.label_en || ""
          }))
          setSpecialHours(special)
        }
      } catch (error) {
        console.error('Unexpected error loading schedule:', error)
      } finally {
        setIsLoadingSchedule(false)
      }
    }

    loadExistingSchedule()
  }, [commerce.id, supabase])

  // Handle category change to clear sub_category
  const handleCategoryChange = (categoryId: number | null) => {
    setForm(f => ({
      ...f,
      category_id: categoryId,
      sub_category_id: null, // Réinitialiser la sous-catégorie quand la catégorie change
      sub_category: "" // Gardé pour compatibilité
    }))
  }

  // Check if selected category is Restaurant
  const isRestaurantCategory = (categoryId: number | null): boolean => {
    if (!categoryId) return false
    const category = categories.find(c => c.id === categoryId)
    if (!category) return false
    return category.name_fr === 'Restaurant' || category.name_en === 'Restaurant'
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

  const validateForm = () => {
    const errors = []
    if (!form.name.trim()) errors.push('Nom du commerce requis')
    // Description is now optional when editing
    if (!form.postal_code.trim()) errors.push('Code postal requis')
    if (form.postal_code.trim() && !validateCanadianPostalCode(form.postal_code)) {
      errors.push('Code postal invalide (format: H2X 1Y4)')
    }
    if (!form.address.trim()) errors.push('Adresse complète requise')
    if (!form.category_id) errors.push('Catégorie requise')
    // Si Restaurant est sélectionné, la sous-catégorie est obligatoire
    if (isRestaurantCategory(form.category_id) && !form.sub_category_id) {
      errors.push(locale === 'fr' ? 'Veuillez sélectionner une sous-catégorie pour Restaurant' : 'Please select a sub-category for Restaurant')
    }

    // Validate weekly schedule
    const hasAtLeastOneOpenDay = weeklySchedule.some(day => !day.is_closed)
    if (!hasAtLeastOneOpenDay) {
      errors.push(locale === 'fr' ? 'Au moins un jour doit être ouvert' : 'At least one day must be open')
    }

    // Validate that open days have valid times
    weeklySchedule.forEach((day, idx) => {
      if (!day.is_closed) {
        if (!day.open_time || !day.close_time) {
          const dayNames = locale === 'fr'
            ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          errors.push(`${dayNames[day.day_of_week]}: ${locale === 'fr' ? 'Horaires requis' : 'Hours required'}`)
        } else {
          const openTime = new Date(`2000-01-01T${day.open_time}`)
          const closeTime = new Date(`2000-01-01T${day.close_time}`)
          if (openTime >= closeTime) {
            const dayNames = locale === 'fr'
              ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
              : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            errors.push(`${dayNames[day.day_of_week]}: ${locale === 'fr' ? 'Heure de fermeture doit être après ouverture' : 'Closing time must be after opening time'}`)
          }
        }
      }
    })

    // Validate special hours
    specialHours.forEach((hour) => {
      if (!hour.is_closed && (!hour.open_time || !hour.close_time)) {
        errors.push(locale === 'fr' ? `Date spéciale ${hour.date}: Horaires requis` : `Special date ${hour.date}: Hours required`)
      }
    })

    // Email is optional - removed validation

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

  const handleSaveCommerce = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: `Veuillez corriger les erreurs suivantes : ${validation.errors.join(', ')}`,
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Authentication error:', userError)
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour modifier un commerce",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Update commerce in database
      const { data: commerceData, error: updateError } = await supabase
        .from('commerces')
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          postal_code: form.postal_code.trim(),
          latitude: geoData?.latitude || null,
          longitude: geoData?.longitude || null,
          category_id: form.category_id,
          sub_category_id: form.sub_category_id || null, // ID de la sous-catégorie depuis la base de données
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          facebook_url: form.facebook_url.trim() || null,
          instagram_url: form.instagram_url.trim() || null,
          image_url: form.image_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commerce.id)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour du commerce",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      console.log('Commerce updated:', commerceData)

      // Update weekly schedule
      // Delete existing hours
      const { error: deleteHoursError } = await supabase
        .from('commerce_hours')
        .delete()
        .eq('commerce_id', commerce.id)

      if (deleteHoursError) {
        console.error('Error deleting old hours:', deleteHoursError)
      }

      // Insert new hours
      const hoursData = weeklySchedule.map(day => ({
        commerce_id: commerce.id,
        day_of_week: day.day_of_week,
        open_time: day.is_closed ? null : day.open_time,
        close_time: day.is_closed ? null : day.close_time,
        is_closed: day.is_closed
      }))

      const { error: hoursError } = await supabase
        .from('commerce_hours')
        .insert(hoursData)

      if (hoursError) {
        console.error('Error updating hours:', hoursError)
        toast({
          title: "Attention",
          description: "Commerce mis à jour mais erreur lors de la mise à jour des horaires",
          variant: "destructive"
        })
      }

      // Update special hours
      // Delete existing special hours
      const { error: deleteSpecialError } = await supabase
        .from('commerce_special_hours')
        .delete()
        .eq('commerce_id', commerce.id)

      if (deleteSpecialError) {
        console.error('Error deleting old special hours:', deleteSpecialError)
      }

      // Insert new special hours (if any)
      if (specialHours.length > 0) {
        const specialHoursData = specialHours.map(hour => ({
          commerce_id: commerce.id,
          date: hour.date,
          open_time: hour.is_closed ? null : hour.open_time,
          close_time: hour.is_closed ? null : hour.close_time,
          is_closed: hour.is_closed,
          label_fr: hour.label_fr || null,
          label_en: hour.label_en || null
        }))

        const { error: specialError } = await supabase
          .from('commerce_special_hours')
          .insert(specialHoursData)

        if (specialError) {
          console.error('Error updating special hours:', specialError)
        }
      }
      
      toast({
        title: "Succès",
        description: "Commerce mis à jour avec succès",
      })
      
      // Refresh dashboard counts
      refreshCounts()
      
      if (onCommerceUpdated) {
        onCommerceUpdated()
      }
    } catch (error) {
      console.error('Unexpected error updating commerce:', error)
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la mise à jour",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary">
          {t('dashboard.manageCommerce', locale)}
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
              placeholder="Ex: Boulangerie du Centre"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('commerce.description', locale)} (optionnel)
            </label>
            <Textarea
              placeholder="Description de votre commerce"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
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
              placeholder="Ex: 123 Rue Saint-Paul Est"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Adresse exacte de votre commerce (numéro, rue, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Code postal * <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: H2X 1Y4, M5V 3A8, V6B 1A1"
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
              onValueChange={handleCategoryChange}
              placeholder={t('commerce.categoryPlaceholder', locale)}
            />
          </div>

          {/* Sub-category dropdown - affiche automatiquement si des sous-catégories existent pour la catégorie sélectionnée */}
          {form.category_id && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary mb-2">
                {t('commerce.subCategory', locale)}
                {isRestaurantCategory(form.category_id) && <span className="text-red-500"> *</span>}
              </label>
              <SubCategorySelector
                categoryId={form.category_id}
                value={form.sub_category_id}
                onValueChange={(value) => setForm(f => ({ 
                  ...f, 
                  sub_category_id: value,
                  sub_category: "" // Sera mis à jour si nécessaire
                }))}
                placeholder={t('commerce.subCategoryPlaceholder', locale)}
              />
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-primary">Informations de contact</h3>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('commerce.email', locale)} (optionnel)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="email"
                  placeholder="contact@commerce.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('commerce.phone', locale)} (optionnel)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="tel"
                  placeholder="(514) 123-4567"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('commerce.website', locale)} (optionnel)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="url"
                  placeholder="https://www.commerce.com"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Weekly Schedule and Special Hours */}
            {isLoadingSchedule ? (
              <div className="text-center py-4 text-muted-foreground">
                {locale === 'fr' ? 'Chargement des horaires...' : 'Loading schedule...'}
              </div>
            ) : (
              <>
                <WeeklyScheduleEditor
                  schedule={weeklySchedule}
                  onChange={setWeeklySchedule}
                />

                <SpecialHoursEditor
                  specialHours={specialHours}
                  onChange={setSpecialHours}
                />
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Facebook (optionnel)
              </label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="url"
                  placeholder="facebook.com/moncommerce ou https://facebook.com/moncommerce"
                  value={form.facebook_url}
                  onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Instagram (optionnel)
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="url"
                  placeholder="instagram.com/moncommerce ou @moncommerce"
                  value={form.instagram_url}
                  onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

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
                toast({
                  title: "Erreur de téléchargement",
                  description: `Impossible de télécharger l'image: ${error}`,
                  variant: "destructive",
                })
              }}
            />
          </div>
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
            onClick={handleSaveCommerce}
            disabled={isLoading || !form.name || !form.description || !form.address || !form.category_id || (isRestaurantCategory(form.category_id) && !form.sub_category_id)}
          >
            {isLoading ? t('messages.saving', locale) : t('buttons.save', locale)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
