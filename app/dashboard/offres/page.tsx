"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Tag, Calendar, DollarSign, Users, Edit, BarChart3, MapPin, Clock, Building2, Trash2, LayoutGrid, List, Heart, Store, AlertCircle, Crown, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import OfferCreationFlow from "@/components/offer-creation-flow"
import { checkAndDeactivateOffers, getDaysRemaining, getOfferStatus } from "@/lib/offer-utils"
import { useDashboard } from "@/contexts/dashboard-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import { renderTextWithLinks } from "@/lib/text-utils"

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
  boosted: boolean | null
  boost_type: "en_vedette" | "visibilite" | null
  boosted_at: string | null
  category_id: number | null
}

interface Commerce {
  id: string
  name: string
  category_id: number | null
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

const getTypeLabel = (type: string, locale: string) => {
  switch (type) {
    case "in_store":
      return t('offersPage.inStore', locale as 'fr' | 'en')
    case "online":
      return t('offersPage.online', locale as 'fr' | 'en')
    case "both":
      return t('offersPage.both', locale as 'fr' | 'en')
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
  locale: string
}

const CustomerOfferCard = ({ offer, commerce, onEdit, onDelete, locale }: CustomerOfferCardProps) => {
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!offer.end_date) return t('offersPage.notDefined', locale as 'fr' | 'en')
    const endDate = new Date(offer.end_date)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      return diffHours > 0 ? `${t('offersPage.endsIn', locale as 'fr' | 'en')} ${diffHours}${t('offersPage.endsHours', locale as 'fr' | 'en')}` : t('offersPage.expired', locale as 'fr' | 'en')
    }
    return `${t('offersPage.endsIn', locale as 'fr' | 'en')} ${diffDays}${t('offersPage.endsDays', locale as 'fr' | 'en')}`
  }


  return (
    <div className="relative w-full max-w-[320px] sm:w-[356px] mx-auto sm:mx-0">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Image Section */}
        <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
          {offer.image_url ? (
            <img 
              src={offer.image_url} 
              alt={offer.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <div className="text-white text-center">
                <Store className="h-12 w-12 mx-auto mb-2 opacity-80" />
                <p className="text-sm opacity-80">{t('offersPage.offerImage', locale as 'fr' | 'en')}</p>
              </div>
            </div>
          )}
          
              {/* Boost Badge */}
              {offer.boosted && (
                <div className="absolute top-3 left-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center text-white shadow-lg ${
                    offer.boost_type === 'en_vedette' 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-blue-600'
                  }`}>
                    <>
                      {offer.boost_type === 'en_vedette' ? (
                        <Sparkles className="h-2 w-2 mr-1" />
                      ) : (
                        <Star className="h-2 w-2 mr-1" />
                      )}
                      {locale === 'fr' ? 'Vedette' : 'Featured'}
                    </>
                  </div>
                </div>
              )}

              {/* Heart Icon */}
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
              </div>

          {/* Bottom Info Bar - Address */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
            <div className="flex items-center text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span>
                {offer.custom_location || commerce?.name || t('offersPage.commerceLocation', locale as 'fr' | 'en')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 bg-white">
          {/* Business Name */}
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-bold text-orange-600">
              {commerce?.name || t('placeholders.commerce', locale as 'fr' | 'en')}
            </h3>
          </div>

          {/* Offer Title */}
          <h4 className="text-xl font-semibold mb-3 text-black overflow-hidden line-clamp-2 break-words">
            {offer.title}
          </h4>

          {/* Description */}
          <div className="text-sm mb-4 text-gray-700">
            <p className="overflow-hidden line-clamp-2 break-words">
              {renderTextWithLinks(offer.description)}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-start">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-1.5 px-3 rounded-full transition-colors">
              {locale === 'fr' ? 'Voir l\'offre' : 'View Offer'}
            </button>
          </div>
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
  locale: string
}

const OfferCard = ({ offer, onEdit, onDelete, locale }: OfferCardProps) => {
  const status = getOfferStatus(offer.is_active, offer.end_date || null)
  const daysRemaining = getDaysRemaining(offer.end_date || null)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
          <div className="flex items-start space-x-3 flex-1">
            {offer.image_url && (
              <div className="w-20 h-[60px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-primary overflow-hidden line-clamp-1 break-words">
                {offer.title}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word'
              }}>
                {renderTextWithLinks(offer.description)}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={status.variant} className="text-xs w-fit">
                {status.label}
              </Badge>
              {offer.boosted && (
                <Badge 
                  className={`text-xs w-fit text-white ${
                    offer.boost_type === 'en_vedette' 
                      ? 'bg-brand-primary hover:bg-brand-primary/90' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <>
                    {offer.boost_type === 'en_vedette' ? (
                      <Sparkles className="h-3 w-3 mr-1" />
                    ) : (
                      <Star className="h-3 w-3 mr-1" />
                    )}
                    {locale === 'fr' ? 'Vedette' : 'Featured'}
                  </>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(offer)}
                className="h-10 sm:h-8 w-10 sm:w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(offer)}
                className="h-10 sm:h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="sm:hidden">{t('buttons.delete', locale as 'fr' | 'en')}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Offer Details */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{t('offersPage.type', locale as 'fr' | 'en')}:</span>
              <span>{getTypeLabel(offer.offer_type, locale)}</span>
            </div>
            
            {offer.condition && (
              <div className="flex items-start gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="font-medium">{t('offersPage.condition', locale as 'fr' | 'en')}:</span>
                <span className="text-muted-foreground">{offer.condition}</span>
              </div>
            )}
            
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="font-medium">{t('offersPage.location', locale as 'fr' | 'en')}:</span>
              <span>
                {offer.uses_commerce_location 
                  ? t('offersPage.commerceLocation', locale as 'fr' | 'en') 
                  : offer.custom_location || t('offersPage.notSpecified', locale as 'fr' | 'en')
                }
              </span>
            </div>
          </div>
          
          {/* Timing and Status */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{t('offersPage.createdOn', locale as 'fr' | 'en')}:</span>
              <span>{offer.created_at ? formatDate(offer.created_at) : "N/A"}</span>
            </div>
            
            {offer.is_active && daysRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('offersPage.daysRemaining', locale as 'fr' | 'en')}:</span>
                <span className={daysRemaining <= 7 ? "text-brand-accent font-medium" : ""}>
                  {daysRemaining} {t('offersPage.days', locale as 'fr' | 'en')}
                </span>
              </div>
            )}
            
            {offer.updated_at && offer.updated_at !== offer.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('offersPage.modifiedOn', locale as 'fr' | 'en')}:</span>
                <span className="text-brand-secondary font-medium">{formatDate(offer.updated_at)}</span>
              </div>
            )}
            
            {offer.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('offersPage.startDate', locale as 'fr' | 'en')}:</span>
                <span className="text-brand-primary font-medium">{formatDate(offer.start_date)}</span>
              </div>
            )}
            
            {offer.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('offersPage.endDate', locale as 'fr' | 'en')}:</span>
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
  locale: string
}

