"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, Calendar, MapPin, Check, Users, Heart, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import ImageUpload from "@/components/image-upload"
import { geocodePostalCode, validateCanadianPostalCode } from "@/lib/mapbox-geocoding"

interface Event {
  id: string
  commerce_id: string
  user_id: string
  title: string
  description: string
  image_url: string | null
  uses_commerce_location: boolean
  custom_location: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  condition: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
  start_date: string | null
  end_date: string | null
}

interface EventCreationFlowProps {
  onCancel?: () => void
  commerceId?: string
  event?: Event // For editing existing events
}

export default function EventCreationFlow({ onCancel, commerceId, event }: EventCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, category: string, address: string}>>([])
  
  // Determine if we're in edit mode
  const isEditMode = !!event
  
  // Preview and confirmation mode states
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isConfirmationMode, setIsConfirmationMode] = useState(false)
  
     // Initialize form with event data if editing, otherwise with defaults
   const [form, setForm] = useState({
     title: event?.title || "",
     short_description: event?.description || "",
     business_address: event?.custom_location || "",
     postal_code: event?.postal_code || "",
     conditions: event?.condition || "",
     start_date: event?.start_date || format(new Date(), "yyyy-MM-dd"),
     end_date: event?.end_date || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 7 days later by default
     selectedCommerceId: event?.commerce_id || commerceId || "",
     image_url: event?.image_url || "",
   })

   const [isGeocoding, setIsGeocoding] = useState(false)
   const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(null)

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

  // Load user's commerces
  useEffect(() => {
    const loadCommerces = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: commercesData } = await supabase
            .from('commerces')
            .select('id, name, category, address')
            .eq('user_id', user.id)
          setCommerces(commercesData || [])
          
          // Auto-select commerce if only one available and no commerceId provided
          if (commercesData && commercesData.length === 1 && !commerceId && !event) {
            setForm(f => ({ ...f, selectedCommerceId: commercesData[0].id }))
          }
        }
      } catch (error) {
        console.error('Error loading commerces:', error)
      }
    }
    loadCommerces()
  }, [commerceId, event])

  const validateForm = () => {
    const errors = []
    if (!form.title) errors.push('Titre requis')
    if (!form.short_description) errors.push('Description requise')
    if (!form.selectedCommerceId) errors.push('Commerce requis')
    if (!form.start_date) errors.push('Date de début requise')
    if (!form.end_date) errors.push('Date de fin requise')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handlePreviewEvent = () => {
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

  const handleSaveEvent = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      console.error('Missing required fields:', { 
        title: !!form.title, 
        description: !!form.short_description, 
        commerce: !!form.selectedCommerceId 
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

      // Use selected commerce - this is now mandatory
      const targetCommerceId = form.selectedCommerceId
      
      if (!targetCommerceId) {
        console.error('No commerce selected - this should not happen due to validation')
        setIsLoading(false)
        return
      }

             const eventData = {
         commerce_id: targetCommerceId,
         user_id: user.id,
         title: form.title,
         description: form.short_description,
         image_url: form.image_url || null,
         uses_commerce_location: !form.business_address,
         custom_location: form.business_address || null,
         postal_code: form.postal_code || null,
         latitude: geoData?.latitude || null,
         longitude: geoData?.longitude || null,
         condition: form.conditions || null,
         start_date: form.start_date && form.start_date !== "" ? form.start_date : null,
         end_date: form.end_date && form.end_date !== "" ? form.end_date : null,
       }

      console.log('Saving event with data:', eventData)
      console.log('Form dates:', { start_date: form.start_date, end_date: form.end_date })

      let result
      
      if (isEditMode && event) {
        // Update existing event
        const { data: updateData, error: updateError } = await supabase
          .from('events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', event.id)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          setIsLoading(false)
          return
        }

        result = updateData
        console.log('Event updated:', result)
      } else {
        // Create new event
        const { data: insertData, error: insertError } = await supabase
          .from('events')
          .insert({
            ...eventData,
            is_active: true, // Explicitly set as active for new events
          })
          .select()
          .single()

        if (insertError) {
          console.error('Database insert error:', insertError)
          setIsLoading(false)
          return
        }

        result = insertData
        console.log('Event created:', result)
      }
      
      // Refresh dashboard counts
      refreshCounts()
      
             // Reset form and close
       if (!isEditMode) {
         setForm({
           title: "",
           short_description: "",
           business_address: "",
           postal_code: "",
           conditions: "",
           start_date: format(new Date(), "yyyy-MM-dd"),
           end_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
           selectedCommerceId: "",
           image_url: "",
         })
       }
      
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Unexpected error saving event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmation Component
  const EventConfirmation = () => {
    const selectedCommerce = commerces.find(c => c.id === form.selectedCommerceId)
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            Confirmer la publication
          </h2>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir publier cet événement ?
          </p>
        </div>

        {/* Confirmation Card */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-primary">
                  {form.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {form.short_description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Prêt à publier
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Commerce:</span>
                <span>{selectedCommerce?.name || "Non sélectionné"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Période:</span>
                <span>
                  Du {new Date(form.start_date).toLocaleDateString('fr-FR')} 
                  au {new Date(form.end_date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Votre événement sera maintenant en ligne !</span>
                  </div>
                  <p>
                    Il sera visible sur votre fiche commerce, sur la carte, et dans les sections de l'application.
                  </p>
                  <p>
                    Vous pourrez le modifier ou le désactiver à tout moment. (Lors d'un changement ou de la désactivation, les utilisateurs ayant ajouté votre événement en favori seront avertis.)
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
            onClick={handleSaveEvent}
            disabled={isLoading}
          >
            {isLoading ? "Publication..." : "Publier l'événement"}
          </Button>
        </div>
      </div>
    )
  }

  // Preview Component
  const EventPreview = () => {
    const selectedCommerce = commerces.find(c => c.id === form.selectedCommerceId)

    // Format dates for event display
    const formatEventDate = (dateString: string) => {
      if (!dateString) return "Date non définie"
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatEventTime = (dateString: string) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }

    const getEventTimeRange = () => {
      if (!form.start_date || !form.end_date) return "Horaire à définir"
      return `${formatEventTime(form.start_date)}-${formatEventTime(form.end_date)}`
    }

    const getEventCategory = () => {
      // Try to categorize based on title/description keywords
      const text = (form.title + " " + form.short_description).toLowerCase()
      if (text.includes('food') || text.includes('cuisine') || text.includes('restaurant')) return 'Food Fest'
      if (text.includes('music') || text.includes('concert') || text.includes('musique')) return 'Music'
      if (text.includes('art') || text.includes('expo') || text.includes('gallery')) return 'Art'
      if (text.includes('sport') || text.includes('fitness')) return 'Sport'
      if (text.includes('market') || text.includes('marché')) return 'Market'
      return 'Event'
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Aperçu de votre événement
          </h2>
          <p className="text-muted-foreground">
            Voici comment votre événement apparaîtra aux utilisateurs de Gosholo
          </p>
        </div>

        {/* User-facing Event Card Preview */}
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {/* Image Section */}
            <div className="relative h-48">
              {form.image_url ? (
                <img 
                  src={form.image_url} 
                  alt={form.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-80" />
                    <p className="text-sm opacity-80">Image de l'événement</p>
                  </div>
                </div>
              )}
              
              {/* Trending Badge */}
              <div className="absolute top-3 left-3">
                <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center text-green-800" style={{ backgroundColor: '#B2FD9D' }}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </div>
              </div>

              {/* Heart Icon */}
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Date and Category Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {form.start_date && (
                      <>
                        <span className="font-medium">
                          {formatEventDate(form.start_date)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{getEventTimeRange()}</span>
                      </>
                    )}
                  </div>
                  <div className="text-white px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FF6233' }}>
                    {getEventCategory()}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              {/* Event Title and Price */}
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1">
                  {form.title}
                </h3>
                <span className="font-medium whitespace-nowrap ml-2 px-2 py-1 rounded-full text-xs" style={{ color: '#016167', backgroundColor: 'rgba(1, 97, 103, 0.1)' }}>
                  {form.conditions || "Entrée libre"}
                </span>
              </div>

              {/* Event Location */}
              <div className="mb-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {form.business_address || selectedCommerce?.address || "Lieu à confirmer"}
                  </span>
                </div>
              </div>

              {/* Event Stats */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1 text-orange-500" />
                  <span className="text-orange-500 font-medium">1.2k+ intéressés</span>
                </div>
                <span>•</span>
                <span>Outdoor</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-1/2">
                <button className="text-white font-semibold py-1 px-3 rounded-full hover:opacity-90 transition-colors text-sm flex-1" style={{ backgroundColor: '#FF6233' }}>
                  Participer
                </button>
                <button className="border border-gray-300 text-gray-700 font-semibold py-1 px-3 rounded-full hover:bg-gray-50 transition-colors text-sm flex-1">
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-blue-800 text-sm">
            <div className="font-medium mb-1">✨ Aperçu de l'expérience utilisateur</div>
            <p>C'est exactement ainsi que votre événement apparaîtra aux utilisateurs dans l'application Gosholo.</p>
          </div>
        </div>

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
            Continuer vers la publication
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 border-primary/20 shadow-none">
      {isConfirmationMode ? (
        <EventConfirmation />
      ) : isPreviewMode ? (
        <EventPreview />
      ) : (
        <>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-primary">
              {isEditMode ? "Modifier l'événement" : "Créer un nouvel événement"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commerce Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Commerce * <span className="text-red-500">*</span>
                </label>
                {commerces.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-red-500 mb-2">
                      <Store className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">Aucun commerce disponible</p>
                    </div>
                    <p className="text-secondary mb-4">Vous devez d'abord créer un commerce avant de pouvoir créer un événement.</p>
                    <Button variant="outline" onClick={onCancel}>
                      Retour au tableau de bord
                    </Button>
                  </div>
                ) : (
                  <Select 
                    value={form.selectedCommerceId} 
                    onValueChange={(value) => setForm(f => ({ ...f, selectedCommerceId: value }))}
                    disabled={isEditMode || !!commerceId} // Disable commerce selection in edit mode or when commerceId is provided
                  >
                    <SelectTrigger className={!form.selectedCommerceId ? "border-red-300 focus:border-red-500" : ""}>
                      <SelectValue placeholder={commerceId ? "Commerce pré-sélectionné" : "Sélectionner un commerce (obligatoire)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {commerces.map((commerce) => (
                        <SelectItem key={commerce.id} value={commerce.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{commerce.name}</span>
                            <span className="text-xs text-secondary">{commerce.category} • {commerce.address}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Titre de l'événement * <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Ex: Atelier cuisine, Soirée networking, Lancement produit"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Description * <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Description courte (max 250 caractères)"
                    maxLength={250}
                    value={form.short_description}
                    onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Image de l'événement
                  </label>
                  <ImageUpload
                    bucket="gosholo-partner"
                    folder="events"
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
                    Code postal (optionnel)
                  </label>
                  <Input
                    placeholder="Ex: H2X 1Y4, M5V 3A8, V6B 1A1"
                    value={form.postal_code}
                    onChange={e => handlePostalCodeChange(e.target.value)}
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
                    Adresse spécifique (optionnel)
                  </label>
                  <Input
                    placeholder="Ex: 123 Rue Saint-Paul Est"
                    value={form.business_address}
                    onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si différente du commerce principal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Conditions (optionnel)
                  </label>
                  <Textarea
                    placeholder="Ex: Inscription requise, Limite 20 participants, Apporter votre matériel"
                    value={form.conditions}
                    onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Date de début
                    </label>
                    <Input
                      type="date"
                      value={form.start_date}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Date de fin
                    </label>
                    <Input
                      type="date"
                      value={form.end_date}
                      onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                      required
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
                onClick={isEditMode ? handleSaveEvent : handlePreviewEvent}
                disabled={isLoading || !form.title || !form.short_description || !form.selectedCommerceId}
              >
                {isLoading ? "Sauvegarde..." : (isEditMode ? "Mettre à jour l'événement" : "Voir l'événement")}
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
} 