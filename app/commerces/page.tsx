"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Store, Plus, Edit, MoreVertical, Rocket, CheckCircle, XCircle, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface Offer {
  id: string
  titre: string
  status: "active" | "boostée" | "complète"
  boosted: boolean
  endDate: string
}

interface Event {
  id: string
  titre: string
  date: string
  status: "actif" | "boosté"
  boosted: boolean
}

interface Commerce {
  id: string
  name: string
  quartier: string
  logo: string
  offers: Offer[]
  events: Event[]
}

export default function CommercesPage() {
  const [commerces, setCommerces] = useState<Commerce[]>([
    {
      id: "1",
      name: "Café William",
      quartier: "Centre-Ville",
      logo: "/placeholder-logo.png",
      offers: [
        {
          id: "101",
          titre: "Promo Café du Matin",
          status: "active",
          boosted: false,
          endDate: "2024-07-31",
        },
      ],
      events: [
        {
          id: "201",
          titre: "Dégustation Spéciale",
          date: "2024-07-15",
          status: "actif",
          boosted: true,
        },
      ],
    },
    {
      id: "2",
      name: "Boulangerie du Centre",
      quartier: "Centre-ville",
      logo: "/placeholder-logo.png",
      offers: [],
      events: [],
    },
  ])
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">Commerces</h1>
            <p className="text-primary/70 text-sm lg:text-base">Gérez vos commerces et établissements</p>
          </div>
          <Button className="flex items-center gap-2 bg-accent text-white hover:bg-accent/80 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nouveau commerce
          </Button>
        </div>
        <div className="space-y-6">
          {commerces.map((commerce) => (
            <Card key={commerce.id} className="bg-white border border-primary/20">
              <CardHeader className="pb-3 flex flex-row items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={commerce.logo} alt={commerce.name} />
                  <AvatarFallback>
                    <Store className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-primary">{commerce.name}</CardTitle>
                  <p className="text-sm text-secondary">{commerce.quartier}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Offres actives */}
                <div>
                  <div className="font-medium text-primary mb-1">Offres actives</div>
                  {commerce.offers.length > 0 ? (
                    commerce.offers.map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between bg-white rounded-md px-3 py-2 mb-2 border border-primary/10">
                        <div>
                          <div className="font-semibold text-primary">{offer.titre}</div>
                          <div className="text-xs text-secondary flex gap-2 items-center">
                            Statut: <span>{offer.status}{offer.boosted && " / boostée"}</span>
                            <span>Fin: {offer.endDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!offer.boosted && (
                            <Button size="sm" variant="outline" className="text-accent border-accent/40 px-2 py-1 text-xs">
                              <Rocket className="h-4 w-4 mr-1" /> Booster
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-accent">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Edit className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" /> Marquer comme complète
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" /> Désactiver
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2 mb-2">
                      <span className="text-secondary text-sm">Aucune offre en cours</span>
                      <Button size="sm" className="bg-accent hover:bg-accent/80 text-white text-xs px-3 py-1">
                        <Plus className="h-4 w-4 mr-1" /> Créer une offre
                      </Button>
                    </div>
                  )}
                </div>
                {/* Événements actifs */}
                <div>
                  <div className="font-medium text-primary mb-1">Événements actifs</div>
                  {commerce.events.length > 0 ? (
                    commerce.events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between bg-white rounded-md px-3 py-2 mb-2 border border-primary/10">
                        <div>
                          <div className="font-semibold text-primary flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-secondary" /> {event.titre}
                          </div>
                          <div className="text-xs text-secondary flex gap-2 items-center">
                            Statut: <span>{event.status}{event.boosted && " / boosté"}</span>
                            <span>Date: {event.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!event.boosted && (
                            <Button size="sm" variant="outline" className="text-accent border-accent/40 px-2 py-1 text-xs">
                              <Rocket className="h-4 w-4 mr-1" /> Booster
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-accent">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Edit className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <XCircle className="h-4 w-4" /> Annuler
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2 mb-2">
                      <span className="text-secondary text-sm">Aucun événement en cours</span>
                      <Button size="sm" className="bg-accent hover:bg-accent/80 text-white text-xs px-3 py-1">
                        <Plus className="h-4 w-4 mr-1" /> Créer un événement
                      </Button>
                    </div>
                  )}
                </div>
                {/* Gérer ce commerce */}
                <div className="flex justify-end mt-2">
                  <Button className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2">
                    Gérer ce commerce
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Ajouter un commerce à mon compte */}
          <div className="flex justify-center mt-8">
            <Button className="bg-accent hover:bg-accent/80 text-white text-base px-6 py-3 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Ajouter un commerce à mon compte
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 