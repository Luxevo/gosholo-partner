import { createClient } from "@/lib/supabase/client"

/**
 * Checks and deactivates offers that are older than 30 days
 * This function can be called from any part of the application
 */
export const checkAndDeactivateOffers = async () => {
  const supabase = createClient()
  
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Update offers that are older than 30 days and still active
    const { error } = await supabase
      .from('offers')
      .update({ is_active: false })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .eq('is_active', true)

    if (error) {
      console.error('Error deactivating old offers:', error)
      return { success: false, error }
    } else {
      console.log('Old offers deactivated successfully')
      return { success: true }
    }
  } catch (error) {
    console.error('Error in checkAndDeactivateOffers:', error)
    return { success: false, error }
  }
}

/**
 * Calculates days remaining for an offer based on its creation date
 */
export const getDaysRemaining = (createdAt: string): number => {
  const createdDate = new Date(createdAt)
  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = 30 - daysSinceCreation
  return Math.max(0, daysRemaining)
}

/**
 * Gets the status badge for an offer based on its active status and days remaining
 */
export const getOfferStatus = (isActive: boolean, createdAt: string) => {
  if (!isActive) {
    return { 
      label: 'Expirée', 
      variant: 'destructive' as const,
      color: 'text-red-600'
    }
  }
  
  const daysRemaining = getDaysRemaining(createdAt)
  
  if (daysRemaining <= 7) {
    return { 
      label: `Expire bientôt (${daysRemaining}j)`, 
      variant: 'destructive' as const,
      color: 'text-red-600'
    }
  } else if (daysRemaining <= 14) {
    return { 
      label: `Actif (${daysRemaining}j)`, 
      variant: 'secondary' as const,
      color: 'text-yellow-600'
    }
  } else {
    return { 
      label: `Actif (${daysRemaining}j)`, 
      variant: 'default' as const,
      color: 'text-green-600'
    }
  }
}

 