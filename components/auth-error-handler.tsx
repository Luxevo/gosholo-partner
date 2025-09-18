"use client"

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { handleDeletedUserError } from '@/lib/auth-cleanup'
import { setupSupabaseInterceptor } from '@/lib/supabase/interceptor'
import '@/lib/test-auth-cleanup' // Add test function to window

export function AuthErrorHandler() {
  useEffect(() => {
    const supabase = createClient()
    let isHandlingError = false
    
    // Setup network interceptor for the most aggressive error catching
    setupSupabaseInterceptor()

    // More aggressive error handler
    const handleAuthError = async (error: any) => {
      if (isHandlingError) return // Prevent infinite loops
      
      if (handleDeletedUserError(error)) {
        isHandlingError = true
        // The handleDeletedUserError function handles everything
        return
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' && !session) {
          localStorage.clear()
          sessionStorage.clear()
        }
      }
    )

    // Multiple error handlers for different scenarios
    
    // 1. Unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('User from sub claim in JWT does not exist')) {
        handleAuthError(event.reason)
        event.preventDefault()
      }
    }
    
    // 2. Global errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('User from sub claim in JWT does not exist')) {
        handleAuthError(event.error)
        event.preventDefault()
      }
    }
    
    // 3. Console errors (override console.error temporarily)
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('User from sub claim in JWT does not exist')) {
        handleAuthError(new Error(message))
      }
      originalConsoleError.apply(console, args)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
      console.error = originalConsoleError
    }
  }, [])

  return null
}
