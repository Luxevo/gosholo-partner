import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est sur une page d'authentification
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // Pour la démo, on considère qu'un utilisateur est connecté s'il a un cookie 'auth-token'
  const isAuthenticated = request.cookies.has("auth-token")

  // Si l'utilisateur n'est pas authentifié et n'est pas sur une page d'auth
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Si l'utilisateur est authentifié et sur une page d'auth, rediriger vers le dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|manifest.json).*)",
  ],
}
