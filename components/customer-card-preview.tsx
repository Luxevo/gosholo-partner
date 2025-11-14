"use client"

import { Store, Sparkles, Star, X, Heart, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface CustomerCardPreviewProps {
  imageUrl: string
  type: 'offer' | 'event'
  onRemove?: () => void
}

export default function CustomerCardPreview({ imageUrl, type, onRemove }: CustomerCardPreviewProps) {
  const { locale } = useLanguage()

  // Mock data
  const mockOffer = {
    id: 'preview',
    title: locale === 'fr' ? '2 cafés pour 5$' : '2 coffees for $5',
    description: locale === 'fr' 
      ? 'Profitez de cette offre spéciale sur nos délicieux cafés artisanaux.' 
      : 'Enjoy this special offer on our delicious artisanal coffees.',
    image_url: imageUrl,
    boosted: false,
    boost_type: null as any,
    custom_location: null
  }

  const mockEvent = {
    id: 'preview',
    title: locale === 'fr' ? 'Atelier de cuisine' : 'Cooking Workshop',
    description: locale === 'fr' 
      ? 'Apprenez les techniques de base de la cuisine française avec notre chef expert.' 
      : 'Learn basic French cooking techniques with our expert chef.',
    image_url: imageUrl,
    boosted: false,
    boost_type: null as any,
    custom_location: null
  }

  const mockCommerce = {
    name: locale === 'fr' ? 'Café Central' : 'Central Café',
    category: locale === 'fr' ? 'Restaurant' : 'Restaurant'
  }

  const item = type === 'offer' ? mockOffer : mockEvent

  const getEventCategory = () => {
    const text = item.title.toLowerCase()
    if (text.includes('food') || text.includes('cuisine') || text.includes('restaurant')) return locale === 'fr' ? 'Food Fest' : 'Food Fest'
    if (text.includes('music') || text.includes('concert') || text.includes('musique')) return locale === 'fr' ? 'Musique' : 'Music'
    if (text.includes('art') || text.includes('expo') || text.includes('gallery')) return locale === 'fr' ? 'Art' : 'Art'
    if (text.includes('sport') || text.includes('fitness')) return locale === 'fr' ? 'Sport' : 'Sport'
    if (text.includes('market') || text.includes('marché')) return locale === 'fr' ? 'Marché' : 'Market'
    return locale === 'fr' ? 'Événement' : 'Event'
  }

  return (
    <div className="relative w-[356px]">
      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="absolute top-2 right-2 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 w-full h-full">
        {/* Image Section */}
        <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              type === 'offer' 
                ? 'bg-gradient-to-br from-orange-400 to-orange-500' 
                : 'bg-gradient-to-br from-blue-400 to-purple-500'
            }`}>
              <div className="text-white text-center">
                {type === 'offer' ? (
                  <Store className="h-12 w-12 mx-auto mb-2 opacity-80" />
                ) : (
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-80" />
                )}
                <p className="text-sm opacity-80">
                  {type === 'offer' 
                    ? (locale === 'fr' ? 'Image de l\'offre' : 'Offer Image')
                    : (locale === 'fr' ? 'Image de l\'événement' : 'Event Image')
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Boost Badge */}
          {item.boosted && (
            <div className="absolute top-3 left-3">
              <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center text-white shadow-lg ${
                item.boost_type === 'en_vedette' 
                  ? 'bg-brand-primary text-white'
                  : 'bg-blue-600'
              }`}>
                <>
                  {item.boost_type === 'en_vedette' ? (
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
                {item.custom_location || mockCommerce.name}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 bg-white">
          {/* Business Name + Category */}
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-bold text-orange-600">
              {mockCommerce.name}
            </h3>
            <div className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              {type === 'offer' ? mockCommerce.category : getEventCategory()}
            </div>
          </div>

          {/* Title */}
          <h4 className="text-xl font-semibold mb-3 text-black">
            {item.title}
          </h4>

          {/* Description */}
          <div className="text-sm mb-4 text-gray-700">
            <p className="line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-start">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-1.5 px-3 rounded-full transition-colors">
              {type === 'event' 
                ? (locale === 'fr' ? 'Voir l\'événement' : 'View Event')
                : (locale === 'fr' ? 'Voir l\'offre' : 'View Offer')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
