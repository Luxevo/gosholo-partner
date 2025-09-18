import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated
  let user = null
  let error = null
  
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
    error = result.error
  } catch (authError: any) {
    // Handle JWT errors (user deleted but token still exists)
    if (authError.message?.includes('User from sub claim in JWT does not exist')) {
      console.log('JWT token exists but user deleted - clearing session')
      // Clear the invalid session
      await supabase.auth.signOut({ scope: 'global' })
      error = authError
      user = null
    } else {
      error = authError
      user = null
    }
  }

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname.startsWith('/login') || 
                     url.pathname.startsWith('/register') || 
                     url.pathname.startsWith('/forgot-password') ||
                     url.pathname.startsWith('/reset-password')
  
  const isDashboardPage = url.pathname.startsWith('/dashboard')
  const isApiRoute = url.pathname.startsWith('/api')
  const isPublicAsset = url.pathname.startsWith('/_next') ||
                        url.pathname.startsWith('/favicon') ||
                        url.pathname.includes('/manifest.json') ||
                        url.pathname.endsWith('.png') ||
                        url.pathname.endsWith('.jpg') ||
                        url.pathname.endsWith('.svg')

  // Skip middleware for API routes and public assets only
  if (isApiRoute || isPublicAsset) {
    return response
  }

  // If user is not authenticated
  if (error || !user) {
    // Redirect dashboard pages to login
    if (isDashboardPage) {
      url.pathname = '/login'
      url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    
    // Allow access to auth pages
    if (isAuthPage) {
      return response
    }

    // Redirect root to login
    if (url.pathname === '/') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // If user is authenticated
  if (user) {
    // Redirect auth pages to dashboard
    if (isAuthPage) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Redirect root to dashboard
    if (url.pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}