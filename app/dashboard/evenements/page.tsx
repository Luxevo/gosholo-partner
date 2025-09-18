"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Plus, Edit, BarChart3, Clock, Building2, Trash2, LayoutGrid, List, Heart, TrendingUp, AlertCircle, Crown, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import EventCreationFlow from "@/components/event-creation-flow"
import { useDashboard } from "@/contexts/dashboard-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"

// Types
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
  boosted: boolean | null
  boost_type: "en_vedette" | "visibilite" | null
  boosted_at: string | null
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

// Customer View Event Card Component
interface CustomerEventCardProps {
  event: Event
  commerce: Commerce | undefined
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
  locale: string
}

const CustomerEventCard = ({ event, commerce, onEdit, onDelete, locale }: CustomerEventCardProps) => {
  // Format dates for event display
  const formatEventDate = (dateString: string) => {
    if (!dateString) return t('eventsPage.dateNotDefined', locale)
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
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
    if (!event.start_date || !event.end_date) return t('eventsPage.scheduleToDefine', locale)
    return `${formatEventTime(event.start_date)}-${formatEventTime(event.end_date)}`
  }

  const getEventCategory = () => {
    // Try to categorize based on title/description keywords
    const text = (event.title + " " + event.description).toLowerCase()
    if (text.includes('food') || text.includes('cuisine') || text.includes('restaurant')) return 'Food Fest'
    if (text.includes('music') || text.includes('concert') || text.includes('musique')) return 'Music'
    if (text.includes('art') || text.includes('expo') || text.includes('gallery')) return 'Art'
    if (text.includes('sport') || text.includes('fitness')) return 'Sport'
    if (text.includes('market') || text.includes('marché')) return 'Market'
    return 'Event'
  }

  return (
    <div className="relative max-w-sm">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Image Section */}
        <div className="relative h-48">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
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
          
          {/* Boost Badge */}
          {event.boosted && (
            <div className="absolute top-3 left-3">
              <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center text-white shadow-lg ${
                event.boost_type === 'en_vedette' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-blue-600'
              }`}>
                <>
                  {event.boost_type === 'en_vedette' ? (
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

          {/* Date and Category Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {event.start_date && (
                  <>
                    <span className="font-medium">
                      {formatEventDate(event.start_date)}
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
              {event.title}
            </h3>
            <span className="font-medium whitespace-nowrap ml-2 px-2 py-1 rounded-full text-xs" style={{ color: '#016167', backgroundColor: 'rgba(1, 97, 103, 0.1)' }}>
              {event.condition || t('eventsPage.freeEntry', locale)}
            </span>
          </div>

          {/* Event Location */}
          <div className="mb-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">
                {event.custom_location || commerce?.name || t('eventsPage.venueToConfirm', locale)}
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

      {/* Admin Actions Overlay */}
      <div className="absolute top-2 right-2 bg-white/95 rounded-lg p-1 shadow-md">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(event)}
            className="h-7 w-7 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(event)}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Admin EventCard Component
interface EventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
  locale: string
}

const EventCard = ({ event, onEdit, onDelete, locale }: EventCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
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
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-primary">
                {event.title}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {event.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs w-fit">
                Événement
              </Badge>
              {event.boosted && (
                <Badge 
                  className={`text-xs w-fit text-white ${
                    event.boost_type === 'en_vedette' 
                      ? 'bg-brand-primary hover:bg-brand-primary/90' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <>
                    {event.boost_type === 'en_vedette' ? (
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
                onClick={() => onEdit(event)}
                className="h-10 sm:h-8 w-10 sm:w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(event)}
                className="h-10 sm:h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="sm:hidden">{t('buttons.delete', locale)}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Event Details */}
          <div className="space-y-3 sm:space-y-4">
            {event.condition && (
              <div className="flex items-start gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="font-medium">{t('eventsPage.condition', locale)}:</span>
                <span className="text-muted-foreground">{event.condition}</span>
              </div>
            )}
            
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="font-medium">{t('eventsPage.location', locale)}:</span>
              <span>
                {event.uses_commerce_location 
                  ? t('eventsPage.commerceLocation', locale) 
                  : event.custom_location || t('eventsPage.notSpecified', locale)
                }
              </span>
            </div>
          </div>
          
          {/* Timing and Status */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{t('eventsPage.createdOn', locale)}:</span>
              <span>{event.created_at ? formatDate(event.created_at) : "N/A"}</span>
            </div>
            
            {event.updated_at && event.updated_at !== event.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('eventsPage.modifiedOn', locale)}:</span>
                <span className="text-blue-600 font-medium">{formatDate(event.updated_at)}</span>
              </div>
            )}
            
            {event.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('eventsPage.startDate', locale)}:</span>
                <span className="text-green-600 font-medium">{formatDate(event.start_date)}</span>
              </div>
            )}
            
            {event.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{t('eventsPage.endDate', locale)}:</span>
                <span className="text-red-600 font-medium">{formatDate(event.end_date)}</span>
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
  events: Event[]
  locale: string
}

const FilterButtons = ({ filterActive, onFilterChange, events, locale }: FilterButtonsProps) => {
  const activeCount = events.length // For now, all events are considered active
  const inactiveCount = 0 // No inactive events for now
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filterActive === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
{t('eventsPage.allEvents', locale)} ({events.length})
      </Button>
      <Button
        variant={filterActive === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('active')}
      >
{t('eventsPage.activeEvents', locale)} ({activeCount})
      </Button>
      <Button
        variant={filterActive === 'inactive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('inactive')}
      >
{t('eventsPage.finishedEvents', locale)} ({inactiveCount})
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
        {t('eventsPage.management', locale)}
      </Button>
      <Button
        variant={viewType === 'customer' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('customer')}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        {t('eventsPage.customerPreview', locale)}
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
      <span className="text-sm font-medium">{t('eventsPage.commerce', locale)}:</span>
      <Select value={selectedCommerce} onValueChange={onCommerceChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('eventsPage.allCommerces', locale)} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('eventsPage.allCommerces', locale)}</SelectItem>
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
      <p className="text-muted-foreground">{t('eventsPage.loadingEvents', locale)}</p>
    </div>
  </div>
)

// Empty State Component
const EmptyState = ({ locale }: { locale: string }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      <Calendar className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-primary mb-2">{t('eventsPage.noEventsFound', locale)}</h3>
    <p className="text-muted-foreground mb-4">
      {t('eventsPage.createFirstEvent', locale)}
    </p>
  </div>
)

// Main Component
function EvenementsPageContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { counts, refreshCounts } = useDashboard()
  const { locale } = useLanguage()
  
  // State
  const [events, setEvents] = useState<Event[]>([])
  const [commerces, setCommerces] = useState<Commerce[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Event | null>(null)
  const [filterActive, setFilterActive] = useState<FilterType>('all')
  const [selectedCommerce, setSelectedCommerce] = useState<string>('all')
  const [viewType, setViewType] = useState<ViewType>('customer')

  // Load events from database
  const loadEvents = async () => {
    try {
      console.log('Loading events...')
      setIsLoadingEvents(true)
      
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Authentication error:', userError)
        setIsLoadingEvents(false)
        return
      }

      if (!user) {
        console.log('No user found')
        setIsLoadingEvents(false)
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
        setIsLoadingEvents(false)
        return
      }

      if (!commercesData || commercesData.length === 0) {
        console.log('No commerces found for user')
        setCommerces([])
        setEvents([])
        setIsLoadingEvents(false)
        return
      }

      const commerces = commercesData.map(c => ({ 
        id: c.id, 
        name: c.name, 
        category: c.category 
      }))
      setCommerces(commerces)

      const commerceIds = commercesData.map(c => c.id)

      // Query events for user's commerces
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .in('commerce_id', commerceIds)

      if (error) {
        console.error('Database error:', error)
        setIsLoadingEvents(false)
        return
      }

      console.log('Events loaded:', eventsData)
      setEvents(eventsData || [])
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  // Auto-open dialog if create parameter is present
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsDialogOpen(true)
    }
  }, [searchParams])

  // Filtered events
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by commerce first
    if (selectedCommerce !== 'all') {
      filtered = filtered.filter(event => event.commerce_id === selectedCommerce)
    }

    // Then filter by status
    switch (filterActive) {
      case 'active':
        return filtered.filter(event => true) // All events are considered active for now
      case 'inactive':
        return filtered.filter(event => false) // No inactive events for now
      default:
        return filtered
    }
  }, [events, filterActive, selectedCommerce])

  // Event handlers
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsEditDialogOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setItemToDelete(event)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', itemToDelete.id)

      if (error) {
        console.error('Error deleting event:', error)
        return
      }

      setIsDeleteConfirmOpen(false)
      setItemToDelete(null)
      loadEvents()
      refreshCounts() // Refresh dashboard commerce data
    } catch (error) {
      console.error('Unexpected error deleting event:', error)
    }
  }

  const handleEventCreated = () => {
    setIsDialogOpen(false)
    loadEvents()
  }

  const handleEventUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingEvent(null)
    loadEvents()
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
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">{t('eventsPage.title', locale)}</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            {t('eventsPage.subtitle', locale)}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-accent hover:bg-accent/80 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!counts.canCreateContent}
              title={!counts.canCreateContent ? t('eventsPage.contentLimitReached', locale) : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('eventsPage.addEvent', locale)}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('eventsPage.createNewEvent', locale)}</DialogTitle>
              <DialogDescription>
                {t('eventsPage.createNewEventDesc', locale)}
              </DialogDescription>
            </DialogHeader>
            <EventCreationFlow onCancel={handleEventCreated} />
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
                {counts.subscriptionPlan === 'pro' ? t('eventsPage.proPlan', locale) : t('eventsPage.freePlan', locale)}
              </span> {counts.totalContent}/{counts.contentLimit} {t('eventsPage.contentUsed', locale)}
              {!counts.canCreateContent && (
                <span className="text-amber-700 ml-2">- {t('eventsPage.limitReached', locale)}</span>
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
                {t('eventsPage.upgradeToPro', locale)}
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
            events={events}
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
        {isLoadingEvents ? (
          <LoadingSpinner locale={locale} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState locale={locale} />
        ) : (
          viewType === 'admin' ? (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
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
                    <div className="font-medium mb-1">👀 Aperçu de l'expérience utilisateur</div>
                    <p className="text-sm">
                      Voici exactement comment vos événements apparaissent aux utilisateurs dans l'application Gosholo. 
                      Les petites icônes d'édition en haut à droite vous permettent de modifier vos événements directement depuis cette vue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map((event) => {
                  const commerce = commerces.find(c => c.id === event.commerce_id)
                  return (
                    <CustomerEventCard 
                      key={event.id} 
                      event={event}
                      commerce={commerce}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      locale={locale}
                    />
                  )
                })}
              </div>
            </div>
          )
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'événement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {itemToDelete && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">
                  Événement à supprimer : {itemToDelete.title}
                </h4>
                <p className="text-sm text-red-700">
                  Cette action supprimera définitivement cet événement de votre compte.
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

export default function EvenementsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12">Chargement...</div>}>
      <EvenementsPageContent />
    </Suspense>
  )
}
