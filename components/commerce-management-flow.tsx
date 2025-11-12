"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, MapPin, Phone, Mail, Globe, Facebook, Instagram, Clock } from "lucide-react"
import ImageUpload from "@/components/image-upload"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import { useToast } from "@/hooks/use-toast"
import { geocodePostalCode, validateCanadianPostalCode, geocodeAddress, validateAddress, AddressSuggestion } from "@/lib/mapbox-geocoding"
import { validateSocialMediaLinks } from "@/lib/social-media-utils"
import { getRestaurantSubcategories, t } from "@/lib/category-translations"
import { useLanguage } from "@/contexts/language-context"
import AddressAutocomplete from "@/components/address-autocomplete"
import CategorySelector from "@/components/category-selector"

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string | null
  address: string
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
  status: string | null
  open_at: string | null
  close_at: string | null
  created_at: string | null
  updated_at: string | null
}

interface CommerceManagementFlowProps {
  commerce: Commerce
  onCancel?: () => void
  onCommerceUpdated?: () => void
}

export default function CommerceManagementFlow({ commerce, onCancel, onCommerceUpdated }: CommerceManagementFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { toast } = useToast()
  const { locale } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  // Get restaurant sub-categories with translated labels based on current locale
  const RESTAURANT_SUBCATEGORIES = getRestaurantSubcategories(locale)
  
  const [form, setForm] = useState({
    name: commerce.name || "",
    description: commerce.description || "",
    address: commerce.address || "",
    postal_code: commerce.postal_code || "",
    category_id: commerce.category_id || null,
    sub_category: commerce.sub_category || "",
    email: commerce.email || "",
    phone: commerce.phone || "",
    website: commerce.website || "",
    facebook_url: commerce.facebook_url || "",
    instagram_url: commerce.instagram_url || "",
    image_url: commerce.image_url || "",
    open_at: commerce.open_at || "09:00",
    close_at: commerce.close_at || "17:00",
  })

  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(
    commerce.latitude && commerce.longitude 
      ? { latitude: commerce.latitude, longitude: commerce.longitude, address: commerce.address }
      : null
  )

  // Handle category change to clear sub_category if not Restaurant (id 1)
  const handleCategoryChange = (categoryId: number | null) => {
    setForm(f => ({
      ...f,
      category_id: categoryId,
      sub_category: categoryId === 1 ? f.sub_category : ""
    }))
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
    
    // Validate opening hours
    if (form.open_at && form.close_at) {
      const openTime = new Date(`2000-01-01T${form.open_at}`)
      const closeTime = new Date(`2000-01-01T${form.close_at}`)
      if (openTime >= closeTime) {
        errors.push('L\'heure de fermeture doit être après l\'heure d\'ouverture')
      }
    }
    
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
          sub_category: form.sub_category.trim() || null,
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          facebook_url: form.facebook_url.trim() || null,
          instagram_url: form.instagram_url.trim() || null,
          image_url: form.image_url.trim() || null,
          open_at: form.open_at || null,
          close_at: form.close_at || null,
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

          {/* Sub-category dropdown - only show for restaurants (category_id 1) */}
          {form.category_id === 1 && (
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

            {/* Opening Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {locale === 'fr' ? 'Heure d\'ouverture' : 'Opening time'} (optionnel)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                  <Input
                    type="time"
                    value={form.open_at}
                    onChange={e => setForm(f => ({ ...f, open_at: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {locale === 'fr' ? 'Heure de fermeture' : 'Closing time'} (optionnel)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                  <Input
                    type="time"
                    value={form.close_at}
                    onChange={e => setForm(f => ({ ...f, close_at: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

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
            disabled={isLoading || !form.name || !form.description || !form.address || !form.category_id}
          >
            {isLoading ? t('messages.saving', locale) : t('buttons.save', locale)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
