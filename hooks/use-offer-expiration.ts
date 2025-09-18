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
    const checkOffers = async () => {
      const result = await checkAndDeactivateOffers()
      if (!result.success) {
        console.warn('Warning: Could not deactivate old offers:', result.error)
      }
    }
    
    checkOffers()

    // Set up periodic checks
    intervalRef.current = setInterval(async () => {
      const result = await checkAndDeactivateOffers()
      if (!result.success) {
        console.warn('Warning: Could not deactivate old offers:', result.error)
      }
    }, intervalMinutes * 60 * 1000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMinutes])

  return {
    checkNow: async () => {
      const result = await checkAndDeactivateOffers()
      if (!result.success) {
        console.warn('Warning: Could not deactivate old offers:', result.error)
      }
      return result
    }
  }
} 