// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Add error handling for deleted users
  const originalGetUser = client.auth.getUser.bind(client.auth)
  client.auth.getUser = async () => {
    try {
      return await originalGetUser()
    } catch (error: any) {
      if (error.message?.includes('User from sub claim in JWT does not exist')) {
        console.log('JWT token exists but user deleted - clearing session')
        // Clear the invalid session
        await client.auth.signOut({ scope: 'global' })
        return { data: { user: null }, error }
      }
      throw error
    }
  }

  return client
}

