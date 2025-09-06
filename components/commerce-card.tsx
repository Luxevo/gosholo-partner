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
  Settings
} from "lucide-react"
import CommerceManagementFlow from "@/components/commerce-management-flow"
import OfferCreationFlow from "@/components/offer-creation-flow"
import EventCreationFlow from "@/components/event-creation-flow"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import BoostPurchaseForm from "@/components/boost-purchase-form"

interface CommerceCardProps {
  commerce: any
  onRefresh: () => void
}

const CommerceCard = ({ commerce, onRefresh }: CommerceCardProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [isEditOfferDialogOpen, setIsEditOfferDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<any>(null)
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'offer' | 'event', item: any} | null>(null)
  const [isManageCommerceDialogOpen, setIsManageCommerceDialogOpen] = useState(false)
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false)
  const [boostingItem, setBoostingItem] = useState<{type: 'offer' | 'event', item: any} | null>(null)
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

  const handleApplyBoost = async (boostType: 'en_vedette' | 'visibilite') => {
    if (!boostingItem || !boostCredits) return

    const availableCredits = boostType === 'en_vedette' 
      ? boostCredits.available_en_vedette 
      : boostCredits.available_visibilite

    if (availableCredits <= 0) {
      // Show purchase form
      setShowPurchaseForm(boostType)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if content is already boosted
      const tableName = boostingItem.type === 'offer' ? 'offers' : 'events'
      const { data: existingContent } = await supabase
        .from(tableName)
        .select('boosted')
        .eq('id', boostingItem.item.id)
        .single()

      if (existingContent?.boosted) {
        toast({
          title: "Déjà boosté",
          description: "Ce contenu est déjà boosté.",
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
        title: "Boost appliqué !",
        description: `Votre ${boostingItem.type === 'offer' ? 'offre' : 'événement'} est maintenant boosté pour 72 heures.`,
      })

      setIsBoostModalOpen(false)
      setBoostingItem(null)

    } catch (error) {
      console.error('Error applying boost:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le boost.",
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

  const getOfferStatus = (offer: any) => {
    if (!offer.is_active) return { label: 'Terminée', variant: 'secondary' as const }
    return { label: 'Active', variant: 'default' as const }
  }

  const getEventStatus = (event: any) => {
    return { label: 'À venir', variant: 'default' as const }
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
      
      // First delete all associated offers
      if (commerce.offers && commerce.offers.length > 0) {
        const { error: offersError } = await supabase
          .from('offers')
          .delete()
          .eq('commerce_id', commerce.id)
        
        if (offersError) {
          console.error('Error deleting offers:', offersError)
          toast({
            title: "Erreur",
            description: "Erreur lors de la suppression des offres associées",
            variant: "destructive"
          })
          return
        }
      }

      // Then delete all associated events
      if (commerce.events && commerce.events.length > 0) {
        const { error: eventsError } = await supabase
          .from('events')
          .delete()
          .eq('commerce_id', commerce.id)
        
        if (eventsError) {
          console.error('Error deleting events:', eventsError)
          toast({
            title: "Erreur",
            description: "Erreur lors de la suppression des événements associés",
            variant: "destructive"
          })
          return
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
             <span className="text-base sm:text-xl font-semibold">{commerce.name}</span>
           </div>
           <div className="flex flex-row items-center gap-2">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleManageCommerce}
               className="h-8 w-8 sm:h-8 sm:w-auto p-0 sm:px-3"
             >
               <Edit className="h-4 w-4 sm:hidden" />
               <span className="hidden sm:inline">Gérer ce commerce</span>
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
            Offres actives
          </h4>
          {activeOffers.length > 0 ? (
            activeOffers.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-2 sm:p-4 mb-2 sm:mb-4" style={{ backgroundColor: 'rgba(0,82,102,0.05)', borderColor: 'rgba(0,82,102,0.2)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1">
                    {offer.image_url && (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                          Expire le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1">
                    <button 
                      className="px-2 py-1 sm:px-2 sm:py-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded min-h-[36px] sm:min-h-[32px]"
                      onClick={() => handleBoostOffer(offer)}
                    >
                      Boost
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
              <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-4">Aucune offre en cours</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateOffer}
                className="h-10 sm:h-8 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une offre
              </Button>
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 sm:mb-4 flex items-center text-sm sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
            Événements à venir
          </h4>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => (
              <div key={event.id} className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-4 mb-2 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1">
                    {event.image_url && (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                        <Badge variant={getEventStatus(event).variant} className="text-xs w-fit">
                          {getEventStatus(event).label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1">
                    <button 
                      className="px-2 py-1 sm:px-2 sm:py-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded min-h-[36px] sm:min-h-[32px]"
                      onClick={() => handleBoostEvent(event)}
                    >
                      Boost
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
              <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-4">Aucun événement à venir</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateEvent}
                className="h-10 sm:h-8 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
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
          <DialogTitle>Modifier l'offre</DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre offre.
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
           <DialogTitle>Confirmer la suppression</DialogTitle>
           <DialogDescription>
             Êtes-vous sûr de vouloir supprimer {itemToDelete?.type === 'offer' ? 'cette offre' : 'cet événement'} ? 
             Cette action est irréversible.
           </DialogDescription>
         </DialogHeader>
         <div className="py-4">
           <p className="text-sm text-muted-foreground">
             <strong>{itemToDelete?.item?.title}</strong>
           </p>
         </div>
         <div className="flex justify-end space-x-2">
           <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
             Annuler
           </Button>
           <Button 
             variant="destructive" 
             onClick={confirmDelete}
           >
             Supprimer
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
           <DialogTitle>Booster votre {boostingItem?.type === 'offer' ? 'offre' : 'événement'}</DialogTitle>
           <DialogDescription>
             Choisissez le type de boost pour augmenter la visibilité de "{boostingItem?.item?.title}" pendant 72 heures.
           </DialogDescription>
         </DialogHeader>
         <div>
           {/* En Vedette Boost */}
           <div className="border rounded-lg p-4">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-orange-100 rounded-full">
                 <Sparkles className="h-5 w-5 text-orange-600" />
               </div>
               <div>
                 <h4 className="font-medium text-orange-800">En Vedette</h4>
                 <p className="text-xs text-orange-600">72h de visibilité premium</p>
               </div>
             </div>
             <ul className="text-xs text-orange-700 space-y-1 mb-3">
               <li>• Badge "En Vedette" visible</li>
               <li>• Priorité dans les recherches</li>
               <li>• Mise en avant sur la carte</li>
             </ul>
             <Button
               onClick={() => handleApplyBoost('en_vedette')}
               className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
               size="sm"
             >
               {boostCredits?.available_en_vedette ? 
                 `Utiliser crédit (${boostCredits.available_en_vedette} dispo)` : 
                 "Acheter 5$"
               }
             </Button>
           </div>
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
             onCancel={() => setShowPurchaseForm(null)}
           />
         </div>
       </div>
     )}
     </>
   )
}

export default CommerceCard