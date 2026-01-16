import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/service"
import { headers } from "next/headers"

interface PageProps {
  params: Promise<{ id: string }>
}

// Fetch offer data for metadata and page
async function getOffer(id: string) {
  try {
    // First fetch the offer
    const { data: offer, error: offerError } = await supabaseAdmin
      .from("offers")
      .select("*")
      .eq("id", id)
      .single()

    if (offerError || !offer) {
      console.error("Error fetching offer:", offerError)
      return null
    }

    // Then fetch the commerce
    let commerce = null
    if (offer.commerce_id) {
      const { data: commerceData } = await supabaseAdmin
        .from("commerces")
        .select("name, address, image_url")
        .eq("id", offer.commerce_id)
        .single()
      commerce = commerceData
    }

    return { ...offer, commerces: commerce }
  } catch (error) {
    console.error("Error in getOffer:", error)
    return null
  }
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

  // Ensure absolute URL for Open Graph images
  const baseUrl = "https://app.gosholo.com"
  let image = offer.image_url || offer.commerces?.image_url || `${baseUrl}/offers.png`
  if (image.startsWith("/")) {
    image = `${baseUrl}${image}`
  }

  return {
    title: `${title} - GoSholo`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/offer-mobile/${id}`,
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

  // Detect OS from user agent
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)

  const appSchemeUrl = `gosholomobile://offer/${id}`
  const appStoreUrl = "https://apps.apple.com/ca/app/gosholo/id6749919037"
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"

  // Smart store URL based on device
  const storeUrl = isIOS ? appStoreUrl : isAndroid ? playStoreUrl : appStoreUrl

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

          {/* Smart Open/Download Button */}
          <button
            id="open-app-btn"
            className="block w-full bg-orange-500 text-white font-bold text-center py-4 rounded-full hover:bg-orange-600 transition cursor-pointer"
          >
            Voir dans l'app
          </button>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.getElementById('open-app-btn').addEventListener('click', function() {
                  var appUrl = '${appSchemeUrl}';
                  var storeUrl = '${storeUrl}';
                  var timeout;
                  var now = Date.now();

                  // Try to open the app
                  window.location.href = appUrl;

                  // If still here after 1.5s, redirect to store
                  timeout = setTimeout(function() {
                    if (Date.now() - now < 2000) {
                      window.location.href = storeUrl;
                    }
                  }, 1500);

                  // If page becomes hidden (app opened), clear timeout
                  window.addEventListener('visibilitychange', function() {
                    if (document.hidden) {
                      clearTimeout(timeout);
                    }
                  });
                });
              `,
            }}
          />
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
