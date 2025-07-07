"use client"

import { useState } from "react"
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
import OfferCreationFlow from "@/components/offer-creation-flow"

interface Offer {
  id: string
  title: string
  description: string
  discount: string
  category: string
  startDate: string
  endDate: string
  status: "active" | "inactive" | "draft"
  views: number
  conversions: number
}

export default function OffresPage() {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "1",
      title: "Réduction 20% sur les vêtements",
      description: "Profitez de 20% de réduction sur toute notre collection de vêtements",
      discount: "20%",
      category: "Mode",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      status: "active",
      views: 245,
      conversions: 18
    },
    {
      id: "2",
      title: "Happy Hours -50%",
      description: "Tous les jeudis de 18h à 20h, profitez de 50% de réduction",
      discount: "50%",
      category: "Restaurant",
      startDate: "2024-01-20",
      endDate: "2024-03-20",
      status: "active",
      views: 189,
      conversions: 32
    }
  ])

  const [newOffer, setNewOffer] = useState<Omit<Offer, "id" | "views" | "conversions">>({
    title: "",
    description: "",
    discount: "",
    category: "",
    startDate: "",
    endDate: "",
    status: "draft"
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateOffer = () => {
    const offer: Offer = {
      id: Date.now().toString(),
      ...newOffer,
      views: 0,
      conversions: 0
    }
    setOffers([...offers, offer])
    setNewOffer({
      title: "",
      description: "",
      discount: "",
      category: "",
      startDate: "",
      endDate: "",
      status: "draft"
    })
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-red-100 text-red-800"
      case "draft": return "bg-gray-100 text-gray-800"
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

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-primary">Offres</h1>
            <p className="text-brand-primary/70 text-sm lg:text-base">Gérez vos offres et promotions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-accent text-white hover:bg-accent/80 w-full sm:w-auto mb-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4" />
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
              <OfferCreationFlow onCancel={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 lg:gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="bg-white border border-brand-primary/20">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Tag className="h-4 w-4 lg:h-5 lg:w-5 text-brand-primary flex-shrink-0" />
                      <span className="truncate">{offer.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2 text-brand-primary/70 text-sm lg:text-base line-clamp-2">
                      {offer.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(offer.status)}>
                    {offer.status === "active" ? "Active" : offer.status === "inactive" ? "Inactive" : "Brouillon"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brand-success flex-shrink-0" />
                    <span className="text-sm font-medium text-brand-primary truncate">{offer.discount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span className="text-sm text-brand-primary/70 truncate">{offer.category}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                    <Calendar className="h-4 w-4 text-brand-secondary flex-shrink-0" />
                    <span className="text-sm text-brand-primary/70 truncate">
                      {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                    <Users className="h-4 w-4 text-brand-accent flex-shrink-0" />
                    <span className="text-sm text-brand-primary/70 truncate">
                      {offer.views} vues, {offer.conversions} conversions
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-brand-primary/10">
                  <Button variant="outline" size="sm" className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10 flex-1 sm:flex-none">
                    <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10 flex-1 sm:flex-none">
                    <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Voir les statistiques
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
