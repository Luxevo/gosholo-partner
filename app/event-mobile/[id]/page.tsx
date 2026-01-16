import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/service"

interface PageProps {
  params: Promise<{ id: string }>
}

// Fetch event data for metadata and page
async function getEvent(id: string) {
  const { data: event } = await supabaseAdmin
    .from("events")
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

  return event
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
  const image = event.image_url || event.commerces?.image_url || "/events.png"

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

export default async function EventMobilePage({ params }: PageProps) {
  const { id } = await params
  const event = await getEvent(id)

  const appSchemeUrl = `gosholomobile://event/${id}`
  const appStoreUrl = "https://apps.apple.com/app/gosholo/id6743543625"
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"

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
            Découvrez les meilleurs événements locaux avec GoSholo
          </p>
        </div>
      </div>
    </div>
  )
}
