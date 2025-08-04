import { useEffect, useRef } from 'react'
import { checkAndDeactivateOffers } from '@/lib/offer-utils'

/**
 * Custom hook to periodically check and deactivate expired offers
 * @param intervalMinutes - How often to check for expired offers (default: 60 minutes)
 */
export const useOfferExpiration = (intervalMinutes: number = 60) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check immediately when component mounts
    checkAndDeactivateOffers()

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      checkAndDeactivateOffers()
    }, intervalMinutes * 60 * 1000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMinutes])

  return {
    checkNow: checkAndDeactivateOffers
  }
} 