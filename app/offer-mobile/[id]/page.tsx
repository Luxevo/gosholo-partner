import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/service"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

// Fetch offer data for metadata and page
async function getOffer(id: string) {
  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select(`
      *,
      commerces (
        name,
        address,
        image_url
      )
    `)
    .eq("id", id)
    .single()

  return offer
}

// Dynamic metadata for Open Graph (link previews)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const offer = await getOffer(id)

  if (!offer) {
    return {
      title: "Offre non trouvée - GoSholo",
      description: "Cette offre n'existe plus ou a expiré.",
    }
  }

  const title = offer.title || "Offre spéciale"
  const description = offer.description || `Découvrez cette offre chez ${offer.commerces?.name || "un commerce local"}`
  const image = offer.image_url || offer.commerces?.image_url || "/offers.png"

  return {
    title: `${title} - GoSholo`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: "website",
      siteName: "GoSholo",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function OfferMobilePage({ params }: PageProps) {
  const { id } = await params
  const offer = await getOffer(id)

  const appSchemeUrl = `gosholomobile://offer/${id}`
  const appStoreUrl = "https://apps.apple.com/app/gosholo/id6743543625"
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-600 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offre non trouvée</h1>
          <p className="text-gray-600 mb-6">Cette offre n'existe plus ou a expiré.</p>
          <a
            href={appStoreUrl}
            className="inline-block bg-teal-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-teal-700 transition"
          >
            Télécharger GoSholo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-600 to-teal-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        {/* Offer Image */}
        {(offer.image_url || offer.commerces?.image_url) && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={offer.image_url || offer.commerces?.image_url}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Business name */}
          {offer.commerces?.name && (
            <p className="text-teal-600 font-medium text-sm mb-1">
              {offer.commerces.name}
            </p>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {offer.title}
          </h1>

          {/* Description */}
          {offer.description && (
            <p className="text-gray-600 mb-6 line-clamp-3">
              {offer.description}
            </p>
          )}

          {/* Open in App Button */}
          <a
            href={appSchemeUrl}
            className="block w-full bg-orange-500 text-white font-bold text-center py-4 rounded-full mb-4 hover:bg-orange-600 transition"
          >
            Ouvrir dans l'app
          </a>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Pas encore l'app?</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black text-white font-semibold text-center py-3 rounded-xl hover:bg-gray-800 transition text-sm"
            >
              App Store
            </a>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-black text-white font-semibold text-center py-3 rounded-xl hover:bg-gray-800 transition text-sm"
            >
              Play Store
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Découvrez les meilleures offres locales avec GoSholo
          </p>
        </div>
      </div>
    </div>
  )
}
