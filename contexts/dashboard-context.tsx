"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface DashboardCounts {
  commerces: number
  offers: number
  events: number
  isLoading: boolean
}

interface DashboardContextType {
  counts: DashboardCounts
  refreshCounts: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<DashboardCounts>({
    commerces: 0,
    offers: 0,
    events: 0,
    isLoading: true
  })

  const fetchCounts = async () => {
    try {
      setCounts(prev => ({ ...prev, isLoading: true }))
      const supabase = createClient()
      
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Authentication error:', userError)
        setCounts(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Get user's commerces
      const { data: commercesData, error: commercesError } = await supabase
        .from('commerces')
        .select('id')
        .eq('profile_id', user.id)

      if (commercesError) {
        console.error('Error loading commerces:', commercesError)
        setCounts(prev => ({ ...prev, isLoading: false }))
        return
      }

      const commerceIds = commercesData?.map(c => c.id) || []
      const commercesCount = commerceIds.length

      // Get offers count for user's commerces
      let offersCount = 0
      if (commerceIds.length > 0) {
        const { count: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .in('commerce_id', commerceIds)

        if (!offersError) {
          offersCount = offersData || 0
        }
      }

      // Get events count for user's commerces
      let eventsCount = 0
      if (commerceIds.length > 0) {
        const { count: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .in('commerce_id', commerceIds)

        if (!eventsError) {
          eventsCount = eventsData || 0
        }
      }

      setCounts({
        commerces: commercesCount,
        offers: offersCount,
        events: eventsCount,
        isLoading: false
      })

    } catch (error) {
      console.error('Error fetching dashboard counts:', error)
      setCounts(prev => ({ ...prev, isLoading: false }))
    }
  }

  const refreshCounts = () => {
    fetchCounts()
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  return (
    <DashboardContext.Provider value={{ counts, refreshCounts }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
} 