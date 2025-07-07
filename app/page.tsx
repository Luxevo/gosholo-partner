import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Store,
  Tag,
  Calendar,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  Edit,
  MapPin,
  Clock,
  Flame,
  Star,
  ExternalLink,
  Mail,
} from "lucide-react"

// Données simulées
const commerces = [
  {
    id: 1,
    name: "Café des Arts",
    logo: "/placeholder-logo.png",
    status: "active",
    quartier: "Plateau Mont-Royal",
    offresActives: 3,
    evenementsAVenir: 1,
    boostsDisponibles: 5,
    derniereActivite: "Il y a 2 jours",
    couleur: "bg-blue-500",
  },
  {
    id: 2,
    name: "Boutique Mode & Style",
    logo: "/placeholder-logo.png",
    status: "active",
    quartier: "Mile-End",
    offresActives: 0,
    evenementsAVenir: 2,
    boostsDisponibles: 2,
    derniereActivite: "Il y a 5 heures",
    couleur: "bg-purple-500",
  },
  {
    id: 3,
    name: "Restaurant Le Gourmet",
    logo: "/placeholder-logo.png",
    status: "pending",
    quartier: "Vieux-Montréal",
    offresActives: 1,
    evenementsAVenir: 0,
    boostsDisponibles: 8,
    derniereActivite: "Il y a 1 semaine",
    couleur: "bg-green-500",
  },
]

const statistiquesGlobales = {
  totalOffres: 4,
  totalEvenements: 3,
  totalBoosts: 15,
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Message d'accueil */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-user.jpg" alt="Utilisateur" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-primary">Bienvenue Jean-Pierre !</h1>
              <p className="text-secondary">Voici un aperçu de l'activité de vos commerces.</p>
            </div>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <Card>
              <CardContent className="p-5">
                <div>
                  <p className="text-lg font-bold text-primary">{statistiquesGlobales.totalOffres}</p>
                  <p className="text-sm text-secondary">Offres actives</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div>
                  <p className="text-lg font-bold text-primary">{statistiquesGlobales.totalEvenements}</p>
                  <p className="text-sm text-secondary">Événements à venir</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div>
                  <p className="text-lg font-bold text-primary">{statistiquesGlobales.totalBoosts}</p>
                  <p className="text-sm text-secondary">Boosts disponibles</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Module visibilité locale (Test A/B) */}
        <div className="my-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-primary text-base font-semibold">Gagnez aussi en visibilité dans votre quartier</CardTitle>
                  <CardDescription className="text-secondary text-sm">
                    <strong>J'aime mon quartier</strong> — notre support papier distribué localement dans votre secteur
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">Nouveau</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-secondary text-sm">
              <p>• Touchez vos voisins en ligne et directement dans leur boîte aux lettres</p>
              <p>• Vous êtes intéressé ? On vous contacte sans pression pour vous expliquer.</p>
              <Button className="bg-accent hover:bg-accent/80 text-white text-sm px-4 py-2 mt-2">
                Je veux en savoir plus
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Module offres exclusives */}
        <div className="my-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-primary text-base font-semibold">Envie de publier une offre exclusive à Gosholo ?</CardTitle>
                  <CardDescription className="text-secondary text-sm">
                    📣 Attirez l'attention avec une offre que les clients ne trouveront nulle part ailleurs
                  </CardDescription>
                </div>
                <Badge className="bg-secondary text-primary text-xs">Exclusivité</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-primary text-sm">
              <p className="font-medium">💡 En échange, on vous offre :</p>
              <ul className="list-disc list-inside ml-4">
                <li>Un boost gratuit</li>
                <li>Une mise en avant spéciale dans l'app</li>
                <li>Le badge "Exclusivité Gosholo" sur l'offre</li>
                <li>Un coup de projecteur sur nos réseaux</li>
              </ul>
              <p className="text-xs">👉 Intéressé ? Contactez notre équipe pour en discuter</p>
              <Button className="bg-accent hover:bg-accent/80 text-white text-sm px-4 py-2 mt-2">
                Proposer une offre exclusive
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Grille des commerces */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Vos commerces</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commerces.map((commerce) => (
              <Card key={commerce.id} className="transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Optionally, a small icon for visual cue, or remove entirely for minimalism */}
                      {/* <Store className="h-5 w-5 text-primary" /> */}
                      <div>
                        <CardTitle className="text-lg">{commerce.name}</CardTitle>
                        <p className="text-sm text-secondary">{commerce.quartier}</p>
                      </div>
                    </div>
                    <Badge
                      variant={commerce.status === "active" ? "default" : "secondary"}
                      className={
                        commerce.status === "active" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                      }
                    >
                      {commerce.status === "active" ? "Actif" : "En attente"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Section Offres */}
                  <div className="space-y-2">
                    {commerce.offresActives > 0 ? (
                      <div className="flex items-center text-sm">
                        <Tag className="h-4 w-4 text-primary mr-2" />
                        <span>{commerce.offresActives} offres actives</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Tag className="h-4 w-4 mr-2" />
                          <span>Aucune offre active</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Plus className="h-3 w-3 mr-1" />
                          Créer votre première offre
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Section Événements */}
                  <div className="space-y-2">
                    {commerce.evenementsAVenir > 0 ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-primary mr-2" />
                        <span>{commerce.evenementsAVenir} événements à venir</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Aucun événement programmé</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Plus className="h-3 w-3 mr-1" />
                          Créer votre premier événement
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Indicateurs rapides */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Flame className="h-4 w-4 text-orange-500 mr-1" />
                      <span>{commerce.boostsDisponibles} boosts</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{commerce.derniereActivite}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button className="w-full">Gérer ce commerce</Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="h-3 w-3 mr-1" />
                        Éditer
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Stats
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Carte d'ajout */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Ajouter un commerce</h3>
                  <p className="text-sm text-gray-600">
                    Ajoutez un nouveau commerce à votre compte pour commencer à créer des offres et événements
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un commerce
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
