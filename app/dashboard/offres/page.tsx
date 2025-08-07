"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Tag, Calendar, DollarSign, Users, Edit, BarChart3, MapPin, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import OfferCreationFlow from "@/components/offer-creation-flow"
import { checkAndDeactivateOffers, getDaysRemaining, getOfferStatus } from "@/lib/offer-utils"

// Types
interface Offer {
  id: string
  commerce_id: string
  user_id: string
  title: string
  description: string
  picture: string | null
  offer_type: "in_store" | "online" | "both"
  uses_commerce_location: boolean
  custom_location: string | null
  condition: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
  start_date: string | null
  end_date: string | null
}

type FilterType = 'all' | 'active' | 'inactive'

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "in_store":
      return "En magasin"
    case "online":
      return "En ligne"
    case "both":
      return "Les deux"
    default:
      return type
  }
}

// OfferCard Component
interface OfferCardProps {
  offer: Offer
  onEdit: (offer: Offer) => void
}

const OfferCard = ({ offer, onEdit }: OfferCardProps) => {
  const status = getOfferStatus(offer.is_active, offer.created_at || '')
  const daysRemaining = getDaysRemaining(offer.created_at || '')
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-primary">
              {offer.title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {offer.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(offer)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Offer Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span>{getTypeLabel(offer.offer_type)}</span>
            </div>
            
            {offer.condition && (
              <div className="flex items-start gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="font-medium">Condition:</span>
                <span className="text-muted-foreground">{offer.condition}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Localisation:</span>
              <span>
                {offer.uses_commerce_location 
                  ? "Emplacement du commerce" 
                  : offer.custom_location || "Non spécifié"
                }
              </span>
            </div>
          </div>
          
          {/* Timing and Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Créée le:</span>
              <span>{offer.created_at ? formatDate(offer.created_at) : "N/A"}</span>
            </div>
            
            {offer.is_active && daysRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Jours restants:</span>
                <span className={daysRemaining <= 7 ? "text-orange-600 font-medium" : ""}>
                  {daysRemaining} jours
                </span>
              </div>
            )}
            
            {offer.updated_at && offer.updated_at !== offer.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Modifiée le:</span>
                <span className="text-blue-600 font-medium">{formatDate(offer.updated_at)}</span>
              </div>
            )}
            
            {offer.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Début:</span>
                <span className="text-green-600 font-medium">{formatDate(offer.start_date)}</span>
              </div>
            )}
            
            {offer.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fin:</span>
                <span className="text-red-600 font-medium">{formatDate(offer.end_date)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Filter Buttons Component
interface FilterButtonsProps {
  filterActive: FilterType
  onFilterChange: (filter: FilterType) => void
  offers: Offer[]
}

const FilterButtons = ({ filterActive, onFilterChange, offers }: FilterButtonsProps) => {
  const activeCount = offers.filter(o => o.is_active).length
  const inactiveCount = offers.filter(o => !o.is_active).length
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filterActive === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        Toutes ({offers.length})
      </Button>
      <Button
        variant={filterActive === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('active')}
      >
        Actives ({activeCount})
      </Button>
      <Button
        variant={filterActive === 'inactive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('inactive')}
      >
        Expirées ({inactiveCount})
      </Button>
    </div>
  )
}

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Chargement des offres...</p>
    </div>
  </div>
)

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      <Tag className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-primary mb-2">Aucune offre trouvée</h3>
    <p className="text-muted-foreground mb-4">
      Commencez par créer votre première offre pour attirer plus de clients.
    </p>
  </div>
)

// Main Component
export default function OffresPage() {
  const supabase = createClient()
  
  // State
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoadingOffers, setIsLoadingOffers] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [filterActive, setFilterActive] = useState<FilterType>('all')

  // Load offers from database
  const loadOffers = async () => {
    try {
      console.log('Loading offers...')
      setIsLoadingOffers(true)
      
      // First check and deactivate old offers using utility function
      await checkAndDeactivateOffers()
      
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Authentication error:', userError)
        setIsLoadingOffers(false)
        return
      }

      if (!user) {
        console.log('No user found')
        setIsLoadingOffers(false)
        return
      }

      console.log('User authenticated:', user.id)

      // First get user's commerces
      const { data: commercesData, error: commercesError } = await supabase
        .from('commerces')
        .select('id')
        .eq('user_id', user.id)

      if (commercesError) {
        console.error('Error loading commerces:', commercesError)
        setIsLoadingOffers(false)
        return
      }

      if (!commercesData || commercesData.length === 0) {
        console.log('No commerces found for user')
        setOffers([])
        setIsLoadingOffers(false)
        return
      }

      const commerceIds = commercesData.map(c => c.id)

      // Query offers for user's commerces
      const { data: offersData, error } = await supabase
        .from('offers')
        .select('*')
        .in('commerce_id', commerceIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        setIsLoadingOffers(false)
        return
      }

      console.log('Offers loaded:', offersData)
      console.log('First offer dates:', offersData?.[0] ? {
        start_date: offersData[0].start_date,
        end_date: offersData[0].end_date
      } : 'No offers')
      setOffers(offersData || [])
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoadingOffers(false)
    }
  }

  // Load offers on component mount
  useEffect(() => {
    loadOffers()
  }, [])

  // Filtered offers
  const filteredOffers = useMemo(() => {
    switch (filterActive) {
      case 'active':
        return offers.filter(offer => offer.is_active)
      case 'inactive':
        return offers.filter(offer => !offer.is_active)
      default:
        return offers
    }
  }, [offers, filterActive])

  // Event handlers
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setIsEditDialogOpen(true)
  }

  const handleOfferCreated = () => {
    setIsDialogOpen(false)
    loadOffers()
  }

  const handleOfferUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingOffer(null)
    loadOffers()
  }

  const handleFilterChange = (filter: FilterType) => {
    setFilterActive(filter)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Offres</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Gérez vos offres et promotions
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/80 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Créer une offre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle offre</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle offre.
              </DialogDescription>
            </DialogHeader>
            <OfferCreationFlow onCancel={handleOfferCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <FilterButtons 
        filterActive={filterActive}
        onFilterChange={handleFilterChange}
        offers={offers}
      />

      {/* Content */}
      <div className="space-y-4">
        {isLoadingOffers ? (
          <LoadingSpinner />
        ) : filteredOffers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {filteredOffers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onEdit={handleEditOffer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
    </div>
  )
}
