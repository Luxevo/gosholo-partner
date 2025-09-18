// lib/supabase/interceptor.ts
// Network interceptor to catch JWT errors at the lowest level

import { handleDeletedUserError } from '@/lib/auth-cleanup'

let isInterceptorActive = false

export function setupSupabaseInterceptor() {
  if (isInterceptorActive || typeof window === 'undefined') return
  
  isInterceptorActive = true
  console.log('🛡️ Setting up Supabase network interceptor')

  // Intercept fetch requests
  const originalFetch = window.fetch
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const response = await originalFetch(input, init)
      
      // Check if this is a Supabase auth request that failed
      if (input.toString().includes('supabase') && !response.ok) {
        try {
          const clone = response.clone()
          const errorData = await clone.json()
          
          if (errorData?.message?.includes('User from sub claim in JWT does not exist')) {
            console.log('🚨 Network interceptor caught deleted user JWT error')
            handleDeletedUserError(new Error(errorData.message))
            return response
          }
        } catch (parseError) {
          // Ignore JSON parse errors
        }
      }
      
      return response
      
    } catch (fetchError: any) {
      // Check if the fetch error contains our JWT error
      if (handleDeletedUserError(fetchError)) {
        console.log('🚨 Network interceptor caught fetch error for deleted user')
      }
      throw fetchError
    }
  }

  // Intercept XMLHttpRequest as well (in case Supabase uses it)
  const OriginalXHR = window.XMLHttpRequest
  
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR()
    const originalSend = xhr.send
    
    xhr.send = function(data) {
      xhr.addEventListener('error', (event) => {
        if (xhr.responseText?.includes('User from sub claim in JWT does not exist')) {
          console.log('🚨 XHR interceptor caught deleted user JWT error')
          handleDeletedUserError(new Error(xhr.responseText))
        }
      })
      
      xhr.addEventListener('load', () => {
        if (!xhr.responseURL?.includes('supabase')) return
        
        try {
          if (xhr.responseText?.includes('User from sub claim in JWT does not exist')) {
            console.log('🚨 XHR interceptor caught deleted user JWT error in response')
            handleDeletedUserError(new Error(xhr.responseText))
          }
        } catch (error) {
          // Ignore parsing errors
        }
      })
      
      return originalSend.call(this, data)
    }
    
    return xhr
  }
  
  console.log('✅ Supabase network interceptor active')
}

export function cleanupSupabaseInterceptor() {
  isInterceptorActive = false
  // Note: We don't restore original fetch/XHR because it might break things
  // The interceptor will just become inactive on next page load
}
