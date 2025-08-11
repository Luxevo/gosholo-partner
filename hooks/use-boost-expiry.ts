import { useEffect } from "react"
import { expireOldBoosts } from "@/lib/boost-utils"

/**
 * Hook to automatically expire old boosts
 * Runs periodically to clean up expired boosts
 */
export function useBoostExpiry(intervalMinutes: number = 30) {
  useEffect(() => {
    // Run immediately on mount
    expireOldBoosts()
    
    // Set up periodic cleanup
    const interval = setInterval(() => {
      expireOldBoosts()
    }, intervalMinutes * 60 * 1000) // Convert minutes to milliseconds
    
    return () => clearInterval(interval)
  }, [intervalMinutes])
}