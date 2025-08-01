"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // User is logged in, redirect to commerces
        router.push('/commerces')
      } else {
        // User is not logged in, redirect to login
        router.push('/login')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-white">G</span>
        </div>
        <p className="text-brand-primary/70">Redirection...</p>
      </div>
    </div>
  )
}