// lib/test-auth-cleanup.ts
// Test utility to simulate the JWT error and verify cleanup works

export function simulateDeletedUserError() {
  console.log('🧪 Simulating deleted user JWT error for testing')
  
  // Create a fake error that matches the real one
  const fakeError = new Error('User from sub claim in JWT does not exist')
  
  // Dispatch it as an unhandled promise rejection
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('unhandledrejection', {
      detail: { reason: fakeError }
    }))
  }, 100)
  
  console.log('✅ Fake error dispatched - cleanup should trigger in 100ms')
}

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).testAuthCleanup = simulateDeletedUserError
}