const FilterButtons = ({ filterActive, onFilterChange, offers, locale }: FilterButtonsProps) => {
  const activeCount = offers.filter(o => o.is_active).length
  const inactiveCount = offers.filter(o => !o.is_active).length
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filterActive === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        {t('offersPage.allOffers', locale as 'fr' | 'en')} ({offers.length})
      </Button>
      <Button
        variant={filterActive === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('active')}
      >
        {t('offersPage.activeOffers', locale as 'fr' | 'en')} ({activeCount})
      </Button>
      <Button
        variant={filterActive === 'inactive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('inactive')}
      >
        {t('offersPage.finishedOffers', locale as 'fr' | 'en')} ({inactiveCount})
      </Button>
    </div>
  )
}

// View Toggle Component
interface ViewToggleProps {
  viewType: ViewType
  onViewChange: (view: ViewType) => void
  locale: string
}

const ViewToggle = ({ viewType, onViewChange, locale }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      <Button
        variant={viewType === 'admin' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('admin')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        {t('offersPage.management', locale as 'fr' | 'en')}
      </Button>
      <Button
        variant={viewType === 'customer' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('customer')}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        {t('offersPage.customerPreview', locale as 'fr' | 'en')}
      </Button>
    </div>
  )
}

// Commerce Filter Component
interface CommerceFilterProps {
  commerces: Commerce[]
  selectedCommerce: string
  onCommerceChange: (commerceId: string) => void
  locale: string
}

