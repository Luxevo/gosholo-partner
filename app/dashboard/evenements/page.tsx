"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Plus, Edit, BarChart3, Clock, Building2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import EventCreationFlow from "@/components/event-creation-flow"

// Types
interface Event {
  id: string
  commerce_id: string
  user_id: string
  title: string
  description: string
  picture: string | null
  uses_commerce_location: boolean
  custom_location: string | null
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

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// EventCard Component
interface EventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

const EventCard = ({ event, onEdit, onDelete }: EventCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-primary">
              {event.title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {event.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Événement
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(event)}
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
                     {/* Event Details */}
           <div className="space-y-3">
             {event.condition && (
               <div className="flex items-start gap-2 text-sm">
                 <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <span className="font-medium">Conditions:</span>
                 <span className="text-muted-foreground">{event.condition}</span>
               </div>
             )}
             
             <div className="flex items-center gap-2 text-sm">
               <MapPin className="h-4 w-4 text-muted-foreground" />
               <span className="font-medium">Localisation:</span>
               <span>
                 {event.uses_commerce_location 
                   ? "Emplacement du commerce" 
                   : event.custom_location || "Non spécifié"
                 }
               </span>
             </div>
           </div>
          
          {/* Timing and Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Créé le:</span>
              <span>{event.created_at ? formatDate(event.created_at) : "N/A"}</span>
            </div>
            
            {event.updated_at && event.updated_at !== event.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Modifié le:</span>
                <span className="text-blue-600 font-medium">{formatDate(event.updated_at)}</span>
              </div>
            )}
            
            {event.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Début:</span>
                <span className="text-green-600 font-medium">{formatDate(event.start_date)}</span>
              </div>
            )}
            
            {event.end_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fin:</span>
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
}

const FilterButtons = ({ filterActive, onFilterChange, events }: FilterButtonsProps) => {
  const activeCount = events.length // For now, all events are considered active
  const inactiveCount = 0 // No inactive events for now
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filterActive === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        Tous ({events.length})
      </Button>
      <Button
        variant={filterActive === 'active' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('active')}
      >
        Actifs ({activeCount})
      </Button>
      <Button
        variant={filterActive === 'inactive' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('inactive')}
      >
        Inactifs ({inactiveCount})
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
      <p className="text-muted-foreground">Chargement des événements...</p>
    </div>
  </div>
)

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      <Calendar className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-primary mb-2">Aucun événement trouvé</h3>
    <p className="text-muted-foreground mb-4">
      Commencez par créer votre premier événement pour attirer plus de clients.
    </p>
  </div>
)

// Main Component
export default function EvenementsPage() {
  const supabase = createClient()
  
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
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Événements</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Gérez vos événements et ateliers
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/80 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel événement</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouvel événement.
              </DialogDescription>
            </DialogHeader>
            <EventCreationFlow onCancel={handleEventCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <FilterButtons 
          filterActive={filterActive}
          onFilterChange={handleFilterChange}
          events={events}
        />
        <CommerceFilter
          commerces={commerces}
          selectedCommerce={selectedCommerce}
          onCommerceChange={handleCommerceChange}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoadingEvents ? (
          <LoadingSpinner />
        ) : filteredEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
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
              commerceId={editingEvent.commerce_id}
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
