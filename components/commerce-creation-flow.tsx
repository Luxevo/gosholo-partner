"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, MapPin, Phone, Mail, Globe, Check, Building2, Facebook, Instagram, Linkedin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import ImageUpload from "@/components/image-upload"
import { geocodePostalCode, validateCanadianPostalCode, formatPostalCode } from "@/lib/mapbox-geocoding"
import { formatSocialMediaUrl, validateSocialMediaLinks } from "@/lib/social-media-utils"

interface Commerce {
  id: string
  user_id: string
  name: string
  description: string | null
  address: string
  category: string
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
  status: string
  created_at: string | null
  updated_at: string | null
}

interface CommerceCreationFlowProps {
  onCancel?: () => void
  commerce?: Commerce // For editing existing commerce
}

// Commerce categories - must match the database enum exactly
const COMMERCE_CATEGORIES = [
  { value: "Restaurant", label: "Restaurant" },
  { value: "Café", label: "Café" },
  { value: "Boulangerie", label: "Boulangerie" },
  { value: "Épicerie", label: "Épicerie" },
  { value: "Commerce", label: "Commerce" },
  { value: "Service", label: "Service" },
  { value: "Santé", label: "Santé" },
  { value: "Beauté", label: "Beauté" },
  { value: "Sport", label: "Sport" },
  { value: "Culture", label: "Culture" },
  { value: "Éducation", label: "Éducation" },
  { value: "Autre", label: "Autre" }
]

