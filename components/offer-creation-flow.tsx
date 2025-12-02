"use client"

import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, Tag, Calendar, MapPin, Check, Heart, Sparkles, Zap } from "lucide-react"
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
import CategorySelector from "@/components/category-selector"
import SubCategorySelector from "@/components/sub-category-selector"

interface Offer {
  id: string
  commerce_id: string
  user_id: string
  title: string
  description: string
  image_url: string | null
  offer_type: "in_store" | "online" | "both"
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
  category_id: number | null
  sub_category_id: number | null
}

interface OfferCreationFlowProps {
  onCancel?: () => void
  commerceId?: string
  offer?: Offer // For editing existing offers
}

export default function OfferCreationFlow({ onCancel, commerceId, offer }: OfferCreationFlowProps) {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { toast } = useToast()
  const { locale } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [commerces, setCommerces] = useState<Array<{id: string, name: string, address: string, category_id: number | null}>>([])
  const [categories, setCategories] = useState<Array<{id: number, name_fr: string | null, name_en: string | null}>>([])
  
  // Determine if we're in edit mode
  const isEditMode = !!offer
  
  // Confirmation mode state
  const [isConfirmationMode, setIsConfirmationMode] = useState(false)
  const [isSuccessMode, setIsSuccessMode] = useState(false)
  const [createdOfferId, setCreatedOfferId] = useState<string | null>(null)
  const [boostCredits, setBoostCredits] = useState<{available_en_vedette: number, available_visibilite: number} | null>(null)
  const [showPurchaseForm, setShowPurchaseForm] = useState<'en_vedette' | 'visibilite' | null>(null)
  
  // Initialize form with offer data if editing, otherwise with defaults
  const [form, setForm] = useState({
    title: offer?.title || "",
    short_description: offer?.description || "",
    type: offer?.offer_type === "in_store" ? "en_magasin" as "en_magasin" | "en_ligne" | "les_deux" :
          offer?.offer_type === "online" ? "en_ligne" as "en_magasin" | "en_ligne" | "les_deux" :
          "les_deux" as "en_magasin" | "en_ligne" | "les_deux",
    business_address: offer?.custom_location || "",
    postal_code: offer?.postal_code || "",
    conditions: offer?.condition || "",
    start_date: offer?.start_date || format(new Date(), "yyyy-MM-dd"),
    end_date: offer?.end_date || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // Default 30 days, but user can extend up to 365 days
    selectedCommerceId: offer?.commerce_id || commerceId || "",
    image_url: offer?.image_url || "",
    category_id: offer?.category_id || null,
    sub_category_id: offer?.sub_category_id || null, // Charger la sous-catégorie depuis l'offre existante
  })

  const [geoData, setGeoData] = useState<{latitude: number, longitude: number, address: string} | null>(null)

  // Load geo data from offer if editing
  useEffect(() => {
    if (offer && offer.latitude && offer.longitude) {
      setGeoData({
        latitude: offer.latitude,
        longitude: offer.longitude,
        address: offer.custom_location || ""
      })
    }
  }, [offer])

  // Load categories
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

  // Load user's commerces and boost credits
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.warn('No user found')
          return
        }

        // Load commerces - try with category_id first, fallback to basic query if it fails
        let commercesData = null
        let commercesError = null
        
        // Load commerces with category_id
        const result = await supabase
          .from('commerces')
          .select('id, name, address, category_id')
          .eq('user_id', user.id)
        
        if (result.error) {
          commercesError = result.error
        } else {
          commercesData = result.data
        }
        
        if (commercesError) {
          // Don't use console.error to avoid triggering AuthErrorHandler
          console.warn('Error loading commerces:', commercesError.message || commercesError)
          toast({
            title: locale === 'fr' ? 'Erreur' : 'Error',
            description: locale === 'fr' 
              ? `Impossible de charger les commerces: ${commercesError.message || 'Erreur inconnue'}` 
              : `Unable to load businesses: ${commercesError.message || 'Unknown error'}`,
            variant: 'destructive'
          })
          return
        }
        
        setCommerces(commercesData || [])
        
        // Auto-select commerce if only one available and no commerceId provided
        if (commercesData && commercesData.length === 1 && !commerceId && !offer) {
          setForm(f => ({ 
            ...f, 
            selectedCommerceId: commercesData[0].id,
            category_id: commercesData[0].category_id
          }))
        }

        // Load boost credits
        const { data: boostCreditsData } = await supabase
          .from('user_boost_credits')
          .select('available_en_vedette, available_visibilite')
          .eq('user_id', user.id)
          .single()
        
        setBoostCredits(boostCreditsData || { available_en_vedette: 0, available_visibilite: 0 })
      } catch (error) {
        console.warn('Error loading data:', error)
      }
    }
    loadData()
  }, [commerceId, offer])

  // Auto-fill category_id when commerce is selected
  useEffect(() => {
    if (form.selectedCommerceId && commerces.length > 0) {
      const selectedCommerce = commerces.find(c => c.id === form.selectedCommerceId)
      if (selectedCommerce && selectedCommerce.category_id && !form.category_id) {
        setForm(f => ({ 
          ...f, 
          category_id: selectedCommerce.category_id,
          sub_category_id: null // Réinitialiser la sous-catégorie quand la catégorie change
        }))
      }
    }
  }, [form.selectedCommerceId, commerces])

  // Handle category change to clear sub_category
  const handleCategoryChange = (categoryId: number | null) => {
    setForm(f => ({
      ...f,
      category_id: categoryId,
      sub_category_id: null // Réinitialiser la sous-catégorie quand la catégorie change
    }))
  }

  // Check if selected category is Restaurant
  const isRestaurantCategory = (categoryId: number | null): boolean => {
    if (!categoryId) return false
    const category = categories.find(c => c.id === categoryId)
    if (!category) return false
    return category.name_fr === 'Restaurant' || category.name_en === 'Restaurant'
  }

  const validateForm = () => {
    const errors = []
    if (!form.title) errors.push(t('offers.titleRequired', locale))
    if (!form.short_description) errors.push(t('offers.descriptionRequired', locale))
    if (!form.selectedCommerceId) errors.push(t('offers.commerceRequired', locale))
    if (!form.category_id) errors.push("Veuillez sélectionner une catégorie")
    // Si Restaurant est sélectionné, la sous-catégorie est obligatoire
    if (isRestaurantCategory(form.category_id) && !form.sub_category_id) {
      errors.push(locale === 'fr' ? 'Veuillez sélectionner une sous-catégorie pour Restaurant' : 'Please select a sub-category for Restaurant')
    }
    if (!form.image_url) errors.push(locale === 'fr' ? 'Veuillez ajouter une image' : 'Please add an image')
    if (!form.start_date) errors.push(t('offers.startDateRequired', locale))
    if (!form.end_date) errors.push(t('offers.endDateRequired', locale))
    
    // Date validations - only apply restrictions when creating new offers, not when editing
    if (form.start_date && form.end_date && !isEditMode) {
      // Get today's date in YYYY-MM-DD format to match input format
      const todayString = format(new Date(), "yyyy-MM-dd")
      
      // Compare date strings directly to avoid timezone issues
      if (form.start_date < todayString) {
        errors.push(t('offers.startDatePast', locale))
      }
      
      if (form.end_date < todayString) {
        errors.push(t('offers.endDatePast', locale))
      }
      
      // Maximum 365 days (1 year) duration
      const startDate = new Date(form.start_date)
      const endDate = new Date(form.end_date)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 365) {
        errors.push(locale === 'fr' ? 'La durée maximale est de 1 an (365 jours)' : 'Maximum duration is 1 year (365 days)')
      }
    }
    
    // End date must be after start date (always validate this, even in edit mode)
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      errors.push(t('offers.endDateAfterStart', locale))
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleCreateOffer = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      alert(`${t('offers.correctErrors', locale)}\n${validation.errors.join('\n')}`)
      return
    }
    await handleSaveOffer()
  }

  const handleBackToEdit = () => {
    setIsConfirmationMode(false)
  }

  const handleConfirmPublish = () => {
    setIsConfirmationMode(true)
  }


  const handleSaveOffer = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      console.error('Missing required fields:', { 
        title: !!form.title, 
        description: !!form.short_description, 
        commerce: !!form.selectedCommerceId,
        category_id: !!form.category_id,
        sub_category_id: form.sub_category_id || !isRestaurantCategory(form.category_id),
        start_date: !!form.start_date,
        end_date: !!form.end_date,
        errors: validation.errors
      })
      toast({
        variant: "destructive",
        title: locale === 'fr' ? 'Erreur de validation' : 'Validation error',
        description: validation.errors.join(', ')
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

      const offerData = {
        commerce_id: targetCommerceId,
        user_id: user.id,
        title: form.title,
        description: form.short_description,
        image_url: form.image_url || null,
        offer_type: form.type === "en_magasin" ? "in_store" : 
                   form.type === "en_ligne" ? "online" : "both",
        uses_commerce_location: !form.business_address,
        custom_location: form.business_address || null,
        postal_code: form.postal_code || null,
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        category_id: form.category_id,
        sub_category_id: form.sub_category_id || null, // Ajouter la sous-catégorie si sélectionnée
        condition: form.conditions || null,
        start_date: form.start_date && form.start_date !== "" ? form.start_date : null,
        end_date: form.end_date && form.end_date !== "" ? form.end_date : null,
      }

      console.log('Saving offer with data:', offerData)
      console.log('Form dates:', { start_date: form.start_date, end_date: form.end_date })

      let result
      
      if (isEditMode && offer) {
        // Update existing offer
        const { data: updateData, error: updateError } = await supabase
          .from('offers')
          .update({
            ...offerData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', offer.id)
          .select()
          .single()

        if (updateError) {
          console.error('Database update error:', updateError)
          setIsLoading(false)
          return
        }

        result = updateData
        console.log('Offer updated:', result)
      } else {
        // Check content limits before creating new offer
        const { data: canCreate } = await supabase
          .rpc('check_content_limit', { 
            user_uuid: (await supabase.auth.getUser()).data.user?.id,
            content_type: 'offer'
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

        // Create new offer
        const { data: insertData, error: insertError } = await supabase
          .from('offers')
          .insert({
            ...offerData,
            is_active: true, // Explicitly set as active for new offers
          })
          .select()
          .single()

        if (insertError) {
          console.error('Database insert error:', insertError)
          setIsLoading(false)
          return
        }

        result = insertData
        console.log('Offer created:', result)
        setCreatedOfferId(result.id)
      }
      
      // Refresh dashboard counts
      refreshCounts()
      
      if (isEditMode) {
        // For edit mode, close immediately
        if (onCancel) {
          onCancel()
        }
      } else {
        // For new offers, show success screen with boost options
        setIsSuccessMode(true)
      }
    } catch (error) {
      console.error('Unexpected error saving offer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmation Component
  const OfferConfirmation = () => {
    const selectedCommerce = commerces.find(c => c.id === form.selectedCommerceId)
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            {t('offers.confirmPublication', locale)}
          </h2>
          <p className="text-muted-foreground">
            {t('offers.confirmPublishDesc', locale)}
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
                {t('offers.readyToPublish', locale)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('offers.commerceLabel', locale)}:</span>
                <span>{selectedCommerce?.name || t('placeholders.notSelected', locale)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('offers.period', locale)}</span>
                <span>
                  {t('offers.from', locale)} {new Date(form.start_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')} 
                  {t('offers.to', locale)} {new Date(form.end_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">{t('offers.offerWillBeOnline', locale)}</span>
                  </div>
                  <p>
                    {t('offers.visibleOnProfile', locale)}
                  </p>
                  <p>
                    {t('offers.canModifyAnytime', locale)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleBackToEdit} className="w-full sm:w-auto">
            ← {t('offers.backToPreview', locale)}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" 
            onClick={handleSaveOffer}
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
      if (!createdOfferId || !boostCredits) return

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

        // Apply boost to the created offer
        const { data: applyResult, error } = await supabase.rpc('use_boost_credits', {
          user_uuid: user.id,
          credits_to_use: 1
        })

        if (error) {
          console.error('Error applying boost:', error)
          return
        }

        // Update the offer with boost
        await supabase
          .from('offers')
          .update({
            boosted: true,
            boost_type: boostType,
            boosted_at: new Date().toISOString()
          })
          .eq('id', createdOfferId)

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
            {t('offers.offerCreatedSuccess', locale)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('offers.offerNowOnline', locale)}
          </p>
        </div>

        {/* Boost Offers */}
        <div className="bg-brand-light/20 border border-brand-primary/30 rounded-xl p-4">
          <div className="text-center mb-3">
            <Zap className="h-6 w-6 text-brand-primary mx-auto mb-1" />
            <h3 className="text-base font-semibold text-brand-primary">
              {t('offers.boostOfferNow', locale)}
            </h3>
            <p className="text-xs text-brand-primary/80 mt-1">
              {t('offers.increaseVisibility72h', locale)}
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
                  <h4 className="font-medium text-brand-primary">{t('offers.featuredBoost', locale)}</h4>
                  <p className="text-xs text-brand-primary/80">{t('offers.premiumVisibility72h', locale)}</p>
                </div>
              </div>
              <ul className="text-xs text-brand-primary/80 space-y-1 mb-3">
                <li>• {t('offers.featuredBadgeVisible', locale)}</li>
                <li>• {t('offers.priorityInSearch', locale)}</li>
                <li>• {t('offers.highlightedOnMap', locale)}</li>
                <li>• {t('offers.featuredOnWebsite', locale).split('gosholo.com').map((part, i, arr) => 
                  i < arr.length - 1 ? (
                    <React.Fragment key={i}>
                      {part}
                      <a 
                        href="https://gosholo.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary underline hover:text-brand-primary/80"
                      >
                        gosholo.com
                      </a>
                    </React.Fragment>
                  ) : part
                )}</li>
              </ul>
              <Button
                onClick={() => handleApplyBoost('en_vedette')}
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm py-2"
                size="sm"
              >
                {boostCredits?.available_en_vedette ? 
                  `${t('offers.useCredit', locale)} (${boostCredits.available_en_vedette} ${t('offers.available', locale)})` : 
                  t('offers.buy5dollars', locale)
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
{t('offers.skipForNow', locale)}
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
        <OfferConfirmation />
      ) : (
        <>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-primary">
              {isEditMode ? t('offers.editTitle', locale) : t('offers.title', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
        {/* Commerce Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('offers.commerceLabel', locale)} * <span className="text-red-500">*</span>
            </label>
            {commerces.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-red-500 mb-2">
                  <Store className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">{t('offers.noCommerceAvailable', locale)}</p>
                </div>
                <p className="text-secondary mb-4">{t('offers.mustCreateCommerceFirst', locale)}</p>
                <Button variant="outline" onClick={onCancel}>
                  {t('offers.backToDashboard', locale)}
                </Button>
              </div>
            ) : (
              <Select 
                value={form.selectedCommerceId} 
                onValueChange={(value) => setForm(f => ({ ...f, selectedCommerceId: value }))}
                disabled={isEditMode || !!commerceId} // Disable commerce selection in edit mode or when commerceId is provided
              >
                <SelectTrigger className={!form.selectedCommerceId ? "border-red-300 focus:border-red-500" : ""}>
                  <SelectValue placeholder={commerceId ? t('offers.commercePreselected', locale) : t('offers.selectCommerce', locale)} />
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
            <CategorySelector
              value={form.category_id}
              onValueChange={handleCategoryChange}
              placeholder="Sélectionner une catégorie"
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
                  sub_category_id: value
                }))}
                placeholder={t('commerce.subCategoryPlaceholder', locale)}
              />
            </div>
          )}

          {/* Offer Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('offers.name', locale)} * <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder={t('offers.offerTitlePlaceholder', locale)}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('offers.description', locale)} * <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder={t('offers.shortDescriptionPlaceholder', locale)}
                maxLength={250}
                value={form.short_description}
                onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('offers.image', locale)} * <span className="text-red-500">*</span>
              </label>
              <ImageUpload
                bucket="gosholo-partner"
                folder="offers"
                currentImage={form.image_url}
                onUploadComplete={(url) => setForm(f => ({ ...f, image_url: url }))}
                onRemoveImage={() => setForm(f => ({ ...f, image_url: "" }))}
                onUploadError={(error) => {
                  console.error('Image upload error:', error)
                  alert(`${t('offers.imageUploadError', locale)} ${error}`)
                }}
                previewData={{
                  type: 'offer'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {t('offers.type', locale)}
              </label>
              <Select value={form.type} onValueChange={(value: any) => setForm(f => ({ ...f, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('placeholders.selectType', locale)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_magasin">{t('offers.inStore', locale)}</SelectItem>
                  <SelectItem value="en_ligne">{t('offers.online', locale)}</SelectItem>
                  <SelectItem value="les_deux">{t('offers.both', locale)}</SelectItem>
                </SelectContent>
              </Select>
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
                placeholder={t('offers.specificAddressPlaceholder', locale)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('offers.ifDifferentFromMain', locale)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {locale === 'fr' ? 'Code postal' : 'Postal code'}
              </label>
              <Input
                placeholder={t('offers.postalCodePlaceholder', locale)}
                value={form.postal_code}
                onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                className="bg-gray-50"
              />
              {form.postal_code && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ {t('offers.postalCode', locale)}: {form.postal_code}
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
                {t('offers.condition', locale)} {t('offers.conditionOptional', locale)}
              </label>
              <Textarea
                placeholder={t('offers.conditionPlaceholder', locale)}
                value={form.conditions}
                onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('offers.startDate', locale)}
                </label>
                <Input
                  type="date"
                  value={form.start_date}
                  min={isEditMode ? undefined : format(new Date(), "yyyy-MM-dd")}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('offers.endDate', locale)}
                </label>
                <Input
                  type="date"
                  value={form.end_date}
                  min={isEditMode ? undefined : (form.start_date || format(new Date(), "yyyy-MM-dd"))}
                  max={isEditMode ? undefined : (form.start_date ? format(new Date(new Date(form.start_date).getTime() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd") : "")}
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
            onClick={isEditMode ? handleSaveOffer : handleCreateOffer}
            disabled={isLoading || !form.title || !form.short_description || !form.selectedCommerceId || !form.image_url || (isRestaurantCategory(form.category_id) && !form.sub_category_id)}
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
