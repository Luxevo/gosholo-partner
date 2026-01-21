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

  // Android Intent URL - opens app if installed, otherwise goes to Play Store directly (no browser popup)
  const androidIntentUrl = `intent://#Intent;scheme=gosholomobile;package=com.gosholo.gosholo;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`

  // Mobile - try app first, then fallback to store
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#016167" }}>
      <script
        dangerouslySetInnerHTML={{
          __html: isAndroid
            ? `
              // Android: Use Intent URL for seamless app-or-store redirect
              window.location.href = '${androidIntentUrl}';
            `
            : `
              // iOS: Try custom scheme, fallback to App Store
              (function() {
                var appUrl = '${APP_SCHEME_URL}';
                var storeUrl = '${storeUrl}';
                var timeout;
                var now = Date.now();

                window.location.href = appUrl;

                timeout = setTimeout(function() {
                  if (Date.now() - now < 2000) {
                    window.location.href = storeUrl;
                  }
                }, 1500);

                document.addEventListener('visibilitychange', function() {
                  if (document.hidden) {
                    clearTimeout(timeout);
                  }
                });
              })();
            `,
        }}
      />
    </div>
  )
}
