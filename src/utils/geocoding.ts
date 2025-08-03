/**
 * Geocoding utilities for converting coordinates to addresses
 */

interface GeocodingResult {
  address: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

/**
 * Reverse geocoding using Google Geocoding API
 * Note: Requires Google Maps API key with Geocoding API enabled
 */
export const reverseGeocode = async (
  latitude: number, 
  longitude: number,
  apiKey?: string
): Promise<GeocodingResult | null> => {
  try {
    console.log('=== reverseGeocode called ===');
    console.log('API Key provided:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key starts with:', apiKey?.substring(0, 10) || 'N/A');
    
    if (!apiKey) {
      console.warn('Google Maps API key not provided for geocoding');
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // Handle different API response statuses
    if (data.status === 'REQUEST_DENIED') {
      console.warn('Geocoding API access denied. Check API key restrictions:', data.error_message);
      return null;
    }
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.warn('Geocoding API quota exceeded');
      return null;
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.warn('No geocoding results found for coordinates');
      return null;
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('Geocoding failed:', data.status, data.error_message);
      return null;
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract address components
    let streetNumber = '';
    let route = '';
    let locality = '';
    let administrativeArea = '';
    let country = '';

    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        locality = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        administrativeArea = component.short_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }

    const address = streetNumber && route ? `${streetNumber} ${route}` : route;
    const city = locality;
    const state = administrativeArea;
    const fullAddress = result.formatted_address;

    return {
      address,
      city,
      state,
      country,
      fullAddress,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Simple coordinate formatting for display
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);
  return `${lat}, ${lng}`;
};

/**
 * Get a simple location description from coordinates
 * Falls back to coordinate display if geocoding is not available
 */
export const getLocationDescription = async (
  latitude: number, 
  longitude: number,
  apiKey?: string
): Promise<string> => {
  console.log('=== getLocationDescription called ===');
  console.log('API Key provided:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with:', apiKey?.substring(0, 10) || 'N/A');
  
  // Check if API key is available
  if (!apiKey) {
    console.warn('No Google Maps API key available for geocoding');
    return formatCoordinates(latitude, longitude);
  }
  
  try {
    const geocodeResult = await reverseGeocode(latitude, longitude, apiKey);
    
    if (geocodeResult) {
      if (geocodeResult.address && geocodeResult.city) {
        return `${geocodeResult.address}, ${geocodeResult.city}`;
      } else if (geocodeResult.city) {
        return geocodeResult.city;
      } else if (geocodeResult.fullAddress) {
        return geocodeResult.fullAddress;
      }
    }
  } catch (error) {
    console.warn('Geocoding failed, using coordinate fallback:', error);
  }
  
  // Fallback to coordinates
  return formatCoordinates(latitude, longitude);
}; 