export default function CommerceCreationFlow({ onCancel, commerce }: CommerceCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [isLoading, setIsLoading] = useState(false)
  
  // Determine if we're in edit mode
  const isEditMode = !!commerce
  
  // Preview and confirmation mode states
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isConfirmationMode, setIsConfirmationMode] = useState(false)
  
  // Initialize form with commerce data if editing, otherwise with defaults
  const [form, setForm] = useState({
    name: commerce?.name || "",
    description: commerce?.description || "",
    address: commerce?.address || "",
    postal_code: commerce?.postal_code || "",
    category: commerce?.category || "",
    email: commerce?.email || "",
    phone: commerce?.phone || "",
    website: commerce?.website || "",
    facebook_url: commerce?.facebook_url || "",
    instagram_url: commerce?.instagram_url || "",
    linkedin_url: commerce?.linkedin_url || "",
    image_url: commerce?.image_url || ""
  })
  
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(null)

  const validateForm = () => {
    const errors = []
    if (!form.name.trim()) errors.push('Nom du commerce requis')
    if (!form.postal_code.trim()) errors.push('Code postal requis')
    if (form.postal_code.trim() && !validateCanadianPostalCode(form.postal_code)) {
      errors.push('Code postal invalide (format: H2X 1Y4)')
    }
    if (!form.address.trim()) errors.push('Adresse complète requise')
    if (!form.category) errors.push('Catégorie requise')
    
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

  const handlePreviewCommerce = () => {
    const validation = validateForm()
    if (!validation.isValid) {
      alert(`Veuillez corriger les erreurs suivantes :\n${validation.errors.join('\n')}`)
      return
    }
    setIsPreviewMode(true)
  }

  const handleBackToEdit = () => {
    setIsPreviewMode(false)
    setIsConfirmationMode(false)
  }

  const handleConfirmPublish = () => {
    setIsConfirmationMode(true)
  }

  const handleBackToPreview = () => {
    setIsConfirmationMode(false)
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
        category: form.category,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        image_url: form.image_url.trim() || null,
        status: 'active'
      }

      console.log('Saving commerce with data:', commerceData)

      let result
      
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
      }
      
      // Refresh dashboard counts
      refreshCounts()
      
      // Reset form and close
      if (!isEditMode) {
        setForm({
          name: "",
          description: "",
          address: "",
          postal_code: "",
          category: "",
          email: "",
          phone: "",
          website: "",
          facebook_url: "",
          instagram_url: "",
          linkedin_url: "",
          image_url: ""
        })
      }
      
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Unexpected error saving commerce:', error)
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
            Confirmer la création
          </h2>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir créer ce commerce ?
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
                  {form.description || "Aucune description"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Prêt à créer
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Commerce Image */}
            {form.image_url && (
              <div className="mb-4">
                <div className="aspect-video w-full relative bg-gray-50 rounded-lg overflow-hidden">
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
                <span className="font-medium">Catégorie:</span>
                <span>{COMMERCE_CATEGORIES.find(c => c.value === form.category)?.label || form.category}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Adresse:</span>
                <span>{form.address}</span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Votre commerce sera maintenant créé !</span>
                  </div>
                  <p>
                    Vous pourrez ensuite créer des offres et des événements pour ce commerce.
                  </p>
                  <p>
                    Vous pourrez le modifier ou le supprimer à tout moment depuis votre tableau de bord.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleBackToPreview}>
            ← Retour à la prévisualisation
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleSaveCommerce}
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Créer le commerce"}
          </Button>
        </div>
      </div>
    )
  }

  // Preview Component
  const CommercePreview = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Prévisualisation de votre commerce
          </h2>
          <p className="text-muted-foreground">
            Vérifiez que toutes les informations sont correctes avant de créer
          </p>
        </div>

        {/* Preview Card */}
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-primary">
                  {form.name}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {form.description || "Aucune description"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                Prévisualisation
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Commerce Image */}
            {form.image_url && (
              <div className="mb-4">
                <div className="aspect-video w-full relative bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={form.image_url}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Commerce Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Catégorie:</span>
                  <span>{COMMERCE_CATEGORIES.find(c => c.value === form.category)?.label || form.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Adresse:</span>
                  <span>{form.address}</span>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-3">
                {form.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-blue-600">{form.email}</span>
                  </div>
                )}
                
                {form.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Téléphone:</span>
                    <span className="text-blue-600">{form.phone}</span>
                  </div>
                )}
                
                {form.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Site web:</span>
                    <span className="text-blue-600">{form.website}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleBackToEdit}>
            ← Retour modifier
          </Button>
          <Button 
            className="bg-accent hover:bg-accent/80 text-white" 
            onClick={handleConfirmPublish}
            disabled={isLoading}
          >
            Continuer vers la création
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      {isConfirmationMode ? (
        <CommerceConfirmation />
      ) : isPreviewMode ? (
        <CommercePreview />
      ) : (
        <>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-primary">
              {isEditMode ? "Modifier le commerce" : "Créer un nouveau commerce"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commerce Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Nom du commerce * <span className="text-red-500">*</span>
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
                  Description
                </label>
                <Textarea
                  placeholder="Décrivez votre commerce, vos spécialités..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Image du commerce
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
                  Code postal * <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ex: H2X 1Y4 (QC), M5V 3A8 (ON), V6B 1A1 (BC)"
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
                  Adresse complète * <span className="text-red-500">*</span>
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
                  Catégorie * <span className="text-red-500">*</span>
                </label>
                <Select value={form.category} onValueChange={(value) => setForm(f => ({ ...f, category: value }))}>
                  <SelectTrigger className={!form.category ? "border-red-300 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner une catégorie (obligatoire)" />
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

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-primary">Informations de contact</h3>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email
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
                    Téléphone
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
                    Site web
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
                    Facebook
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
                    Instagram
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
                    LinkedIn
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 pt-4 border-t">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
              )}
              <Button 
                className="bg-accent hover:bg-accent/80 text-white flex-1" 
                onClick={isEditMode ? handleSaveCommerce : handlePreviewCommerce}
                disabled={isLoading || !form.name.trim() || !form.address.trim() || !form.category}
              >
                {isLoading ? "Sauvegarde..." : (isEditMode ? "Mettre à jour le commerce" : "Voir le commerce")}
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
