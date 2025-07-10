"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Plus, MapPin, Calendar, Tag, Star, Users, Eye, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import OfferCreationFlow from "@/components/offer-creation-flow"
import EventCreationFlow from "@/components/event-creation-flow"

interface Commerce {
  id: string
  name: string
  address: string
  logo_url: string
  type: string
  offers: any[]
  events: any[]
}

export default function CommercesPage() {
  const supabase = createClient()
  const [commerces, setCommerces] = useState<Commerce[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCommerces, setIsLoadingCommerces] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null)
  const [editingCommerce, setEditingCommerce] = useState<Commerce | null>(null)
  const [newCommerce, setNewCommerce] = useState({
    name: "",
    address: "",
    type: "restaurant",
    logo_url: ""
  })
  const [editCommerce, setEditCommerce] = useState({
    name: "",
    address: "",
    type: "restaurant",
    logo_url: ""
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Load commerces from database on component mount
  useEffect(() => {
    const loadCommerces = async () => {
      try {
        console.log('Loading commerces...')
        
        // Check authentication first
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Authentication error:', userError)
          setIsLoadingCommerces(false)
          return
        }

        if (!user) {
          console.log('No user found')
          setIsLoadingCommerces(false)
          return
        }

        console.log('User authenticated:', user.id)

        // Query commerces
        const { data: commercesData, error } = await supabase
          .from('commerces')
          .select('*')
          .eq('profile_id', user.id)

        if (error) {
          console.error('Database error:', error)
          setIsLoadingCommerces(false)
          return
        }

        console.log('Commerces loaded:', commercesData)

        // Transform database data to display format
        let transformedCommerces: Commerce[] = (commercesData || []).map(commerce => ({
          id: commerce.id,
          name: commerce.name,
          address: commerce.address || "",
          logo_url: commerce.logo_url || "/placeholder-logo.png",
          type: commerce.type || "restaurant",
          offers: [],
          events: [],
        }))

        // Fetch offers and events counts for each commerce
        const offerCounts: Record<string, number> = {}
        const eventCounts: Record<string, number> = {}
        if (transformedCommerces.length > 0) {
          const commerceIds = transformedCommerces.map(c => c.id)
          // Fetch offers
          const { data: offersData } = await supabase
            .from('offers')
            .select('id, commerce_id')
            .in('commerce_id', commerceIds)
          // Fetch events
          const { data: eventsData } = await supabase
            .from('events')
            .select('id, commerce_id')
            .in('commerce_id', commerceIds)
          // Count offers
          if (offersData) {
            offersData.forEach((offer: any) => {
              offerCounts[offer.commerce_id] = (offerCounts[offer.commerce_id] || 0) + 1
            })
          }
          // Count events
          if (eventsData) {
            eventsData.forEach((event: any) => {
              eventCounts[event.commerce_id] = (eventCounts[event.commerce_id] || 0) + 1
            })
          }
          // Attach counts to commerces
          transformedCommerces = transformedCommerces.map(commerce => ({
            ...commerce,
            offers: Array(offerCounts[commerce.id] || 0).fill(null),
            events: Array(eventCounts[commerce.id] || 0).fill(null),
          }))
        }

        setCommerces(transformedCommerces)
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setIsLoadingCommerces(false)
      }
    }

    loadCommerces()
  }, [])

  const handleAddCommerce = async () => {
    if (!newCommerce.name) return;
    
    setIsLoading(true)
    
    try {
      console.log('Adding commerce...')
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Authentication error:', userError)
        setIsLoading(false)
        return
      }

      if (!user) {
        console.error('User not authenticated')
        setIsLoading(false)
        return
      }

      console.log('User authenticated for commerce creation:', user.id)

      // Insert commerce into database
      const { data: commerceData, error: insertError } = await supabase
        .from('commerces')
        .insert({
          profile_id: user.id,
          name: newCommerce.name,
          address: newCommerce.address || null,
          type: newCommerce.type,
          logo_url: newCommerce.logo_url || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        setIsLoading(false)
        return
      }

      console.log('Commerce created:', commerceData)

      // Add to local state for display
      setCommerces([
        ...commerces,
        {
          id: commerceData.id,
          name: commerceData.name,
          address: commerceData.address || "",
          logo_url: commerceData.logo_url || "/placeholder-logo.png",
          type: commerceData.type || "restaurant",
          offers: [],
          events: [],
        }
      ])

      setNewCommerce({ name: "", address: "", type: "restaurant", logo_url: "" })
      setLogoPreview(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Unexpected error adding commerce:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCommerce = async () => {
    if (!editCommerce.name || !editingCommerce) return;
    
    setIsLoading(true)
    
    try {
      console.log('Updating commerce...')
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Authentication error:', userError)
        setIsLoading(false)
        return
      }

      if (!user) {
        console.error('User not authenticated')
        setIsLoading(false)
        return
      }

      console.log('User authenticated for commerce update:', user.id)

      // Update commerce in database
      const { data: commerceData, error: updateError } = await supabase
        .from('commerces')
        .update({
          name: editCommerce.name,
          address: editCommerce.address || null,
          type: editCommerce.type,
          logo_url: editCommerce.logo_url || null,
        })
        .eq('id', editingCommerce.id)
        .select()
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        setIsLoading(false)
        return
      }

      console.log('Commerce updated:', commerceData)

      // Update local state
      setCommerces(commerces.map(commerce => 
        commerce.id === editingCommerce.id 
          ? {
              ...commerce,
              name: commerceData.name,
              address: commerceData.address || "",
              logo_url: commerceData.logo_url || "/placeholder-logo.png",
              type: commerceData.type || "restaurant",
            }
          : commerce
      ))

      setEditCommerce({ name: "", address: "", type: "restaurant", logo_url: "" })
      setEditingCommerce(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Unexpected error updating commerce:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">Commerces</h1>
            <p className="text-primary/70 text-sm lg:text-base">Gérez vos commerces et établissements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/80 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un commerce
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un commerce</DialogTitle>
                <DialogDescription>
                  Créez un nouveau commerce pour votre compte.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Nom du commerce</label>
                  <Input
                    id="name"
                    value={newCommerce.name}
                    onChange={(e) => setNewCommerce({ ...newCommerce, name: e.target.value })}
                    placeholder="Nom de votre commerce"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium">Adresse</label>
                  <Input
                    id="address"
                    value={newCommerce.address}
                    onChange={(e) => setNewCommerce({ ...newCommerce, address: e.target.value })}
                    placeholder="Adresse du commerce"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="type" className="text-sm font-medium">Type de commerce</label>
                  <select
                    id="type"
                    value={newCommerce.type}
                    onChange={(e) => setNewCommerce({ ...newCommerce, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Café</option>
                    <option value="boulangerie">Boulangerie</option>
                    <option value="epicerie">Épicerie</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="logo" className="text-sm font-medium">URL du logo</label>
                  <Input
                    id="logo"
                    value={newCommerce.logo_url}
                    onChange={(e) => setNewCommerce({ ...newCommerce, logo_url: e.target.value })}
                    placeholder="URL de l'image du logo"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Annuler</Button>
                <Button onClick={handleAddCommerce} disabled={!newCommerce.name || isLoading}>
                  {isLoading ? "Ajout en cours..." : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-6">
          {isLoadingCommerces ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-secondary">Chargement des commerces...</p>
              </div>
            </div>
          ) : commerces.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">Aucun commerce</h3>
              <p className="text-secondary mb-4">Vous n'avez pas encore ajouté de commerce à votre compte.</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-accent hover:bg-accent/80 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre premier commerce
              </Button>
            </div>
          ) : (
            commerces.map((commerce) => (
              <Card key={commerce.id} className="bg-white border border-primary/20">
                <CardHeader className="pb-3 flex flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={commerce.logo_url}
                      alt={commerce.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-logo.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-primary">{commerce.name}</CardTitle>
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{commerce.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {commerce.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCommerce(commerce);
                        setIsOfferDialogOpen(true);
                      }}
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Offres
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCommerce(commerce);
                        setIsEventDialogOpen(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Événements
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCommerce(commerce);
                        setEditCommerce({
                          name: commerce.name,
                          address: commerce.address,
                          type: commerce.type,
                          logo_url: commerce.logo_url,
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{commerce.offers.length}</div>
                      <div className="text-xs text-secondary">{commerce.offers.length === 1 ? 'Offre active' : 'Offres actives'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{commerce.events.length}</div>
                      <div className="text-xs text-secondary">{commerce.events.length === 1 ? 'Événement' : 'Événements'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">0</div>
                      <div className="text-xs text-secondary">Vues totales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">0</div>
                      <div className="text-xs text-secondary">Clients</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Offer Creation Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une offre pour {selectedCommerce?.name}</DialogTitle>
          </DialogHeader>
                     {selectedCommerce && (
             <OfferCreationFlow
               onCancel={() => setIsOfferDialogOpen(false)}
             />
           )}
        </DialogContent>
      </Dialog>

      {/* Event Creation Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un événement pour {selectedCommerce?.name}</DialogTitle>
          </DialogHeader>
                     {selectedCommerce && (
             <EventCreationFlow
               onCancel={() => setIsEventDialogOpen(false)}
             />
           )}
        </DialogContent>
      </Dialog>

      {/* Edit Commerce Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le commerce</DialogTitle>
            <DialogDescription>
              Modifiez les détails du commerce.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="editName" className="text-sm font-medium">Nom du commerce</label>
              <Input
                id="editName"
                value={editCommerce.name}
                onChange={(e) => setEditCommerce({ ...editCommerce, name: e.target.value })}
                placeholder="Nom de votre commerce"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="editAddress" className="text-sm font-medium">Adresse</label>
              <Input
                id="editAddress"
                value={editCommerce.address}
                onChange={(e) => setEditCommerce({ ...editCommerce, address: e.target.value })}
                placeholder="Adresse du commerce"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="editType" className="text-sm font-medium">Type de commerce</label>
              <select
                id="editType"
                value={editCommerce.type}
                onChange={(e) => setEditCommerce({ ...editCommerce, type: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Café</option>
                <option value="boulangerie">Boulangerie</option>
                <option value="epicerie">Épicerie</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="editLogo" className="text-sm font-medium">URL du logo</label>
              <Input
                id="editLogo"
                value={editCommerce.logo_url}
                onChange={(e) => setEditCommerce({ ...editCommerce, logo_url: e.target.value })}
                placeholder="URL de l'image du logo"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>Annuler</Button>
            <Button onClick={() => handleEditCommerce()} disabled={!editCommerce.name || isLoading}>
              {isLoading ? "Modification en cours..." : "Modifier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 