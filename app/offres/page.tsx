"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Tag, Calendar, DollarSign, Users, Edit, BarChart3 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import OfferCreationFlow from "@/components/offer-creation-flow"

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
  created_at: string | null
  updated_at: string | null
}

export default function OffresPage() {
  const supabase = createClient()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOffers, setIsLoadingOffers] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Load offers from database
  const loadOffers = async () => {
    try {
      console.log('Loading offers...')
      setIsLoadingOffers(true)
      
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

      if (error) {
        console.error('Database error:', error)
        setIsLoadingOffers(false)
        return
      }

      console.log('Offers loaded:', offersData)
      setOffers(offersData || [])
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoadingOffers(false)
    }
  }

  // Load offers from database on component mount
  useEffect(() => {
    loadOffers()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "actif":
        return "bg-green-100 text-green-800"
      case "inactive":
      case "inactif":
        return "bg-red-100 text-red-800"
      case "draft":
      case "brouillon":
        return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

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

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setIsEditDialogOpen(true)
  }

  const handleOfferUpdated = () => {
    setIsEditDialogOpen(false)
    setEditingOffer(null)
    // Reload offers to show updated data
    loadOffers()
  }

  const handleOfferCreated = () => {
    setIsDialogOpen(false)
    // Reload offers to show the new offer
    loadOffers()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">Offres</h1>
            <p className="text-primary/70 text-sm lg:text-base">Gérez vos offres et promotions</p>
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
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {isLoadingOffers ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-secondary">Chargement des offres...</p>
              </div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary mb-2">Aucune offre</h3>
              <p className="text-secondary mb-4">Vous n'avez pas encore créé d'offres pour vos commerces.</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-accent hover:bg-accent/80 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première offre
              </Button>
            </div>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id} className="bg-white border border-primary/20">
                <CardHeader className="pb-3 flex flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={offer.picture || "/placeholder-logo.png"}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-logo.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-primary">{offer.title}</CardTitle>
                    <div className="flex items-center gap-2 text-secondary text-sm">
                      <Tag className="h-4 w-4" />
                      <span>{getTypeLabel(offer.offer_type)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {offer.uses_commerce_location ? "En magasin" : "Adresse spécifique"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOffer(offer)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-secondary text-sm">{offer.description}</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{getTypeLabel(offer.offer_type)}</div>
                        <div className="text-xs text-secondary">Type</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{offer.created_at ? formatDate(offer.created_at) : "N/A"}</div>
                        <div className="text-xs text-secondary">Créée le</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-secondary">Vues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-secondary">Utilisations</div>
                      </div>
                    </div>
                    {offer.condition && (
                      <div className="text-sm text-secondary pt-2 border-t border-primary/10">
                        <strong>Conditions:</strong> {offer.condition}
                      </div>
                    )}
                    {offer.custom_location && (
                      <div className="text-sm text-secondary">
                        <strong>Adresse:</strong> {offer.custom_location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
