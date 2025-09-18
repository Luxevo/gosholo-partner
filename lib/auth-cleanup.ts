// lib/auth-cleanup.ts
// Utility for complete authentication cleanup

export function forceAuthCleanup(reason: string = 'Auth cleanup') {
  console.log(`🧹 ${reason} - performing complete auth cleanup`)
  
  try {
    // 1. Clear all localStorage
    localStorage.clear()
    
    // 2. Clear all sessionStorage  
    sessionStorage.clear()
    
    // 3. Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // 4. Clear IndexedDB (used by some Supabase clients)
    if ('indexedDB' in window) {
      indexedDB.databases?.().then(databases => {
        databases.forEach(db => {
          if (db.name?.includes('supabase')) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      }).catch(() => {
        // Ignore errors
      })
    }
    
    console.log('✅ Complete auth cleanup finished')
    
  } catch (error) {
    console.error('Error during auth cleanup:', error)
  }
}

export function forceRedirectHome(reason: string = 'Redirect') {
  console.log(`🔄 ${reason} - forcing redirect to home`)
  
  // Use replace to avoid back button issues
  window.location.replace('/')
}

export function handleDeletedUserError(error: any) {
  if (error?.message?.includes('User from sub claim in JWT does not exist')) {
    forceAuthCleanup('Deleted user JWT detected')
    forceRedirectHome('User deleted')
    return true
  }
  return false
}
