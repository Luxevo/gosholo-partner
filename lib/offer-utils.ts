import { createClient } from "@/lib/supabase/client"

/**
 * Checks and deactivates offers that have passed their end_date
 * This function can be called from any part of the application
 */
export const checkAndDeactivateOffers = async () => {
  const supabase = createClient()
  
  try {
    const now = new Date().toISOString()
    
    // Update offers where end_date has passed and still active
    const { error } = await supabase
      .from('offers')
      .update({ is_active: false })
      .lt('end_date', now)
      .eq('is_active', true)

    if (error) {
      console.error('Error deactivating expired offers:', error)
      return { success: false, error }
    } else {
      console.log('Expired offers deactivated successfully')
      return { success: true }
    }
  } catch (error) {
    console.error('Error in checkAndDeactivateOffers:', error)
    return { success: false, error }
  }
}

/**
 * Calculates days remaining for an offer based on its end_date
 */
export const getDaysRemaining = (endDate: string | null): number => {
  if (!endDate) return 0
  
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, daysRemaining)
}

/**
 * Gets the status badge for an offer based on its active status and days remaining
 */
export const getOfferStatus = (isActive: boolean, endDate: string | null) => {
  if (!isActive) {
    return { 
      label: 'Expirée', 
      variant: 'destructive' as const,
      color: 'text-red-600'
    }
  }
  
  const daysRemaining = getDaysRemaining(endDate)
  
  if (daysRemaining === 0) {
    return { 
      label: 'Expire aujourd\'hui', 
      variant: 'destructive' as const,
      color: 'text-red-600'
    }
  } else if (daysRemaining <= 7) {
    return { 
      label: `Expire bientôt (${daysRemaining}j)`, 
      variant: 'destructive' as const,
      color: 'text-red-600'
    }
  } else if (daysRemaining <= 30) {
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

 