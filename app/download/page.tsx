import { headers } from "next/headers"
import { redirect } from "next/navigation"

const APP_STORE_URL = "https://apps.apple.com/ca/app/gosholo/id6749919037"
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.gosholo.gosholo"

export default async function DownloadPage() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""

  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)

  if (isIOS) {
    redirect(APP_STORE_URL)
  }

  if (isAndroid) {
    redirect(PLAY_STORE_URL)
  }

  // Desktop fallback - default to App Store
  redirect(APP_STORE_URL)
}
