"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Tag, Calendar, DollarSign, Users, Edit, BarChart3, MapPin, Clock, Building2, Trash2, LayoutGrid, List, Heart, Store, AlertCircle, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import OfferCreationFlow from "@/components/offer-creation-flow"
import { checkAndDeactivateOffers, getDaysRemaining, getOfferStatus } from "@/lib/offer-utils"
import { useDashboard } from "@/contexts/dashboard-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Types
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
}

interface Commerce {
  id: string
  name: string
  category: string | null
}

type FilterType = 'all' | 'active' | 'inactive'
type ViewType = 'admin' | 'customer'

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

// Customer View Offer Card Component
interface CustomerOfferCardProps {
  offer: Offer
  commerce: Commerce | undefined
  onEdit: (offer: Offer) => void
  onDelete: (offer: Offer) => void
}

const CustomerOfferCard = ({ offer, commerce, onEdit, onDelete }: CustomerOfferCardProps) => {
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!offer.end_date) return "Non défini"
    const endDate = new Date(offer.end_date)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      return diffHours > 0 ? `Se termine dans ${diffHours}h` : "Expiré"
    }
    return `Se termine dans ${diffDays}j`
  }

  // Extract discount percentage from title if present
  const getDiscountFromTitle = () => {
    const match = offer.title.match(/(\d+)%/)
    return match ? match[1] : "25" // Default to 25% if no percentage found
  }

  return (
    <div className="relative max-w-sm">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-500">
          {offer.image_url ? (
            <img 
              src={offer.image_url} 
              alt={offer.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <div className="text-white text-center">
                <Store className="h-12 w-12 mx-auto mb-2 opacity-80" />
                <p className="text-sm opacity-80">Image de l'offre</p>
              </div>
            </div>
          )}
          
          {/* Discount Badge */}
          <div className="absolute top-3 left-3">
            <div className="px-3 py-1 rounded-full text-sm font-bold flex items-center text-green-800" style={{ backgroundColor: '#B2FD9D' }}>
              <Tag className="h-3 w-3 mr-1" />
              {getDiscountFromTitle()}% OFF
            </div>
          </div>

          {/* Heart Icon */}
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
            <div className="flex justify-between items-center text-sm">
              <span>
                {offer.condition || "Conditions disponibles"} • {commerce?.category || "Restaurant"}
              </span>
              <div className="text-white px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FF6233' }}>
                {getTimeRemaining()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-white p-4" style={{ backgroundColor: '#FF6233' }}>
          <h3 className="text-lg font-bold mb-1 line-clamp-1">
            {offer.title}
          </h3>
          <div className="flex items-center text-sm opacity-90 mb-1">
            <span>{commerce?.category || "Restaurant"}</span>
            <span className="mx-2">•</span>
            <span>{commerce?.name || "Commerce"}</span>
          </div>
          <div className="flex items-center text-sm opacity-90 mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-xs">
              {offer.custom_location || commerce?.name || "Emplacement du commerce"}
            </span>
          </div>

          {/* Action Button */}
          <button className="bg-white font-semibold py-2 px-4 rounded-full hover:bg-orange-50 transition-colors w-auto" style={{ color: '#FF6233' }}>
            Réclamer l'offre
          </button>
        </div>
      </div>

      {/* Admin Actions Overlay */}
      <div className="absolute top-2 right-2 bg-white/95 rounded-lg p-1 shadow-md">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(offer)}
            className="h-7 w-7 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(offer)}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Admin OfferCard Component
interface OfferCardProps {
  offer: Offer
  onEdit: (offer: Offer) => void
  onDelete: (offer: Offer) => void
}

const OfferCard = ({ offer, onEdit, onDelete }: OfferCardProps) => {
  const status = getOfferStatus(offer.is_active, offer.created_at || '')
  const daysRemaining = getDaysRemaining(offer.created_at || '')
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
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
              <CardTitle className="text-lg font-semibold text-primary">
                {offer.title}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {offer.description}
              </CardDescription>
            </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(offer)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
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
                <span className={daysRemaining <= 7 ? "text-brand-accent font-medium" : ""}>
                  {daysRemaining} jours
                </span>
              </div>
            )}
            
            {offer.updated_at && offer.updated_at !== offer.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Modifiée le:</span>
                <span className="text-brand-secondary font-medium">{formatDate(offer.updated_at)}</span>
              </div>
            )}
            
            {offer.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Début:</span>
                <span className="text-brand-primary font-medium">{formatDate(offer.start_date)}</span>
              </div>
            )}
            
            {offer.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fin:</span>
                <span className="text-brand-accent font-medium">{formatDate(offer.end_date)}</span>
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

// View Toggle Component
interface ViewToggleProps {
  viewType: ViewType
  onViewChange: (view: ViewType) => void
}

const ViewToggle = ({ viewType, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      <Button
        variant={viewType === 'admin' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('admin')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        Gestion
      </Button>
      <Button
        variant={viewType === 'customer' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('customer')}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Aperçu client
      </Button>
    </div>
  )
}

// Commerce Filter Component
interface CommerceFilterProps {
  commerces: Commerce[]
  selectedCommerce: string
  onCommerceChange: (commerceId: string) => void
}

const CommerceFilter = ({ commerces, selectedCommerce, onCommerceChange }: CommerceFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Commerce:</span>
      <Select value={selectedCommerce} onValueChange={onCommerceChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tous les commerces" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les commerces</SelectItem>
          {commerces.map((commerce) => (
            <SelectItem key={commerce.id} value={commerce.id}>
              {commerce.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
function OffresPageContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const { counts, refreshCounts } = useDashboard()
  
  // State
  const [offers, setOffers] = useState<Offer[]>([])
  const [commerces, setCommerces] = useState<Commerce[]>([])
  const [isLoadingOffers, setIsLoadingOffers] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Offer | null>(null)
  const [filterActive, setFilterActive] = useState<FilterType>('all')
  const [selectedCommerce, setSelectedCommerce] = useState<string>('all')
  const [viewType, setViewType] = useState<ViewType>('customer')

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
        .select('id, name, category')
        .eq('user_id', user.id)

      if (commercesError) {
        console.error('Error loading commerces:', commercesError)
        setIsLoadingOffers(false)
        return
      }

      if (!commercesData || commercesData.length === 0) {
        console.log('No commerces found for user')
        setOffers([])
        setCommerces([]) // Ensure commerces state is also empty
        setIsLoadingOffers(false)
        return
      }

              const commerces = commercesData.map(c => ({ 
          id: c.id, 
          name: c.name, 
          category: c.category 
        }))
        setCommerces(commerces) // Set commerces state

      // Query offers for user's commerces
      const { data: offersData, error } = await supabase
        .from('offers')
        .select('*')
        .in('commerce_id', commerces.map(c => c.id))
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

  // Auto-open dialog if create parameter is present
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsDialogOpen(true)
    }
  }, [searchParams])

  // Filtered offers
  const filteredOffers = useMemo(() => {
    let filtered = offers

    // Filter by commerce first
    if (selectedCommerce !== 'all') {
      filtered = filtered.filter(offer => offer.commerce_id === selectedCommerce)
    }

    // Then filter by status
    switch (filterActive) {
      case 'active':
        return filtered.filter(offer => offer.is_active)
      case 'inactive':
        return filtered.filter(offer => !offer.is_active)
      default:
        return filtered
    }
  }, [offers, filterActive, selectedCommerce])

  // Event handlers
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setIsEditDialogOpen(true)
  }

  const handleDeleteOffer = (offer: Offer) => {
    setItemToDelete(offer)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', itemToDelete.id)

      if (error) {
        console.error('Error deleting offer:', error)
        return
      }

      setIsDeleteConfirmOpen(false)
      setItemToDelete(null)
      loadOffers()
      refreshCounts() // Refresh dashboard commerce data
    } catch (error) {
      console.error('Unexpected error deleting offer:', error)
    }
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

  const handleCommerceChange = (commerceId: string) => {
    setSelectedCommerce(commerceId)
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
            <Button 
              className="bg-accent hover:bg-accent/80 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!counts.canCreateContent}
              title={!counts.canCreateContent ? 'Limite de contenu atteinte. Passez au plan Pro pour créer plus de contenu.' : ''}
            >
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

      {/* Content Limit Banner */}
      {counts.subscriptionPlan === 'free' && (
        <Alert className={`border-l-4 ${counts.canCreateContent ? 'border-l-blue-500 bg-blue-50' : 'border-l-amber-500 bg-amber-50'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-medium">Plan Gratuit:</span> {counts.totalContent}/{counts.contentLimit} contenu utilisé
                {!counts.canCreateContent && (
                  <span className="text-amber-700 ml-2">- Limite atteinte!</span>
                )}
              </div>
              <Button size="sm" variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
                <Crown className="h-4 w-4 mr-1" />
                Passer au Pro
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <FilterButtons 
            filterActive={filterActive}
            onFilterChange={handleFilterChange}
            offers={offers}
          />
          <CommerceFilter
            commerces={commerces}
            selectedCommerce={selectedCommerce}
            onCommerceChange={handleCommerceChange}
          />
        </div>
        
        <ViewToggle
          viewType={viewType}
          onViewChange={setViewType}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoadingOffers ? (
          <LoadingSpinner />
        ) : filteredOffers.length === 0 ? (
          <EmptyState />
        ) : (
          viewType === 'admin' ? (
            <div className="grid gap-4">
              {filteredOffers.map((offer) => (
                <OfferCard 
                  key={offer.id} 
                  offer={offer} 
                  onEdit={handleEditOffer}
                  onDelete={handleDeleteOffer}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Customer Preview Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LayoutGrid className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-blue-800">
                    <div className="font-medium mb-1">👀 Aperçu de l'expérience utilisateur</div>
                    <p className="text-sm">
                      Voici exactement comment vos offres apparaissent aux utilisateurs dans l'application Gosholo. 
                      Les petites icônes d'édition en haut à droite vous permettent de modifier vos offres directement depuis cette vue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredOffers.map((offer) => {
                  const commerce = commerces.find(c => c.id === offer.commerce_id)
                  return (
                    <CustomerOfferCard 
                      key={offer.id} 
                      offer={offer}
                      commerce={commerce}
                      onEdit={handleEditOffer}
                      onDelete={handleDeleteOffer}
                    />
                  )
                })}
              </div>
            </div>
          )
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'offre</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {itemToDelete && (
              <div className="bg-brand-accent/10 p-4 rounded-lg border border-brand-accent/30">
                <h4 className="font-medium text-brand-accent mb-2">
                  Offre à supprimer : {itemToDelete.title}
                </h4>
                <p className="text-sm text-red-700">
                  Cette action supprimera définitivement cette offre de votre compte.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setItemToDelete(null)
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OffresPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12">Chargement...</div>}>
      <OffresPageContent />
    </Suspense>
  )
}
