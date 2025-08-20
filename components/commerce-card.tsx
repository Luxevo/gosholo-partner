"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Tag, 
  Calendar, 
  TrendingUp, 
  Edit,
  Trash2,
  CheckCircle,
  Zap,
  Sparkles,
  Plus
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
  const [isEditOfferDialogOpen, setIsEditOfferDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<any>(null)
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'offer' | 'event', item: any} | null>(null)
  const [isCreateOfferDialogOpen, setIsCreateOfferDialogOpen] = useState(false)
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false)
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
    setIsCreateOfferDialogOpen(true)
  }

  const handleOfferCreated = () => {
    setIsCreateOfferDialogOpen(false)
    // Refresh the dashboard to show updated data
    onRefresh()
  }

  const handleCreateEvent = () => {
    setIsCreateEventDialogOpen(true)
  }

  const handleEventCreated = () => {
    setIsCreateEventDialogOpen(false)
    // Refresh the dashboard to show updated data
    onRefresh()
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
      <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {commerce.image_url && (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={commerce.image_url}
                  alt={commerce.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span>{commerce.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleManageCommerce}>
              Gérer ce commerce
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-red-50"
              onClick={handleDeleteCommerce}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {commerce.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offers Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Tag className="h-4 w-4 mr-2" style={{ color: 'rgb(0,82,102)' }} />
            Offres actives
          </h4>
          {activeOffers.length > 0 ? (
            activeOffers.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-3 mb-2" style={{ backgroundColor: 'rgba(0,82,102,0.05)', borderColor: 'rgba(0,82,102,0.2)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {offer.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{offer.title}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getOfferStatus(offer).variant} className="text-xs">
                          {getOfferStatus(offer).label}
                        </Badge>
                                               <span className="text-xs text-gray-500">
                           Expire le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                         </span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                       className="px-2 py-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded"
                       onClick={() => handleBoostOffer(offer)}
                     >
                       Boost
                     </button>
                     <button 
                       className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                       onClick={() => handleEditOffer(offer)}
                     >
                       <Edit className="h-4 w-4" />
                     </button>
                     <button 
                       className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded"
                       onClick={() => handleDeleteOffer(offer)}
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                </div>
              </div>
            ))
          ) : (
                         <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
               <p className="text-gray-600 text-sm mb-2">Aucune offre en cours</p>
               <Button variant="outline" size="sm" onClick={handleCreateOffer}>
                 <Plus className="h-4 w-4 mr-1" />
                 Créer une offre
               </Button>
             </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-orange-600" />
            Événements à venir
          </h4>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => (
              <div key={event.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {event.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{event.title}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getEventStatus(event).variant} className="text-xs">
                          {getEventStatus(event).label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="px-2 py-1 text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 rounded"
                      onClick={() => handleBoostEvent(event)}
                    >
                      Boost
                    </button>
                    <button 
                      className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
                         <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
               <p className="text-gray-600 text-sm mb-2">Aucun événement à venir</p>
               <Button variant="outline" size="sm" onClick={handleCreateEvent}>
                 <Plus className="h-4 w-4 mr-1" />
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

     {/* Create Offer Dialog */}
     <Dialog open={isCreateOfferDialogOpen} onOpenChange={setIsCreateOfferDialogOpen}>
       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Créer une nouvelle offre</DialogTitle>
           <DialogDescription>
             Créez une nouvelle offre pour {commerce.name}.
           </DialogDescription>
         </DialogHeader>
         <OfferCreationFlow 
           commerceId={commerce.id}
           onCancel={handleOfferCreated}
         />
       </DialogContent>
     </Dialog>

     {/* Create Event Dialog */}
     <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Créer un nouvel événement</DialogTitle>
           <DialogDescription>
             Créez un nouvel événement pour {commerce.name}.
           </DialogDescription>
         </DialogHeader>
         <EventCreationFlow 
           commerceId={commerce.id}
           onCancel={handleEventCreated}
         />
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
         <div className="space-y-4">
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

           {/* Visibilité Boost */}
           <div className="border rounded-lg p-4">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-blue-100 rounded-full">
                 <TrendingUp className="h-5 w-5 text-blue-600" />
               </div>
               <div>
                 <h4 className="font-medium text-blue-800">Visibilité</h4>
                 <p className="text-xs text-blue-600">72h de portée élargie</p>
               </div>
             </div>
             <ul className="text-xs text-blue-700 space-y-1 mb-3">
               <li>• Plus visible sur la carte</li>
               <li>• Augmente le trafic</li>
               <li>• Portée géographique élargie</li>
             </ul>
             <Button
               onClick={() => handleApplyBoost('visibilite')}
               className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
               size="sm"
             >
               {boostCredits?.available_visibilite ? 
                 `Utiliser crédit (${boostCredits.available_visibilite} dispo)` : 
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