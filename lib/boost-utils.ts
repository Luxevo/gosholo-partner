import { createClient } from "@/lib/supabase/client"

export const BOOST_DURATION_HOURS = 72

/**
 * Check if a boost is expired based on boosted_at timestamp
 */
export function isBoostExpired(boostedAt: string | null): boolean {
  if (!boostedAt) return true
  
  const boostedTime = new Date(boostedAt).getTime()
  const now = Date.now()
  const hoursElapsed = (now - boostedTime) / (1000 * 60 * 60)
  
  return hoursElapsed >= BOOST_DURATION_HOURS
}

/**
 * Get remaining hours for a boost
 */
export function getBoostRemainingHours(boostedAt: string | null): number {
  if (!boostedAt) return 0
  
  const boostedTime = new Date(boostedAt).getTime()
  const now = Date.now()
  const hoursElapsed = (now - boostedTime) / (1000 * 60 * 60)
  const remaining = BOOST_DURATION_HOURS - hoursElapsed
  
  return Math.max(0, Math.floor(remaining))
}

/**
 * Format remaining time as human readable string
 */
export function formatBoostRemainingTime(boostedAt: string | null, locale: string = 'fr'): string {
  const remainingHours = getBoostRemainingHours(boostedAt)
  
  if (remainingHours === 0) {
    return '0h'
  }
  
  return `${remainingHours}h`
}

/**
 * Automatically expire boosts that are older than 72 hours
 */
export async function expireOldBoosts(): Promise<void> {
  const supabase = createClient()
  
  try {
    const cutoffTime = new Date(Date.now() - (BOOST_DURATION_HOURS * 60 * 60 * 1000)).toISOString()
    
    // Expire old offers
    const { error: offersError } = await supabase
      .from('offers')
      .update({ 
        boosted: false,
        boost_type: null 
      })
      .eq('boosted', true)
      .lt('boosted_at', cutoffTime)
    
    if (offersError) {
      console.error('Error expiring offer boosts:', offersError)
    }
    
    // Expire old events
    const { error: eventsError } = await supabase
      .from('events')
      .update({ 
        boosted: false,
        boost_type: null 
      })
      .eq('boosted', true)
      .lt('boosted_at', cutoffTime)
    
    if (eventsError) {
      console.error('Error expiring event boosts:', eventsError)
    }
    
    // Expire old commerces
    const { error: commercesError } = await supabase
      .from('commerces')
      .update({ 
        boosted: false,
        boost_type: null 
      })
      .eq('boosted', true)
      .lt('boosted_at', cutoffTime)
    
    if (commercesError) {
      console.error('Error expiring commerce boosts:', commercesError)
    }
    
    console.log('Boost expiry cleanup completed')
  } catch (error) {
    console.error('Error during boost expiry cleanup:', error)
  }
}

/**
 * Apply a boost to content (offer or event)
 */
export async function applyBoost(
  contentId: string,
  contentType: 'offer' | 'event' | 'commerce',
  boostType: 'en_vedette' | 'visibilite',
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    // Check if user has available boost credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_boost_credits')
      .select('available_en_vedette, available_visibilite')
      .eq('user_id', userId)
      .single()
    
    if (creditsError) {
      return { success: false, error: 'Erreur lors de la vérification des crédits' }
    }
    
    const availableCredits = boostType === 'en_vedette' 
      ? credits?.available_en_vedette || 0
      : credits?.available_visibilite || 0
    
    if (availableCredits <= 0) {
      return { success: false, error: 'Crédit boost insuffisant' }
    }
    
    // Check if content is already boosted
    const tableName = contentType === 'offer' ? 'offers' : contentType === 'event' ? 'events' : 'commerces'
    const { data: existingContent, error: checkError } = await supabase
      .from(tableName)
      .select('boosted')
      .eq('id', contentId)
      .single()
    
    if (checkError) {
      return { success: false, error: 'Erreur lors de la vérification de la publication' }
    }
    
    if (existingContent?.boosted) {
      return { success: false, error: 'Cette publication est déjà boostée' }
    }
    
    // Apply boost to content
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        boosted: true,
        boost_type: boostType,
        boosted_at: new Date().toISOString()
      })
      .eq('id', contentId)
    
    if (updateError) {
      return { success: false, error: 'Erreur lors de l\'application du boost' }
    }
    
    // Decrement boost credits
    const newCredits = {
      ...(boostType === 'en_vedette' 
        ? { available_en_vedette: (credits?.available_en_vedette || 0) - 1 }
        : { available_visibilite: (credits?.available_visibilite || 0) - 1 }
      )
    }
    
    const { error: creditUpdateError } = await supabase
      .from('user_boost_credits')
      .update(newCredits)
      .eq('user_id', userId)
    
    if (creditUpdateError) {
      // Rollback the boost if credit update fails
      await supabase
        .from(tableName)
        .update({ 
          boosted: false,
          boost_type: null,
          boosted_at: null
        })
        .eq('id', contentId)
      
      return { success: false, error: 'Erreur lors de la mise à jour des crédits' }
    }
    
    return { success: true }
    
    // Note: Components using this function should call refreshCounts() from DashboardContext
    // after successful boost application to update the header display
  } catch (error) {
    console.error('Error applying boost:', error)
    return { success: false, error: 'Erreur inattendue' }
  }
}

/**
 * Remove boost from content
 */
export async function removeBoost(
  contentId: string,
  contentType: 'offer' | 'event' | 'commerce'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const tableName = contentType === 'offer' ? 'offers' : contentType === 'event' ? 'events' : 'commerces'
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        boosted: false,
        boost_type: null,
        boosted_at: null
      })
      .eq('id', contentId)
    
    if (updateError) {
      return { success: false, error: 'Erreur lors de la suppression du boost' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error removing boost:', error)
    return { success: false, error: 'Erreur inattendue' }
  }
}