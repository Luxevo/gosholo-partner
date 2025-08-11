"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface DashboardCounts {
  commerces: number
  offers: number
  events: number
  totalBoosts: number
  isLoading: boolean
}

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface Commerce {
  id: string
  name: string
  description: string | null
  address: string
  category: string
  email: string | null
  phone: string | null
  website: string | null
  image_url: string | null
  status: string
  created_at: string | null
  updated_at: string | null
  offers?: Offer[]
  events?: Event[]
}

interface Offer {
  id: string
  title: string
  description: string
  offer_type: "in_store" | "online" | "both"
  condition: string | null
  picture: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

interface Event {
  id: string
  title: string
  description: string
  condition: string | null
  picture: string | null
  created_at: string | null
  updated_at: string | null
}

interface DashboardContextType {
  counts: DashboardCounts
  userProfile: UserProfile | null
  commerces: Commerce[]
  refreshCounts: () => void
  isLoading: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<DashboardCounts>({
    commerces: 0,
    offers: 0,
    events: 0,
    totalBoosts: 0,
    isLoading: true
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [commerces, setCommerces] = useState<Commerce[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Authentication error:', userError)
        setIsLoading(false)
        return
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
      } else {
        setUserProfile(profileData)
      }

      // Get user's commerces with offers and events
      const { data: commercesData, error: commercesError } = await supabase
        .from('commerces')
        .select('*')
        .eq('user_id', user.id)

      if (commercesError) {
        console.error('Error loading commerces:', commercesError)
        setIsLoading(false)
        return
      }

      const commerceIds = commercesData?.map(c => c.id) || []
      const commercesCount = commerceIds.length

      // Get offers for user's commerces
      let offersCount = 0
      let offersData: any[] = []
      if (commerceIds.length > 0) {
        const { data: offers, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .in('commerce_id', commerceIds)

        if (!offersError) {
          offersData = offers || []
          offersCount = offersData.length
        }
      }

      // Get events for user's commerces
      let eventsCount = 0
      let eventsData: any[] = []
      if (commerceIds.length > 0) {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('commerce_id', commerceIds)

        if (!eventsError) {
          eventsData = events || []
          eventsCount = eventsData.length
        }
      }

      // Combine commerces with their offers and events
      const commercesWithContent = (commercesData || []).map(commerce => ({
        ...commerce,
        offers: offersData.filter(offer => offer.commerce_id === commerce.id),
        events: eventsData.filter(event => event.commerce_id === commerce.id)
      }))

      setCommerces(commercesWithContent)

      // Get boost credits
      let totalBoosts = 0
      const { data: boostCredits } = await supabase
        .from('user_boost_credits')
        .select('available_en_vedette, available_visibilite')
        .eq('user_id', user.id)
        .single()
      
      if (boostCredits) {
        totalBoosts = (boostCredits.available_en_vedette || 0) + (boostCredits.available_visibilite || 0)
      }

      setCounts({
        commerces: commercesCount,
        offers: offersCount,
        events: eventsCount,
        totalBoosts,
        isLoading: false
      })
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setCounts(prev => ({ ...prev, totalBoosts: 0, isLoading: false }))
      setIsLoading(false)
    }
  }

  const refreshCounts = () => {
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <DashboardContext.Provider value={{ counts, userProfile, commerces, refreshCounts, isLoading }}>
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