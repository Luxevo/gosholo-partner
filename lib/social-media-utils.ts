export interface SocialMediaLinks {
  facebook_url?: string | null
  instagram_url?: string | null
  website?: string | null
}

export interface SocialMediaValidation {
  isValid: boolean
  errors: string[]
}

/**
 * Auto-formats and validates social media URLs
 */
export function formatSocialMediaUrl(url: string, platform: 'facebook' | 'instagram' | 'website'): string {
  if (!url.trim()) return ''
  
  let cleanUrl = url.trim()
  
  // Remove protocol if present
  cleanUrl = cleanUrl.replace(/^https?:\/\//, '')
  
  // Remove www. if present
  cleanUrl = cleanUrl.replace(/^www\./, '')
  
  // Platform-specific formatting
  switch (platform) {
    case 'facebook':
      if (!cleanUrl.includes('facebook.com')) {
        // Assume it's just the username/page name
        cleanUrl = `facebook.com/${cleanUrl}`
      }
      break
    
    case 'instagram':
      if (!cleanUrl.includes('instagram.com')) {
        // Assume it's just the username
        cleanUrl = `instagram.com/${cleanUrl}`
      }
      break
    
    
    case 'website':
      // For websites, just ensure it has a domain
      break
  }
  
  // Add https:// protocol
  return `https://${cleanUrl}`
}

/**
 * Validates social media URLs
 */
export function validateSocialMediaUrl(url: string, platform: 'facebook' | 'instagram' | 'website'): boolean {
  if (!url.trim()) return true // Optional fields
  
  try {
    const urlObj = new URL(url)
    
    switch (platform) {
      case 'facebook':
        return urlObj.hostname.includes('facebook.com') || urlObj.hostname.includes('fb.com')
      
      case 'instagram':
        return urlObj.hostname.includes('instagram.com')
      
      
      case 'website':
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      
      default:
        return false
    }
  } catch {
    return false
  }
}

/**
 * Validates all social media links
 */
export function validateSocialMediaLinks(links: SocialMediaLinks): SocialMediaValidation {
  const errors: string[] = []
  
  if (links.facebook_url && !validateSocialMediaUrl(links.facebook_url, 'facebook')) {
    errors.push('URL Facebook invalide')
  }
  
  if (links.instagram_url && !validateSocialMediaUrl(links.instagram_url, 'instagram')) {
    errors.push('URL Instagram invalide')
  }
  
  
  if (links.website && !validateSocialMediaUrl(links.website, 'website')) {
    errors.push('URL du site web invalide')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get display name from social media URL
 */
export function getSocialMediaDisplayName(url: string, platform: 'facebook' | 'instagram'): string {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    switch (platform) {
      case 'facebook':
        return pathname.split('/').filter(Boolean)[0] || ''
      
      case 'instagram':
        return pathname.split('/').filter(Boolean)[0] || ''
      
      
      default:
        return ''
    }
  } catch {
    return ''
  }
}