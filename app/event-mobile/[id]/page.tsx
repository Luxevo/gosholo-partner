import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/service"
import { headers } from "next/headers"

interface PageProps {
  params: Promise<{ id: string }>
}

// Fetch event data for metadata and page
async function getEvent(id: string) {
  try {
    // First fetch the event
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", id)
      .single()

    if (eventError || !event) {
      console.error("Error fetching event:", eventError)
      return null
    }

    // Then fetch the commerce
    let commerce = null
    if (event.commerce_id) {
      const { data: commerceData } = await supabaseAdmin
        .from("commerces")
        .select("name, address, image_url")
        .eq("id", event.commerce_id)
        .single()
      commerce = commerceData
    }

    return { ...event, commerces: commerce }
  } catch (error) {
    console.error("Error in getEvent:", error)
    return null
  }
}

// Format date for display
function formatDate(dateString: string | null): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Dynamic metadata for Open Graph (link previews)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    return {
      title: "Événement non trouvé - GoSholo",
      description: "Cet événement n'existe plus ou a expiré.",
    }
  }

  const title = event.title || "Événement"
  const description = event.description || `Découvrez cet événement chez ${event.commerces?.name || "un commerce local"}`

  // Ensure absolute URL for Open Graph images
  const baseUrl = "https://app.gosholo.com"
  let image = event.image_url || event.commerces?.image_url || `${baseUrl}/events.png`
  if (image.startsWith("/")) {
    image = `${baseUrl}${image}`
  }

  return {
    title: `${title} - GoSholo`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/event-mobile/${id}`,
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

export default async function EventMobilePage({ params }: PageProps) {
  const { id } = await params
  const event = await getEvent(id)

  // Detect OS from user agent
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)

  const appSchemeUrl = `gosholomobile://event/${id}`
  const appStoreUrl = "https://apps.apple.com/ca/app/gosholo/id6749919037"
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"

  // Smart store URL based on device
  const storeUrl = isIOS ? appStoreUrl : isAndroid ? playStoreUrl : appStoreUrl

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-600 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h1>
          <p className="text-gray-600 mb-6">Cet événement n'existe plus ou a expiré.</p>
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
        {/* Event Image */}
        {(event.image_url || event.commerces?.image_url) && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={event.image_url || event.commerces?.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Business name */}
          {event.commerces?.name && (
            <p className="text-teal-600 font-medium text-sm mb-1">
              {event.commerces.name}
            </p>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {event.title}
          </h1>

          {/* Date */}
          {event.start_date && (
            <p className="text-orange-500 font-medium text-sm mb-3">
              📅 {formatDate(event.start_date)}
              {event.end_date && event.end_date !== event.start_date && (
                <> - {formatDate(event.end_date)}</>
              )}
            </p>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-gray-600 mb-6 line-clamp-3">
              {event.description}
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
            Découvrez les meilleurs événements locaux avec GoSholo
          </p>
        </div>
      </div>
    </div>
  )
}
