import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/service"
import { headers } from "next/headers"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getCommerce(id: string) {
  try {
    const { data: commerce, error } = await supabaseAdmin
      .from("commerces")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !commerce) {
      console.error("Error fetching commerce:", error)
      return null
    }

    return commerce
  } catch (error) {
    console.error("Error in getCommerce:", error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const commerce = await getCommerce(id)

  if (!commerce) {
    return {
      title: "Commerce non trouvé - GoSholo",
      description: "Ce commerce n'existe plus.",
    }
  }

  const title = commerce.name || "Commerce local"
  const description = commerce.description || `Découvrez ${commerce.name} sur GoSholo`

  const baseUrl = "https://app.gosholo.com"
  let image = commerce.image_url || `${baseUrl}/logo.png`
  if (image.startsWith("/")) {
    image = `${baseUrl}${image}`
  }

  return {
    title: `${title} - GoSholo`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/commerce-mobile/${id}`,
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

export default async function CommerceMobilePage({ params }: PageProps) {
  const { id } = await params
  const commerce = await getCommerce(id)

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)

  const appSchemeUrl = `gosholomobile://commerce/${id}`
  const appStoreUrl = "https://apps.apple.com/ca/app/gosholo/id6749919037"
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"

  const storeUrl = isIOS ? appStoreUrl : isAndroid ? playStoreUrl : appStoreUrl

  if (!commerce) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-600 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commerce non trouvé</h1>
          <p className="text-gray-600 mb-6">Ce commerce n&#39;existe plus.</p>
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
        {commerce.image_url && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={commerce.image_url}
              alt={commerce.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {commerce.name}
          </h1>

          {commerce.address && (
            <p className="text-gray-500 text-sm mb-2">
              {commerce.address}
            </p>
          )}

          {commerce.description && (
            <p className="text-gray-600 mb-6 line-clamp-3">
              {commerce.description}
            </p>
          )}

          <button
            id="open-app-btn"
            className="block w-full bg-orange-500 text-white font-bold text-center py-4 rounded-full hover:bg-orange-600 transition cursor-pointer"
          >
            Voir dans l&#39;app
          </button>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.getElementById('open-app-btn').addEventListener('click', function() {
                  var appUrl = '${appSchemeUrl}';
                  var storeUrl = '${storeUrl}';
                  var timeout;
                  var now = Date.now();

                  window.location.href = appUrl;

                  timeout = setTimeout(function() {
                    if (Date.now() - now < 2000) {
                      window.location.href = storeUrl;
                    }
                  }, 1500);

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

        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Découvrez les meilleurs commerces locaux avec GoSholo
          </p>
        </div>
      </div>
    </div>
  )
}
