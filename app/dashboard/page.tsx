"use client"

import { useState } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Store, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"
import CommerceCreationFlow from "@/components/commerce-creation-flow"
import CommerceManagementFlow from "@/components/commerce-management-flow"
import OfferCreationFlow from "@/components/offer-creation-flow"
import EventCreationFlow from "@/components/event-creation-flow"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

// CommerceCard Component
interface CommerceCardProps {
  commerce: any
}

const CommerceCard = ({ commerce }: CommerceCardProps) => {
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
  
  const activeOffers = commerce.offers?.filter((offer: any) => offer.is_active) || []
  const upcomingEvents = commerce.events || [] // For now, consider all events as upcoming

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
    window.location.reload()
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setIsEditEventDialogOpen(true)
  }

  const handleEventUpdated = () => {
    setIsEditEventDialogOpen(false)
    setEditingEvent(null)
    // Refresh the dashboard to show updated data
    window.location.reload()
  }

  const handleCreateOffer = () => {
    setIsCreateOfferDialogOpen(true)
  }

  const handleOfferCreated = () => {
    setIsCreateOfferDialogOpen(false)
    // Refresh the dashboard to show updated data
    window.location.reload()
  }

  const handleCreateEvent = () => {
    setIsCreateEventDialogOpen(true)
  }

  const handleEventCreated = () => {
    setIsCreateEventDialogOpen(false)
    // Refresh the dashboard to show updated data
    window.location.reload()
  }

  const handleManageCommerce = () => {
    setIsManageCommerceDialogOpen(true)
  }

  const handleCommerceUpdated = () => {
    setIsManageCommerceDialogOpen(false)
    // Refresh the dashboard to show updated data
    window.location.reload()
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
      window.location.reload()
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
                     <Button variant="outline" size="sm" onClick={handleManageCommerce}>
             Gérer ce commerce
           </Button>
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
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
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
                   <div className="flex items-center space-x-1">
                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <Zap className="h-4 w-4 text-orange-600" />
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 w-8 p-0"
                       onClick={() => handleEditOffer(offer)}
                     >
                       <Edit className="h-4 w-4 text-gray-600" />
                     </Button>
                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <CheckCircle className="h-4 w-4 text-green-600" />
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 w-8 p-0"
                       onClick={() => handleDeleteOffer(offer)}
                     >
                       <Trash2 className="h-4 w-4 text-red-600" />
                     </Button>
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
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
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
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Zap className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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
     </>
   )
 }

// Mock data for exclusive offers
const exclusiveOffers = [
  {
    id: 1,
    title: "Promotion spéciale -20%",
    description: "Sur tous les produits de boulangerie",
    commerce: "Boulangerie du Centre",
    validUntil: "31 décembre 2024",
    type: "exclusive"
  },
  {
    id: 2,
    title: "Menu dégustation",
    description: "Découvrez nos spécialités locales",
    commerce: "Restaurant Le Gourmet",
    validUntil: "15 janvier 2025",
    type: "exclusive"
  },
  {
    id: 3,
    title: "Service premium",
    description: "Livraison gratuite + cadeau surprise",
    commerce: "Café Central",
    validUntil: "28 février 2025",
    type: "exclusive"
  }
]

export default function Dashboard() {
  const { counts, userProfile, commerces, isLoading, refreshCounts } = useDashboard()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get user's display name
  const getUserDisplayName = () => {
    if (!userProfile) return "Partenaire"
    
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    } else if (userProfile.first_name) {
      return userProfile.first_name
    } else if (userProfile.last_name) {
      return userProfile.last_name
    } else {
      // Fallback to email or generic name
      return userProfile.email.split('@')[0] || "Partenaire"
    }
  }

  const stats = [
    {
      title: "Commerces",
      value: counts.commerces,
      change: "+12%",
      changeType: "positive",
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Offres actives",
      value: counts.offers,
      change: "+8%",
      changeType: "positive",
      icon: Tag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Événements",
      value: counts.events,
      change: "+15%",
      changeType: "positive",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#005266] mb-1">
          Bienvenue, {getUserDisplayName()} !
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de l'activité de vos commerces
        </p>
      </div>

      {/* Commerce Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Vos commerces</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un commerce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau commerce</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer un nouveau commerce.
                </DialogDescription>
              </DialogHeader>
              <CommerceCreationFlow onCancel={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement de vos commerces...</p>
          </div>
        ) : commerces.length > 0 ? (
          commerces.map((commerce) => (
            <CommerceCard key={commerce.id} commerce={commerce} />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commerce</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre premier commerce</p>
                             <Button onClick={() => setIsDialogOpen(true)}>
                 <Plus className="h-4 w-4 mr-2" />
                 Ajouter un commerce
               </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}