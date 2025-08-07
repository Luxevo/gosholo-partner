"use client"

import { useDashboard } from "@/contexts/dashboard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Store, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Zap,
} from "lucide-react"
import Link from "next/link"

// CommerceCard Component
interface CommerceCardProps {
  commerce: any
}

const CommerceCard = ({ commerce }: CommerceCardProps) => {
  const activeOffers = commerce.offers?.filter((offer: any) => offer.is_active) || []
  const upcomingEvents = commerce.events || [] // For now, consider all events as upcoming

  const getOfferStatus = (offer: any) => {
    if (!offer.is_active) return { label: 'Terminée', variant: 'secondary' as const }
    return { label: 'Active', variant: 'default' as const }
  }

  const getEventStatus = (event: any) => {
    return { label: 'À venir', variant: 'default' as const }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>{commerce.name}</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/commerces/${commerce.id}`}>
              Gérer ce commerce
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>
          {commerce.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offers Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Tag className="h-4 w-4 mr-2" style={{ color: 'rgb(0,82,102)' }} />
            Offres actives
          </h4>
          {activeOffers.length > 0 ? (
            activeOffers.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-3 mb-2" style={{ backgroundColor: 'rgba(0,82,102,0.05)', borderColor: 'rgba(0,82,102,0.2)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{offer.title}</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getOfferStatus(offer).variant} className="text-xs">
                        {getOfferStatus(offer).label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Expire le {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Zap className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-sm mb-2">Aucune offre en cours</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/offres">
                  <Plus className="h-4 w-4 mr-1" />
                  Créer une offre
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-orange-600" />
            Événements à venir
          </h4>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => (
              <div key={event.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{event.title}</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getEventStatus(event).variant} className="text-xs">
                        {getEventStatus(event).label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Zap className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-sm mb-2">Aucun événement à venir</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/evenements">
                  <Plus className="h-4 w-4 mr-1" />
                  Créer un événement
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data for exclusive offers
const exclusiveOffers = [
  {
    id: 1,
    title: "Promotion spéciale -20%",
    description: "Sur tous les produits de boulangerie",
    commerce: "Boulangerie du Centre",
    validUntil: "31 décembre 2024",
    type: "exclusive"
  },
  {
    id: 2,
    title: "Menu dégustation",
    description: "Découvrez nos spécialités locales",
    commerce: "Restaurant Le Gourmet",
    validUntil: "15 janvier 2025",
    type: "exclusive"
  },
  {
    id: 3,
    title: "Service premium",
    description: "Livraison gratuite + cadeau surprise",
    commerce: "Café Central",
    validUntil: "28 février 2025",
    type: "exclusive"
  }
]

export default function Dashboard() {
  const { counts, userProfile, commerces, isLoading } = useDashboard()

  // Get user's display name
  const getUserDisplayName = () => {
    if (!userProfile) return "Partenaire"
    
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    } else if (userProfile.first_name) {
      return userProfile.first_name
    } else if (userProfile.last_name) {
      return userProfile.last_name
    } else {
      // Fallback to email or generic name
      return userProfile.email.split('@')[0] || "Partenaire"
    }
  }

  const stats = [
    {
      title: "Commerces",
      value: counts.commerces,
      change: "+12%",
      changeType: "positive",
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Offres actives",
      value: counts.offers,
      change: "+8%",
      changeType: "positive",
      icon: Tag,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Événements",
      value: counts.events,
      change: "+15%",
      changeType: "positive",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#005266] mb-1">
          Bienvenue, {getUserDisplayName()} !
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de l'activité de vos commerces
        </p>
      </div>

      {/* Commerce Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Vos commerces</h1>
          <Button asChild>
            <Link href="/dashboard/commerces">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un commerce
            </Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement de vos commerces...</p>
          </div>
        ) : commerces.length > 0 ? (
          commerces.map((commerce) => (
            <CommerceCard key={commerce.id} commerce={commerce} />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commerce</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre premier commerce</p>
              <Button asChild>
                <Link href="/dashboard/commerces">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un commerce
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      
    </div>
  )
}