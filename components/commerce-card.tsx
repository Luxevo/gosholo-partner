"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Tag, 
  Calendar, 
  Edit,
  Trash2,
  CheckCircle,
  Zap,
  Sparkles,
  Plus,
  Settings,
  TrendingUp
} from "lucide-react"
import CommerceManagementFlow from "@/components/commerce-management-flow"
import OfferCreationFlow from "@/components/offer-creation-flow"
import EventCreationFlow from "@/components/event-creation-flow"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import BoostPurchaseForm from "@/components/boost-purchase-form"
import { formatBoostRemainingTime, isBoostExpired } from "@/lib/boost-utils"
import { useDashboard } from "@/contexts/dashboard-context"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"

interface CommerceCardProps {
  commerce: any
  onRefresh: () => void
}

const CommerceCard = ({ commerce, onRefresh }: CommerceCardProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const { counts } = useDashboard()
  const { locale } = useLanguage()
  const [isEditOfferDialogOpen, setIsEditOfferDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<any>(null)
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'offer' | 'event', item: any} | null>(null)
  const [isManageCommerceDialogOpen, setIsManageCommerceDialogOpen] = useState(false)
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false)
  const [boostingItem, setBoostingItem] = useState<{type: 'offer' | 'event' | 'commerce', item: any} | null>(null)
  const [boostCredits, setBoostCredits] = useState<{available_en_vedette: number, available_visibilite: number} | null>(null)
  const [showPurchaseForm, setShowPurchaseForm] = useState<'en_vedette' | 'visibilite' | null>(null)
  const [isDeleteCommerceConfirmOpen, setIsDeleteCommerceConfirmOpen] = useState(false)
  
  const activeOffers = commerce.offers?.filter((offer: any) => offer.is_active) || []
  const upcomingEvents = commerce.events || [] // For now, consider all events as upcoming

  // Load boost credits
  const loadBoostCredits = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: boostCreditsData } = await supabase
        .from('user_boost_credits')
        .select('available_en_vedette, available_visibilite')
        .eq('user_id', user.id)
        .single()
      
      setBoostCredits(boostCreditsData || { available_en_vedette: 0, available_visibilite: 0 })
    }
  }

  // Load boost credits on component mount
  React.useEffect(() => {
    loadBoostCredits()
  }, [])

  // Boost handlers
  const handleBoostOffer = (offer: any) => {
    setBoostingItem({ type: 'offer', item: offer })
    setIsBoostModalOpen(true)
  }

  const handleBoostEvent = (event: any) => {
    setBoostingItem({ type: 'event', item: event })
    setIsBoostModalOpen(true)
  }

  const handleBoostCommerce = (commerce: any) => {
    setBoostingItem({ type: 'commerce', item: commerce })
    setIsBoostModalOpen(true)
  }

  const handleApplyBoost = async (boostType: 'en_vedette' | 'visibilite') => {
    if (!boostingItem || !boostCredits) return

    const availableCredits = boostType === 'en_vedette' 
      ? boostCredits.available_en_vedette 
      : boostCredits.available_visibilite

    if (availableCredits <= 0) {
      // Close boost modal and show purchase form
      setIsBoostModalOpen(false)
      setShowPurchaseForm(boostType)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if content is already boosted
      const tableName = boostingItem.type === 'offer' ? 'offers' : boostingItem.type === 'event' ? 'events' : 'commerces'
      const { data: existingContent } = await supabase
        .from(tableName)
        .select('boosted')
        .eq('id', boostingItem.item.id)
        .single()

      if (existingContent?.boosted) {
      toast({
        title: t('commerceCard.alreadyBoosted', locale),
        description: t('commerceCard.alreadyBoostedDesc', locale),
        variant: "destructive"
      })
        return
      }

      // Apply boost
      await supabase
        .from(tableName)
        .update({
          boosted: true,
          boost_type: boostType,
          boosted_at: new Date().toISOString()
        })
        .eq('id', boostingItem.item.id)

      // Update boost credits
      const newCredits = {
        [boostType === 'en_vedette' ? 'available_en_vedette' : 'available_visibilite']:
          (boostType === 'en_vedette' ? boostCredits.available_en_vedette : boostCredits.available_visibilite) - 1
      }

      await supabase
        .from('user_boost_credits')
        .update(newCredits)
        .eq('user_id', user.id)

      // Update local state
      setBoostCredits(prev => prev ? {
        ...prev,
        [boostType === 'en_vedette' ? 'available_en_vedette' : 'available_visibilite']:
          (boostType === 'en_vedette' ? prev.available_en_vedette : prev.available_visibilite) - 1
      } : null)

      toast({
        title: t('commerceCard.boostApplied', locale),
        description: `${t('commerceCard.your', locale)} ${boostingItem.type === 'offer' ? t('commerceCard.offer', locale) : boostingItem.type === 'event' ? t('commerceCard.event', locale) : t('commerceCard.business', locale)} ${t('commerceCard.boostAppliedDesc', locale)}`,
      })

      setIsBoostModalOpen(false)
      setBoostingItem(null)
      
      // Refresh the dashboard to show updated data
      onRefresh()

    } catch (error) {
      console.error('Error applying boost:', error)
      toast({
        title: t('commerceCard.error', locale),
        description: t('commerceCard.cannotApplyBoost', locale),
        variant: "destructive"
      })
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

  const handlePurchaseCancel = () => {
    setShowPurchaseForm(null)
    // Close all modals when canceling payment
    setIsBoostModalOpen(false)
    setBoostingItem(null)
  }

  const getOfferStatus = (offer: any) => {
    if (!offer.is_active) return { label: t('commerceCard.finished', locale), variant: 'secondary' as const }
    return { label: t('commerceCard.active', locale), variant: 'default' as const }
  }

  const getEventStatus = () => {
    return { label: t('commerceCard.upcoming', locale), variant: 'default' as const }
  }

  const handleEditOffer = (offer: any) => {
    setEditingOffer(offer)
    setIsEditOfferDialogOpen(true)
  }

  const handleOfferUpdated = () => {
    setIsEditOfferDialogOpen(false)
    setEditingOffer(null)
    // Refresh the dashboard to show updated data
    onRefresh()
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setIsEditEventDialogOpen(true)
  }

  const handleEventUpdated = () => {
    setIsEditEventDialogOpen(false)
    setEditingEvent(null)
    // Refresh the dashboard to show updated data
    onRefresh()
  }

  const handleCreateOffer = () => {
    router.push('/dashboard/offres?create=true')
  }

  const handleCreateEvent = () => {
    router.push('/dashboard/evenements?create=true')
  }

  const handleManageCommerce = () => {
    setIsManageCommerceDialogOpen(true)
  }

  const handleCommerceUpdated = () => {
    setIsManageCommerceDialogOpen(false)
    // Refresh the dashboard to show updated data
    onRefresh()
  }

  const handleDeleteCommerce = () => {
    setIsDeleteCommerceConfirmOpen(true)
  }

  const confirmDeleteCommerce = async () => {
    try {
      const supabase = createClient()

      // Handle offers: check if they have other commerce associations
      if (commerce.offers && commerce.offers.length > 0) {
        for (const offer of commerce.offers) {
          // Get all junction associations for this offer
          const { data: associations } = await supabase
            .from('offer_commerces')
            .select('commerce_id')
            .eq('offer_id', offer.id)

          const otherAssociations = (associations || []).filter(a => a.commerce_id !== commerce.id)

          if (otherAssociations.length === 0) {
            // No other associations - delete the offer
            await supabase.from('offers').delete().eq('id', offer.id)
          } else if (offer.commerce_id === commerce.id) {
            // This was the primary commerce - reassign to next association
            await supabase
              .from('offers')
              .update({ commerce_id: otherAssociations[0].commerce_id })
              .eq('id', offer.id)
          }
          // Remove junction association (CASCADE will handle this, but be explicit)
          await supabase
            .from('offer_commerces')
            .delete()
            .eq('offer_id', offer.id)
            .eq('commerce_id', commerce.id)
        }
      }

      // Handle events: same logic
      if (commerce.events && commerce.events.length > 0) {
        for (const event of commerce.events) {
          const { data: associations } = await supabase
            .from('event_commerces')
            .select('commerce_id')
            .eq('event_id', event.id)

          const otherAssociations = (associations || []).filter(a => a.commerce_id !== commerce.id)

          if (otherAssociations.length === 0) {
            // No other associations - delete the event
            await supabase.from('events').delete().eq('id', event.id)
          } else if (event.commerce_id === commerce.id) {
            // Reassign primary commerce
            await supabase
              .from('events')
              .update({ commerce_id: otherAssociations[0].commerce_id })
              .eq('id', event.id)
          }
          await supabase
            .from('event_commerces')
            .delete()
            .eq('event_id', event.id)
            .eq('commerce_id', commerce.id)
        }
      }

      // Finally delete the commerce
      const { error } = await supabase
        .from('commerces')
        .delete()
        .eq('id', commerce.id)

      if (error) {
        console.error('Error deleting commerce:', error)
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du commerce",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Succès",
        description: "Commerce supprimé avec succès",
      })

      setIsDeleteCommerceConfirmOpen(false)

      // Refresh the dashboard to show updated data
      onRefresh()
    } catch (error) {
      console.error('Unexpected error deleting commerce:', error)
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la suppression",
        variant: "destructive"
      })
    }
  }

  const handleDeleteOffer = (offer: any) => {
    setItemToDelete({ type: 'offer', item: offer })
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteEvent = (event: any) => {
    setItemToDelete({ type: 'event', item: event })
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const supabase = createClient()
      const table = itemToDelete.type === 'offer' ? 'offers' : 'events'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.item.id)

      if (error) {
        console.error(`Error deleting ${itemToDelete.type}:`, error)
        toast({
          title: "Erreur",
          description: `Erreur lors de la suppression de l'${itemToDelete.type === 'offer' ? 'offre' : 'événement'}`,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Succès",
        description: `${itemToDelete.type === 'offer' ? 'Offre' : 'Événement'} supprimé avec succès`,
      })

      setIsDeleteConfirmOpen(false)
      setItemToDelete(null)
      
      // Refresh the dashboard to show updated data
      onRefresh()
    } catch (error) {
      console.error(`Unexpected error deleting ${itemToDelete.type}:`, error)
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la suppression",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-6">
                 <CardTitle className="flex flex-row sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-0">
           <div className="flex items-center space-x-2 sm:space-x-3">
             {commerce.image_url && (
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                 <img
                   src={commerce.image_url}
                   alt={commerce.name}
                   className="w-full h-full object-cover"
                 />
               </div>
             )}
             <div className="flex flex-col">
               <span className="text-base sm:text-xl font-semibold">{commerce.name}</span>
               {commerce.boosted && commerce.boost_type && !isBoostExpired(commerce.boosted_at) && (
                 <div className="flex items-center gap-3 mt-2">
                   <Badge className="w-fit text-sm font-semibold border px-3 py-1 shadow-md" 
                          style={{ backgroundColor: 'rgb(222,243,248)', borderColor: 'rgb(105,200,221)', color: 'rgb(70,130,180)' }}>
                     <TrendingUp className="h-4 w-4 mr-2" style={{ color: 'rgb(70,130,180)' }} />
                     {t('commerceCard.visibilityBoost', locale)}
                   </Badge>
                   <span className="text-sm font-medium" style={{ color: 'rgb(70,130,180)' }}>
                     {formatBoostRemainingTime(commerce.boosted_at, locale)}
                   </span>
                 </div>
               )}
             </div>
           </div>
           <div className="flex flex-row items-center gap-2">
             {!(commerce.boosted && commerce.boost_type && !isBoostExpired(commerce.boosted_at)) && (
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => handleBoostCommerce(commerce)}
                 className="h-8 w-8 sm:h-8 sm:w-auto p-0 sm:px-3 border-0"
                 style={{ 
                   backgroundColor: 'rgb(222,243,248)', 
                   borderColor: 'rgb(105,200,221)',
                   color: 'rgb(70,130,180)'
                 }}
               >
                 <TrendingUp className="h-4 w-4 sm:hidden" style={{ color: 'rgb(70,130,180)' }} />
                 <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" style={{ color: 'rgb(70,130,180)' }} />
                 <span className="hidden sm:inline">{locale === 'fr' ? `Booster Visibilité (${boostCredits?.available_visibilite || 0})` : `Boost Visibility (${boostCredits?.available_visibilite || 0})`}</span>
               </Button>
             )}
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleManageCommerce}
               className="h-8 w-8 sm:h-8 sm:w-auto p-0 sm:px-3"
             >
               <Edit className="h-4 w-4 sm:hidden" />
               <span className="hidden sm:inline">{t('commerceCard.manageBusiness', locale)}</span>
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-8 w-8 sm:h-8 sm:w-8 p-0 hover:bg-red-50 text-red-600"
               onClick={handleDeleteCommerce}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
           </div>
         </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {commerce.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-6">
        {/* Offers Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 sm:mb-4 flex items-center text-sm sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" style={{ color: 'rgb(0,82,102)' }} />
{t('commerceCard.activeOffers', locale)}
          </h4>
          {activeOffers.length > 0 ? (
            activeOffers.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-2 sm:p-4 mb-2 sm:mb-4" style={{ backgroundColor: 'rgba(0,82,102,0.05)', borderColor: 'rgba(0,82,102,0.2)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1">
                    {offer.image_url && (
                      <div className="w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base mb-1">{offer.title}</h5>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Badge variant={getOfferStatus(offer).variant} className="text-xs w-fit">
                          {getOfferStatus(offer).label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {t('commerceCard.expiresOn', locale)} {new Date(offer.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1">
                    <button 
                      className="px-2 py-1 sm:px-2 sm:py-1 text-xs bg-brand-light/20 border border-brand-primary/30 text-brand-primary hover:bg-brand-light/30 hover:border-brand-primary/50 rounded min-h-[36px] sm:min-h-[32px] flex items-center"
                      onClick={() => handleBoostOffer(offer)}
                    >
                      <Sparkles className="h-3 w-3 mr-1 text-brand-primary" />
                      {locale === 'fr' ? `Booster Vedette (${boostCredits?.available_en_vedette || 0})` : `Boost Featured (${boostCredits?.available_en_vedette || 0})`}
                    </button>
                    <button 
                      className="p-1 sm:p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded min-h-[36px] sm:min-h-[32px]"
                      onClick={() => handleEditOffer(offer)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 sm:p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded min-h-[36px] sm:min-h-[32px]"
                      onClick={() => handleDeleteOffer(offer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-4">{t('commerceCard.noActiveOffers', locale)}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateOffer}
                disabled={!counts.canCreateContent}
                className="h-10 sm:h-8 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
{counts.canCreateContent ? t('commerceCard.createOffer', locale) : t('commerceCard.limitReached', locale)}
              </Button>
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 sm:mb-4 flex items-center text-sm sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
{t('commerceCard.upcomingEvents', locale)}
          </h4>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => (
              <div key={event.id} className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-4 mb-2 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1">
                    {event.image_url && (
                      <div className="w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base mb-1">{event.title}</h5>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Badge variant={getEventStatus().variant} className="text-xs w-fit">
                          {getEventStatus().label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1">
                    <button 
                      className="px-2 py-1 sm:px-2 sm:py-1 text-xs bg-brand-light/20 border border-brand-primary/30 text-brand-primary hover:bg-brand-light/30 hover:border-brand-primary/50 rounded min-h-[36px] sm:min-h-[32px] flex items-center"
                      onClick={() => handleBoostEvent(event)}
                    >
                      <Sparkles className="h-3 w-3 mr-1 text-brand-primary" />
                      {locale === 'fr' ? `Booster Vedette (${boostCredits?.available_en_vedette || 0})` : `Boost Featured (${boostCredits?.available_en_vedette || 0})`}
                    </button>
                    <button 
                      className="p-1 sm:p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded min-h-[36px] sm:min-h-[32px]"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 sm:p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded min-h-[36px] sm:min-h-[32px]"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-6">
              <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-4">{t('commerceCard.noUpcomingEvents', locale)}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateEvent}
                disabled={!counts.canCreateContent}
                className="h-10 sm:h-8 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
{counts.canCreateContent ? t('commerceCard.createEvent', locale) : t('commerceCard.limitReached', locale)}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Edit Offer Dialog */}
    <Dialog open={isEditOfferDialogOpen} onOpenChange={setIsEditOfferDialogOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('modals.editOffer', locale)}</DialogTitle>
          <DialogDescription>
            {t('modals.editOfferDesc', locale)}
          </DialogDescription>
        </DialogHeader>
        {editingOffer && (
          <OfferCreationFlow 
            offer={editingOffer}
            onCancel={handleOfferUpdated}
          />
                 )}
       </DialogContent>
     </Dialog>

     {/* Delete Confirmation Dialog */}
     <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>{t('modals.confirmDelete', locale)}</DialogTitle>
           <DialogDescription>
             {t('modals.confirmDeleteDesc', locale)} {itemToDelete?.type === 'offer' ? t('modals.thisOffer', locale) : t('modals.thisEvent', locale)} ? 
             {t('modals.actionIrreversible', locale)}
           </DialogDescription>
         </DialogHeader>
         <div className="py-4">
           <p className="text-sm text-muted-foreground">
             <strong>{itemToDelete?.item?.title}</strong>
           </p>
         </div>
         <div className="flex justify-end space-x-2">
           <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
             {t('modals.cancel', locale)}
           </Button>
           <Button 
             variant="destructive" 
             onClick={confirmDelete}
           >
             {t('modals.delete', locale)}
           </Button>
         </div>
       </DialogContent>
     </Dialog>


     {/* Edit Event Dialog */}
     <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Modifier l'événement</DialogTitle>
           <DialogDescription>
             Modifiez les informations de votre événement.
           </DialogDescription>
         </DialogHeader>
         {editingEvent && (
           <EventCreationFlow 
             event={editingEvent}
             onCancel={handleEventUpdated}
           />
         )}
       </DialogContent>
     </Dialog>

     {/* Manage Commerce Dialog */}
     <Dialog open={isManageCommerceDialogOpen} onOpenChange={setIsManageCommerceDialogOpen}>
       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Gérer le commerce</DialogTitle>
           <DialogDescription>
             Modifiez les informations de {commerce.name}.
           </DialogDescription>
         </DialogHeader>
         <CommerceManagementFlow 
           commerce={commerce}
           onCancel={handleCommerceUpdated}
           onCommerceUpdated={handleCommerceUpdated}
         />
       </DialogContent>
     </Dialog>

     {/* Boost Modal */}
     <Dialog open={isBoostModalOpen} onOpenChange={setIsBoostModalOpen}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Booster votre {boostingItem?.type === 'offer' ? 'offre' : boostingItem?.type === 'event' ? 'événement' : 'commerce'}</DialogTitle>
           <DialogDescription>
             {boostingItem?.type === 'commerce' 
               ? `Boostez la visibilité de "${boostingItem?.item?.name}" sur la carte pendant 72 heures.`
               : `Choisissez le type de boost pour augmenter la visibilité de "${boostingItem?.item?.title}" pendant 72 heures.`
             }
           </DialogDescription>
         </DialogHeader>
         <div>
           {boostingItem?.type === 'commerce' ? (
             /* Visibilité Boost for Commerce */
             <div className="border rounded-lg p-4" 
                  style={{ backgroundColor: 'rgb(222,243,248)', borderColor: 'rgb(105,200,221)' }}>
               <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 rounded-full" style={{ backgroundColor: 'rgb(200,235,245)' }}>
                   <TrendingUp className="h-5 w-5" style={{ color: 'rgb(70,130,180)' }} />
                 </div>
                 <div>
                   <h4 className="font-medium" style={{ color: 'rgb(70,130,180)' }}>Visibilité</h4>
                   <p className="text-xs" style={{ color: 'rgb(70,130,180)' }}>72h de portée élargie</p>
                 </div>
               </div>
               <ul className="text-xs space-y-1 mb-3" style={{ color: 'rgb(70,130,180)' }}>
                 <li>• Plus visible sur la carte</li>
                 <li>• Augmente le trafic</li>
                 <li>• Portée géographique élargie</li>
               </ul>
               <Button
                 onClick={() => handleApplyBoost('visibilite')}
                 className="w-full text-white text-sm"
                 style={{ 
                   backgroundColor: 'rgb(70,130,180)', 
                   borderColor: 'rgb(70,130,180)'
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgb(60,120,170)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgb(70,130,180)' }}
                 size="sm"
               >
                 {boostCredits?.available_visibilite ? 
                   `Utiliser crédit (${boostCredits.available_visibilite} dispo)` : 
                   "Acheter 5$"
                 }
               </Button>
             </div>
           ) : (
             /* En Vedette Boost for Offers/Events */
             <div className="border border-brand-primary/30 rounded-lg p-4 bg-brand-light/20">
               <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-brand-light/20 rounded-full">
                   <Sparkles className="h-5 w-5 text-brand-primary" />
                 </div>
                 <div>
                   <h4 className="font-medium text-brand-primary">En Vedette</h4>
                   <p className="text-xs text-brand-primary">72h de visibilité premium</p>
                 </div>
               </div>
               <ul className="text-xs text-brand-primary space-y-1 mb-3">
                 <li>• {t('boostsPage.vedetteBadge', locale)}</li>
                 <li>• {t('boostsPage.priorityPlacement', locale)}</li>
                 <li>• {t('boostsPage.topSearchResults', locale)}</li>
                 <li>• {t('boostsPage.featuredOnWebsite', locale).split('gosholo.com').map((part, i, arr) => 
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
                 className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm"
                 size="sm"
               >
                 {boostCredits?.available_en_vedette ? 
                   `Utiliser crédit (${boostCredits.available_en_vedette} dispo)` : 
                   "Acheter 5$"
                 }
               </Button>
             </div>
           )}
         </div>
       </DialogContent>
     </Dialog>

     {/* Delete Commerce Confirmation Dialog */}
     <Dialog open={isDeleteCommerceConfirmOpen} onOpenChange={setIsDeleteCommerceConfirmOpen}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>Confirmer la suppression du commerce</DialogTitle>
           <DialogDescription>
             Êtes-vous sûr de vouloir supprimer ce commerce ? Cette action supprimera également toutes les offres et événements associés.
             Cette action est irréversible.
           </DialogDescription>
         </DialogHeader>
         <div className="py-4">
           <p className="text-sm text-muted-foreground">
             <strong>{commerce.name}</strong>
           </p>
           {(commerce.offers?.length || 0) + (commerce.events?.length || 0) > 0 && (
             <p className="text-sm text-red-600 mt-2">
               ⚠️ Ce commerce contient {commerce.offers?.length || 0} offre(s) et {commerce.events?.length || 0} événement(s) qui seront également supprimé(s).
             </p>
           )}
         </div>
         <div className="flex justify-end space-x-2">
           <Button variant="outline" onClick={() => setIsDeleteCommerceConfirmOpen(false)}>
             Annuler
           </Button>
           <Button 
             variant="destructive" 
             onClick={confirmDeleteCommerce}
           >
             Supprimer le commerce
           </Button>
         </div>
       </DialogContent>
     </Dialog>

     {/* Purchase Form Modal */}
     {showPurchaseForm && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="max-w-md w-full">
           <BoostPurchaseForm
             boostType={showPurchaseForm}
             onSuccess={handlePurchaseSuccess}
             onCancel={handlePurchaseCancel}
           />
         </div>
       </div>
     )}
     </>
   )
}

export default CommerceCard