const CommerceFilter = ({ commerces, selectedCommerce, onCommerceChange, locale }: CommerceFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{t('offersPage.commerce', locale as 'fr' | 'en')}:</span>
      <Select value={selectedCommerce} onValueChange={onCommerceChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('offersPage.allCommerces', locale as 'fr' | 'en')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('offersPage.allCommerces', locale as 'fr' | 'en')}</SelectItem>
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
const LoadingSpinner = ({ locale }: { locale: string }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{t('offersPage.loadingOffers', locale as 'fr' | 'en')}</p>
    </div>
  </div>
)

// Empty State Component
const EmptyState = ({ locale }: { locale: string }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      <Tag className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-primary mb-2">{t('offersPage.noOffersFound', locale as 'fr' | 'en')}</h3>
    <p className="text-muted-foreground mb-4">
      {t('offersPage.createFirstOffer', locale as 'fr' | 'en')}
    </p>
  </div>
)

// Main Component
function OffresPageContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { counts, refreshCounts } = useDashboard()
  const { locale } = useLanguage()
  
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
      const deactivationResult = await checkAndDeactivateOffers()
      if (!deactivationResult.success) {
        console.warn('Warning: Could not deactivate old offers:', deactivationResult.error)
        // Continue loading offers even if deactivation fails
      }
      
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
        .select('id, name, category_id')
        .eq('user_id', user.id)

      if (commercesError) {
        console.warn('Error loading commerces:', commercesError)
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
        category_id: c.category_id 
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
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">{t('offersPage.title', locale as 'fr' | 'en')}</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            {t('offersPage.subtitle', locale as 'fr' | 'en')}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-accent hover:bg-accent/80 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!counts.canCreateContent}
              title={!counts.canCreateContent ? t('offersPage.contentLimitReached', locale as 'fr' | 'en') : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('offersPage.addOffer', locale as 'fr' | 'en')}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[min(100vw-1.5rem,480px)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{t('offersPage.createNewOffer', locale as 'fr' | 'en')}</DialogTitle>
              <DialogDescription>{t('offersPage.createNewOfferDesc', locale as 'fr' | 'en')}</DialogDescription>
            </DialogHeader>
            <OfferCreationFlow onCancel={handleOfferCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Limit Banner */}
      <Alert className={`border-l-4 ${counts.canCreateContent ? 'border-l-blue-500 bg-blue-50' : 'border-l-amber-500 bg-amber-50'}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="font-medium">
                {counts.subscriptionPlan === 'pro' ? t('offersPage.proPlan', locale as 'fr' | 'en') : t('offersPage.freePlan', locale as 'fr' | 'en')}
              </span> {counts.totalContent}/{counts.contentLimit} {t('offersPage.contentUsed', locale as 'fr' | 'en')}
              {!counts.canCreateContent && (
                <span className="text-amber-700 ml-2">- {t('offersPage.limitReached', locale as 'fr' | 'en')}</span>
              )}
            </div>
              {counts.subscriptionPlan === 'free' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                  onClick={() => router.push('/dashboard/boosts')}
                >
                  <Crown className="h-4 w-4 mr-1" />
                  {t('offersPage.upgradeToPro', locale as 'fr' | 'en')}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <FilterButtons 
            filterActive={filterActive}
            onFilterChange={handleFilterChange}
            offers={offers}
            locale={locale}
          />
          <CommerceFilter
            commerces={commerces}
            selectedCommerce={selectedCommerce}
            onCommerceChange={handleCommerceChange}
            locale={locale}
          />
        </div>
        
        <ViewToggle
          viewType={viewType}
          onViewChange={setViewType}
          locale={locale}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoadingOffers ? (
          <LoadingSpinner locale={locale} />
        ) : filteredOffers.length === 0 ? (
          <EmptyState locale={locale} />
        ) : (
          viewType === 'admin' ? (
            <div className="grid gap-4">
              {filteredOffers.map((offer) => (
                <OfferCard 
                  key={offer.id} 
                  offer={offer} 
                  onEdit={handleEditOffer}
                  onDelete={handleDeleteOffer}
                  locale={locale}
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
                    <div className="font-medium mb-1">{t('offersPage.userExperiencePreview', locale as 'fr' | 'en')}</div>
                    <p className="text-sm">
                      {t('offersPage.userExperienceDesc', locale as 'fr' | 'en')}
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
                      locale={locale}
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
            <DialogTitle>{t('offersPage.editOffer', locale as 'fr' | 'en')}</DialogTitle>
            <DialogDescription>
              {t('offersPage.editOfferDesc', locale as 'fr' | 'en')}
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
            <DialogTitle>{t('offersPage.deleteOffer', locale as 'fr' | 'en')}</DialogTitle>
            <DialogDescription>
              {t('offersPage.deleteOfferDesc', locale as 'fr' | 'en')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {itemToDelete && (
              <div className="bg-brand-accent/10 p-4 rounded-lg border border-brand-accent/30">
                <h4 className="font-medium text-brand-accent mb-2">
                  {t('offersPage.offerToDelete', locale as 'fr' | 'en')} {itemToDelete.title}
                </h4>
                <p className="text-sm text-red-700">
                  {t('offersPage.deleteOfferWarning', locale as 'fr' | 'en')}
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
                {t('buttons.cancel', locale as 'fr' | 'en')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('offersPage.deletePermanently', locale as 'fr' | 'en')}
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
    <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
      <OffresPageContent />
    </Suspense>
  )
}
