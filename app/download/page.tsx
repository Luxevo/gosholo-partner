import { headers } from "next/headers"
import { redirect } from "next/navigation"

const APP_STORE_URL = "https://apps.apple.com/ca/app/gosholo/id6749919037"
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"
const APP_SCHEME_URL = "gosholomobile://"

export default async function DownloadPage() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)
  const isMobile = isIOS || isAndroid

  // Desktop - direct redirect to App Store
  if (!isMobile) {
    redirect(APP_STORE_URL)
  }

  const storeUrl = isIOS ? APP_STORE_URL : PLAY_STORE_URL

  // Mobile - try app first, then fallback to store
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, backgroundColor: "#016167" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var appUrl = '${APP_SCHEME_URL}';
                var storeUrl = '${storeUrl}';
                var timeout;
                var now = Date.now();

                // Try to open the app immediately
                window.location.href = appUrl;

                // If still here after 1.5s, redirect to store
                timeout = setTimeout(function() {
                  if (Date.now() - now < 2000) {
                    window.location.href = storeUrl;
                  }
                }, 1500);

                // If page becomes hidden (app opened), clear timeout
                document.addEventListener('visibilitychange', function() {
                  if (document.hidden) {
                    clearTimeout(timeout);
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
