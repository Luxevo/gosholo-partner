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
} from "lucide-react"
import Link from "next/link"




const pieData = [
  { name: "Commerces", value: 400, color: "#3B82F6" },
  { name: "Offres", value: 300, color: "#10B981" },
  { name: "Événements", value: 200, color: "#F59E0B" },
]

const recentActivity = [
  {
    id: 1,
    type: "commerce",
    title: "Nouveau commerce ajouté",
    description: "Boulangerie du Centre a été créé",
    time: "Il y a 2 heures",
    icon: Store,
  },
  {
    id: 2,
    type: "offer",
    title: "Offre mise à jour",
    description: "Promotion -20% sur les pâtisseries",
    time: "Il y a 4 heures",
    icon: Tag,
  },
  {
    id: 3,
    type: "event",
    title: "Événement créé",
    description: "Fête de la Gastronomie - 15 Sept",
    time: "Il y a 1 jour",
    icon: Calendar,
  },
  {
    id: 4,
    type: "boost",
    title: "Boost activé",
    description: "Visibilité augmentée pour 7 jours",
    time: "Il y a 2 jours",
    icon: TrendingUp,
  },
]

const quickActions = [
  {
    title: "Ajouter un commerce",
    description: "Créer un nouveau point de vente",
    icon: Store,
    href: "/commerces",
    color: "bg-blue-500",
  },
  {
    title: "Créer une offre",
    description: "Publier une nouvelle promotion",
    icon: Tag,
    href: "/offres",
    color: "bg-green-500",
  },
  {
    title: "Organiser un événement",
    description: "Planifier un événement spécial",
    icon: Calendar,
    href: "/evenements",
    color: "bg-orange-500",
  },
  {
    title: "Booster la visibilité",
    description: "Augmenter la visibilité",
    icon: TrendingUp,
    href: "/boosts",
    color: "bg-purple-500",
  },
]

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
  const { counts } = useDashboard()

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


      {/* Commerce Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-blue-600" />
            <span>Vos Commerces</span>
          </CardTitle>
          <CardDescription>
            Gérez vos commerces et établissements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/commerces">
              <div className="p-6 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer text-center">
                <Store className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Gérer vos commerces</h3>
                <p className="text-sm text-gray-600">Ajouter, modifier et organiser vos établissements</p>
                <div className="mt-3 text-sm text-blue-600 font-medium">
                  {counts.commerces} commerce{counts.commerces !== 1 ? 's' : ''} actif{counts.commerces !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
            
            <Link href="/offres">
              <div className="p-6 border-2 border-dashed border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer text-center">
                <Tag className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Créer des offres</h3>
                <p className="text-sm text-gray-600">Publier des promotions et des offres spéciales</p>
                <div className="mt-3 text-sm text-green-600 font-medium">
                  {counts.offers} offre{counts.offers !== 1 ? 's' : ''} active{counts.offers !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
            
            <Link href="/evenements">
              <div className="p-6 border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer text-center">
                <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Organiser des événements</h3>
                <p className="text-sm text-gray-600">Planifier des événements et des activités spéciales</p>
                <div className="mt-3 text-sm text-orange-600 font-medium">
                  {counts.events} événement{counts.events !== 1 ? 's' : ''} planifié{counts.events !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Exclusive Offers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-orange-600" />
            <span>Offres exclusives</span>
          </CardTitle>
          <CardDescription>
            Vos offres spéciales et promotions exclusives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exclusiveOffers.map((offer) => (
              <div key={offer.id} className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Exclusif
                  </Badge>
                  <span className="text-xs text-gray-500">{offer.validUntil}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{offer.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Store className="h-4 w-4" />
                  <span>{offer.commerce}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* JMQ Partnership Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* JMQ Logo */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JMQ</span>
                </div>
              </div>
            </div>
            
            {/* JMQ Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">J'aime mon quartier</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Partenaire officiel
                </Badge>
              </div>
              
              <p className="text-gray-700 mb-3">
                <strong>Fier partenaire de J'aime mon quartier.</strong> Un guide local distribué dans chaque quartier de la région de Montréal et ses environs, pour faire rayonner les commerces d'ici.
              </p>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  asChild
                >
                  <a 
                    href="https://jaimemonquartier.ca" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <span>🔗 jaimemonquartier.ca</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}