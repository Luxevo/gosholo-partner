"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import { useToast } from "@/hooks/use-toast"
import { geocodePostalCode, validateCanadianPostalCode } from "@/lib/mapbox-geocoding"
import { validateSocialMediaLinks } from "@/lib/social-media-utils"
import { getCategoriesWithLabels, getRestaurantSubcategories, t } from "@/lib/category-translations"
import { useLanguage } from "@/contexts/language-context"

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string | null
  address: string
  category: string | null
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
  linkedin_url: string | null
  status: string | null
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
  
  // Get commerce categories with translated labels based on current locale
  const COMMERCE_CATEGORIES = getCategoriesWithLabels(locale)
  
  // Get restaurant sub-categories with translated labels based on current locale
  const RESTAURANT_SUBCATEGORIES = getRestaurantSubcategories(locale)
  
  const [form, setForm] = useState({
    name: commerce.name || "",
    description: commerce.description || "",
    address: commerce.address || "",
    postal_code: commerce.postal_code || "",
    category: commerce.category || "",
    sub_category: commerce.sub_category || "",
    email: commerce.email || "",
    phone: commerce.phone || "",
    website: commerce.website || "",
    facebook_url: commerce.facebook_url || "",
    instagram_url: commerce.instagram_url || "",
    linkedin_url: commerce.linkedin_url || "",
    image_url: commerce.image_url || "",
  })

  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(
    commerce.latitude && commerce.longitude 
      ? { latitude: commerce.latitude, longitude: commerce.longitude, address: commerce.address }
      : null
  )

  // Handle category change to clear sub_category if not Restaurant
  const handleCategoryChange = (value: string) => {
    setForm(f => ({
      ...f,
      category: value,
      sub_category: value === "Restaurant" ? f.sub_category : ""
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

  const validateForm = () => {
    const errors = []
    if (!form.name.trim()) errors.push('Nom du commerce requis')
    if (!form.description.trim()) errors.push('Description requise')
    if (!form.postal_code.trim()) errors.push('Code postal requis')
    if (form.postal_code.trim() && !validateCanadianPostalCode(form.postal_code)) {
      errors.push('Code postal invalide (format: H2X 1Y4)')
    }
    if (!form.address.trim()) errors.push('Adresse complète requise')
    if (!form.category) errors.push('Catégorie requise')
    if (!form.email.trim()) errors.push('Email requis')
    
    // Validate social media URLs
    const socialValidation = validateSocialMediaLinks({
      facebook_url: form.facebook_url,
      instagram_url: form.instagram_url,
      linkedin_url: form.linkedin_url,
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
          category: form.category,
          sub_category: form.sub_category.trim() || null,
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          facebook_url: form.facebook_url.trim() || null,
          instagram_url: form.instagram_url.trim() || null,
          linkedin_url: form.linkedin_url.trim() || null,
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
              {t('commerce.description', locale)} * <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Description de votre commerce"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={3}
            />
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
              {t('commerce.address', locale)} * <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: 123 Rue Saint-Paul Est"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Adresse exacte de votre commerce (numéro, rue, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('commerce.category', locale)} * <span className="text-red-500">*</span>
            </label>
            <Select value={form.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className={!form.category ? "border-red-300 focus:border-red-500" : ""}>
                <SelectValue placeholder={t('commerce.categoryPlaceholder', locale)} />
              </SelectTrigger>
              <SelectContent>
                {COMMERCE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <h3 className="text-sm font-medium text-primary">Informations de contact</h3>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('commerce.email', locale)} * <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="email"
                  placeholder="contact@commerce.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="pl-10"
                  required
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

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                LinkedIn (optionnel)
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-brand-primary/50" />
                <Input
                  type="url"
                  placeholder="linkedin.com/company/moncommerce"
                  value={form.linkedin_url}
                  onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Image du commerce (optionnel)
            </label>
            <Input
              type="url"
              placeholder="URL de l'image"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            />
            <div className="text-xs text-secondary mt-1">
              Ajouter une image améliore la visibilité de votre commerce.
            </div>
            {form.image_url && (
              <img 
                src={form.image_url} 
                alt="Aperçu" 
                className="mt-2 rounded w-32 h-32 object-cover" 
                onError={(e) => { 
                  const target = e.target as HTMLImageElement; 
                  target.style.display = 'none'; 
                }} 
              />
            )}
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
            disabled={isLoading || !form.name || !form.description || !form.address || !form.category || !form.email}
          >
            {isLoading ? t('messages.saving', locale) : t('buttons.save', locale)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
