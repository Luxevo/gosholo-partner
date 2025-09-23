const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

export interface GeocodingResult {
  latitude: number
  longitude: number
  address: string
  postal_code: string
}

export async function geocodePostalCode(postalCode: string): Promise<GeocodingResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox access token not found')
  }

  // Validate Canadian postal code format (e.g., H2X 1Y4)
  const postalCodeRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/
  if (!postalCodeRegex.test(postalCode.toUpperCase().replace(/\s/g, ' '))) {
    throw new Error('Invalid Canadian postal code format')
  }

  // Format postal code with space if needed
  const formattedPostalCode = postalCode.toUpperCase().replace(/\s/g, '').replace(/(.{3})(.{3})/, '$1 $2')
  
  // Auto-detect province from first letter of postal code for better accuracy
  const provinceMap: { [key: string]: string } = {
    'A': 'NL', // Newfoundland and Labrador
    'B': 'NS', // Nova Scotia  
    'C': 'PE', // Prince Edward Island
    'E': 'NB', // New Brunswick
    'G': 'QC', 'H': 'QC', 'J': 'QC', // Quebec
    'K': 'ON', 'L': 'ON', 'M': 'ON', 'N': 'ON', 'P': 'ON', // Ontario
    'R': 'MB', // Manitoba
    'S': 'SK', // Saskatchewan
    'T': 'AB', // Alberta
    'V': 'BC', // British Columbia
    'X': 'NU', 'Y': 'YT', 'Z': 'NT' // Territories
  }
  
  const provinceCode = provinceMap[formattedPostalCode[0]] || ''
  const query = `${formattedPostalCode} ${provinceCode} Canada`
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=CA&limit=1&types=postcode`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center
      
      return {
        latitude,
        longitude,
        address: feature.place_name,
        postal_code: formattedPostalCode
      }
    }
    
    throw new Error('Postal code not found')
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error(`Failed to geocode postal code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateCanadianPostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/
  return postalCodeRegex.test(postalCode.toUpperCase().replace(/\s/g, ' '))
}

export function formatPostalCode(postalCode: string): string {
  return postalCode.toUpperCase().replace(/\s/g, '').replace(/(.{3})(.{3})/, '$1 $2')
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox access token not found')
  }

  const query = `${address} Canada`
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=CA&limit=1&types=address`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center
      
      // Extract postal code from context if available
      const postalCode = feature.context?.find((ctx: any) => ctx.id.startsWith('postcode'))?.text || ''
      
      return {
        latitude,
        longitude,
        address: feature.place_name,
        postal_code: postalCode
      }
    }
    
    throw new Error('Address not found')
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateAddress(address: string): boolean {
  // Basic validation - address should have at least 3 characters and contain some letters
  return address.trim().length >= 3 && /[a-zA-Z]/.test(address)
}

export interface AddressSuggestion {
  id: string
  address: string
  postal_code: string
  latitude: number
  longitude: number
  place_name: string
}

export async function getAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox access token not found')
  }

  if (query.trim().length < 3) {
    return []
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=CA&limit=5&types=address,poi`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      return data.features.map((feature: any) => {
        const [longitude, latitude] = feature.center
        const postalCode = feature.context?.find((ctx: any) => ctx.id.startsWith('postcode'))?.text || ''
        
        return {
          id: feature.id,
          address: feature.place_name,
          postal_code: postalCode,
          latitude,
          longitude,
          place_name: feature.place_name
        }
      })
    }
    
    return []
  } catch (error) {
    console.error('Address suggestions error:', error)
    return []
  }
}