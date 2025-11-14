"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, Calendar, MapPin, Check, Users, Heart, TrendingUp, Sparkles, Zap } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import ImageUpload from "@/components/image-upload"
import BoostPurchaseForm from "@/components/boost-purchase-form"
import { AddressSuggestion } from "@/lib/mapbox-geocoding"
import AddressAutocomplete from "@/components/address-autocomplete"
import { useToast } from "@/hooks/use-toast"
import CategoryEventsSelector from "@/components/category-events-selector"

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
  category_events_id: number | null
}

interface EventCreationFlowProps {
  onCancel?: () => void
  commerceId?: string
  event?: Event // For editing existing events
}

export default function EventCreationFlow({ onCancel, commerceId, event }: EventCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { toast } = useToast()
  const { locale } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, address: string}>>([])
  
  // Determine if we're in edit mode
  const isEditMode = !!event
  
  // Confirmation mode state
  const [isConfirmationMode, setIsConfirmationMode] = useState(false)
  const [isSuccessMode, setIsSuccessMode] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [boostCredits, setBoostCredits] = useState<{available_en_vedette: number, available_visibilite: number} | null>(null)
  const [showPurchaseForm, setShowPurchaseForm] = useState<'en_vedette' | 'visibilite' | null>(null)
  
     // Initialize form with event data if editing, otherwise with defaults
  const [form, setForm] = useState({
    title: event?.title || "",
    short_description: event?.description || "",
    business_address: event?.custom_location || "",
    postal_code: event?.postal_code || "",
    conditions: event?.condition || "",
    start_date: event?.start_date || format(new Date(), "yyyy-MM-dd"),
    end_date: event?.end_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 30 days later by default
    selectedCommerceId: event?.commerce_id || commerceId || "",
    image_url: event?.image_url || "",
    category_events_id: event?.category_events_id || null,
  })

   const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(null)

  // Load user's commerces and boost credits
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Load commerces
          const { data: commercesData } = await supabase
            .from('commerces')
            .select('id, name, address')
            .eq('user_id', user.id)
          setCommerces(commercesData || [])
          
          // Auto-select commerce if only one available and no commerceId provided
          if (commercesData && commercesData.length === 1 && !commerceId && !event) {
            setForm(f => ({ ...f, selectedCommerceId: commercesData[0].id }))
          }

          // Load boost credits
          const { data: boostCreditsData } = await supabase
            .from('user_boost_credits')
            .select('available_en_vedette, available_visibilite')
            .eq('user_id', user.id)
            .single()
          
          setBoostCredits(boostCreditsData || { available_en_vedette: 0, available_visibilite: 0 })
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [commerceId, event])

  const validateForm = () => {
    const errors = []
    if (!form.title) errors.push(t('events.titleRequired', locale))
    if (!form.short_description) errors.push(t('events.descriptionRequired', locale))
    if (!form.selectedCommerceId) errors.push(t('events.commerceRequired', locale))
    if (!form.category_events_id) errors.push("Veuillez sélectionner une catégorie")
    if (!form.start_date) errors.push(t('events.startDateRequired', locale))
    if (!form.end_date) errors.push(t('events.endDateRequired', locale))
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleCreateEvent = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      alert(`${t('events.correctErrors', locale)}\n${validation.errors.join('\n')}`)
      return
    }
    await handleSaveEvent()
  }

  const handleBackToEdit = () => {
    setIsConfirmationMode(false)
  }

  const handleConfirmPublish = () => {
    setIsConfirmationMode(true)
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
         category_events_id: form.category_events_id,
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
        // Check content limits before creating new event
        const { data: canCreate } = await supabase
          .rpc('check_content_limit', { 
            user_uuid: (await supabase.auth.getUser()).data.user?.id,
            content_type: 'event'
          })

        if (!canCreate) {
          toast({
            variant: "destructive",
            title: t('messages.contentLimitReached', locale),
            description: t('messages.upgradeToCreateMore', locale)
          })
          setIsLoading(false)
          return
        }

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
        setCreatedEventId(result.id)
      }
      
      // Refresh dashboard counts
      refreshCounts()
      
      if (isEditMode) {
        // For edit mode, close immediately
        if (onCancel) {
          onCancel()
        }
      } else {
        // For new events, show success screen with boost options
        setIsSuccessMode(true)
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
            {t('events.confirmPublication', locale)}
          </h2>
          <p className="text-muted-foreground">
            {t('events.confirmPublishDesc', locale)}
          </p>
        </div>

        {/* Confirmation Card */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-primary">
                  {form.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {form.short_description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {t('events.readyToPublish', locale)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('events.commerceLabel', locale)}:</span>
                <span>{selectedCommerce?.name || t('placeholders.notSelected', locale)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('events.period', locale)}</span>
                <span>
                  {t('events.from', locale)} {new Date(form.start_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')} 
                  {t('events.to', locale)} {new Date(form.end_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">{t('events.eventWillBeOnline', locale)}</span>
                  </div>
                  <p>
                    {t('events.visibleOnProfile', locale)}
                  </p>
                  <p>
                    {t('events.canModifyAnytime', locale)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleBackToEdit} className="w-full sm:w-auto">
            ← {t('events.backToEdit', locale)}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" 
            onClick={handleSaveEvent}
            disabled={isLoading}
          >
            {isLoading ? t('messages.saving', locale) : t('buttons.create', locale)}
          </Button>
        </div>
      </div>
    )
  }


  // Success with Boost Offers Component
  const SuccessWithBoosts = () => {
    const handleApplyBoost = async (boostType: 'en_vedette' | 'visibilite') => {
      if (!createdEventId || !boostCredits) return

      const availableCredits = boostType === 'en_vedette' 
        ? boostCredits.available_en_vedette 
        : boostCredits.available_visibilite

      if (availableCredits <= 0) {
        // Show purchase form
        setShowPurchaseForm(boostType)
        return
      }

      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Apply boost to the created event
        const { data: applyResult, error } = await supabase.rpc('use_boost_credits', {
          user_uuid: user.id,
          credits_to_use: 1
        })

        if (error) {
          console.error('Error applying boost:', error)
          return
        }

        // Update the event with boost
        await supabase
          .from('events')
          .update({
            boosted: true,
            boost_type: boostType,
            boosted_at: new Date().toISOString()
          })
          .eq('id', createdEventId)

        // Update local boost credits
        setBoostCredits(prev => prev ? {
          ...prev,
          [boostType === 'en_vedette' ? 'available_en_vedette' : 'available_visibilite']:
            (boostType === 'en_vedette' ? prev.available_en_vedette : prev.available_visibilite) - 1
        } : null)

        // Show success and close after delay
        setTimeout(() => {
          if (onCancel) {
            onCancel()
          }
        }, 2000)

      } catch (error) {
        console.error('Error applying boost:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const handlePurchaseSuccess = async () => {
      if (!showPurchaseForm) return

      // Close purchase form
      setShowPurchaseForm(null)
      
      // Update boost credits (add 1 credit for the purchased boost)
      setBoostCredits(prev => prev ? {
        ...prev,
        [showPurchaseForm === 'en_vedette' ? 'available_en_vedette' : 'available_visibilite']:
          (showPurchaseForm === 'en_vedette' ? prev.available_en_vedette : prev.available_visibilite) + 1
      } : { available_en_vedette: showPurchaseForm === 'en_vedette' ? 1 : 0, available_visibilite: showPurchaseForm === 'visibilite' ? 1 : 0 })

      // Automatically apply the boost
      setTimeout(() => {
        handleApplyBoost(showPurchaseForm)
      }, 500)
    }

    const handleSkipBoost = () => {
      if (onCancel) {
        onCancel()
      }
    }

    return (
      <div className="space-y-4">
        {/* Success Message */}
        <div className="text-center mb-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-primary mb-1">
            {t('events.eventCreatedSuccess', locale)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('events.eventNowOnline', locale)}
          </p>
        </div>

        {/* Boost Offers */}
        <div className="bg-brand-light/20 border border-brand-primary/30 rounded-xl p-4">
          <div className="text-center mb-3">
            <Zap className="h-6 w-6 text-brand-primary mx-auto mb-1" />
            <h3 className="text-base font-semibold text-brand-primary">
              {t('events.boostEventNow', locale)}
            </h3>
            <p className="text-xs text-brand-primary/80 mt-1">
              {t('events.increaseVisibility72h', locale)}
            </p>
          </div>

          <div className="mb-4">
            {/* En Vedette Boost */}
            <div className="bg-white rounded-lg p-4 border border-brand-primary/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-light/20 rounded-full">
                  <Sparkles className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-primary">{t('events.featuredBoost', locale)}</h4>
                  <p className="text-xs text-brand-primary/80">{t('events.premiumVisibility72h', locale)}</p>
                </div>
              </div>
              <ul className="text-xs text-brand-primary/80 space-y-1 mb-3">
                <li>• {t('events.featuredBadgeVisible', locale)}</li>
                <li>• {t('events.priorityInSearch', locale)}</li>
                <li>• {t('events.highlightedOnMap', locale)}</li>
              </ul>
              <Button
                onClick={() => handleApplyBoost('en_vedette')}
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm py-2"
                size="sm"
              >
                {boostCredits?.available_en_vedette ? 
                  `${t('events.useCredit', locale)} (${boostCredits.available_en_vedette} ${t('events.available', locale)})` : 
                  t('events.buy5dollars', locale)
                }
              </Button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center pt-3 border-t border-brand-primary/30">
            <Button
              variant="ghost"
              onClick={handleSkipBoost}
              className="text-brand-primary hover:text-brand-primary/80 text-sm"
              disabled={isLoading}
            >
{t('events.skipForNow', locale)}
            </Button>
          </div>
        </div>

        {/* Purchase Form Modal */}
        {showPurchaseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
              <BoostPurchaseForm
                boostType={showPurchaseForm}
                onSuccess={handlePurchaseSuccess}
                onCancel={() => setShowPurchaseForm(null)}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full px-2 sm:px-0">
      <Card className="w-full max-w-md sm:max-w-2xl mx-auto p-4 sm:p-8 border-primary/20 shadow-none rounded-2xl">
      {isSuccessMode ? (
        <SuccessWithBoosts />
      ) : isConfirmationMode ? (
        <EventConfirmation />
      ) : (
        <>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-primary">
              {isEditMode ? t('events.editTitle', locale) : t('events.title', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Commerce Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('events.commerceLabel', locale)} * <span className="text-red-500">*</span>
                </label>
                {commerces.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-red-500 mb-2">
                      <Store className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">{t('events.noCommerceAvailable', locale)}</p>
                    </div>
                    <p className="text-secondary mb-4">{t('events.mustCreateCommerceFirst', locale)}</p>
                    <Button variant="outline" onClick={onCancel}>
                      {t('events.backToDashboard', locale)}
                    </Button>
                  </div>
                ) : (
                  <Select 
                    value={form.selectedCommerceId} 
                    onValueChange={(value) => setForm(f => ({ ...f, selectedCommerceId: value }))}
                    disabled={isEditMode || !!commerceId} // Disable commerce selection in edit mode or when commerceId is provided
                  >
                    <SelectTrigger className={!form.selectedCommerceId ? "border-red-300 focus:border-red-500" : ""}>
                      <SelectValue placeholder={commerceId ? t('events.commercePreselected', locale) : t('events.selectCommerce', locale)} />
                    </SelectTrigger>
                    <SelectContent>
                      {commerces.map((commerce) => (
                        <SelectItem key={commerce.id} value={commerce.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{commerce.name}</span>
                            <span className="text-xs text-secondary">{commerce.address}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <CategoryEventsSelector
                  value={form.category_events_id}
                  onValueChange={(value) => setForm(f => ({ ...f, category_events_id: value }))}
                  placeholder="Sélectionner une catégorie"
                />
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('events.name', locale)} * <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder={t('events.eventTitlePlaceholder', locale)}
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('events.description', locale)} * <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder={t('events.shortDescriptionPlaceholder', locale)}
                    maxLength={250}
                    value={form.short_description}
                    onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('events.eventImageLabel', locale)}
                  </label>
                  <ImageUpload
                    bucket="gosholo-partner"
                    folder="events"
                    currentImage={form.image_url}
                    onUploadComplete={(url) => setForm(f => ({ ...f, image_url: url }))}
                    onRemoveImage={() => setForm(f => ({ ...f, image_url: "" }))}
                    onUploadError={(error) => {
                      console.error('Image upload error:', error)
                      alert(`${t('events.imageUploadError', locale)} ${error}`)
                    }}
                    previewData={{
                      type: 'event'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {locale === 'fr' ? 'Adresse spécifique' : 'Specific address'}
                  </label>
                  <AddressAutocomplete
                    value={form.business_address}
                    onChange={(value) => setForm(f => ({ ...f, business_address: value }))}
                    onSelect={(suggestion: AddressSuggestion) => {
                      setForm(f => ({ 
                        ...f, 
                        business_address: suggestion.place_name,
                        postal_code: suggestion.postal_code 
                      }))
                      setGeoData({ 
                        latitude: suggestion.latitude, 
                        longitude: suggestion.longitude, 
                        address: suggestion.place_name 
                      })
                    }}
                    placeholder={t('events.specificAddressPlaceholder', locale)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('events.ifDifferentFromMain', locale)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {locale === 'fr' ? 'Code postal' : 'Postal code'}
                  </label>
                  <Input
                    placeholder={t('events.postalCodePlaceholder', locale)}
                    value={form.postal_code}
                    onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                    className="bg-gray-50"
                  />
                  {form.postal_code && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ {t('events.postalCode', locale)}: {form.postal_code}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'fr' 
                      ? 'Auto-rempli lors de la sélection d\'adresse ou saisissez manuellement' 
                      : 'Auto-filled when selecting an address or enter manually'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('events.condition', locale)} {t('events.conditionOptional', locale)}
                  </label>
                  <Textarea
                    placeholder={t('events.conditionPlaceholder', locale)}
                    value={form.conditions}
                    onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      {t('events.startDate', locale)}
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
                      {t('events.endDate', locale)}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                  {t('buttons.cancel', locale)}
                </Button>
              )}
              <Button 
                className="bg-accent hover:bg-accent/80 text-white w-full sm:flex-1" 
                onClick={isEditMode ? handleSaveEvent : handleCreateEvent}
                disabled={isLoading || !form.title || !form.short_description || !form.selectedCommerceId}
              >
                {isLoading ? t('messages.saving', locale) : (isEditMode ? t('buttons.save', locale) : t('buttons.create', locale))}
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
    </div>
  )
} 