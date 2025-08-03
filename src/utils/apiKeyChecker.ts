/**
 * Utility to check and diagnose Google Maps API key configuration
 */

import Constants from 'expo-constants';

export interface ApiKeyStatus {
  hasApiKey: boolean;
  apiKeyLength: number;
  apiKeyPrefix: string;
  isConfigured: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Check the current Google Maps API key configuration
 */
export const checkGoogleMapsApiKey = (): ApiKeyStatus => {
  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const issues: string[] = [];
  const recommendations: string[] = [];

  const status: ApiKeyStatus = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || 'N/A',
    isConfigured: false,
    issues,
    recommendations,
  };

  // Check if API key exists
  if (!apiKey) {
    issues.push('No Google Maps API key found');
    recommendations.push('Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables');
    return status;
  }

  // Check API key format
  if (apiKey.length < 30) {
    issues.push('API key appears to be too short');
    recommendations.push('Verify your API key is correct and complete');
  }

  // Check if it looks like a valid Google API key
  if (!apiKey.startsWith('AIza')) {
    issues.push('API key format doesn\'t match Google API key pattern');
    recommendations.push('Verify you\'re using a valid Google Maps API key');
  }

  // If no issues found, mark as configured
  if (issues.length === 0) {
    status.isConfigured = true;
    recommendations.push('API key appears to be properly configured');
  }

  return status;
};

/**
 * Get recommendations for fixing Google Maps API restrictions
 */
export const getApiKeyRestrictionRecommendations = (): string[] => {
  return [
    '1. Go to Google Cloud Console (https://console.cloud.google.com/)',
    '2. Select your project',
    '3. Navigate to "APIs & Services" > "Credentials"',
    '4. Find your API key and click on it',
    '5. Under "API restrictions", make sure "Geocoding API" is enabled',
    '6. If using "Restrict key", ensure these APIs are included:',
    '   - Maps SDK for Android',
    '   - Maps SDK for iOS', 
    '   - Geocoding API',
    '7. Under "Application restrictions", ensure your app\'s bundle ID is allowed',
    '8. Save the changes and wait a few minutes for them to take effect',
    '',
    'Alternative: Create a separate API key specifically for geocoding with fewer restrictions'
  ];
};

/**
 * Test the API key with a simple geocoding request
 */
export const testApiKey = async (): Promise<{ success: boolean; error?: string }> => {
  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'No API key found' };
  }

  try {
    // Test with a known location (New York City)
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=40.7128,-74.0060&key=${apiKey}`;
    const response = await fetch(testUrl);
    const data = await response.json();

    if (data.status === 'OK') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `API test failed: ${data.status} - ${data.error_message || 'Unknown error'}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Log comprehensive API key diagnostic information
 */
export const logApiKeyDiagnostics = (): void => {
  console.log('=== Google Maps API Key Diagnostics ===');
  
  const status = checkGoogleMapsApiKey();
  console.log('API Key Status:', status);
  
  if (status.issues.length > 0) {
    console.log('Issues found:');
    status.issues.forEach(issue => console.log(`- ${issue}`));
    
    console.log('Recommendations:');
    status.recommendations.forEach(rec => console.log(`- ${rec}`));
  }
  
  console.log('Restriction Fix Recommendations:');
  getApiKeyRestrictionRecommendations().forEach(rec => console.log(rec));
  
  console.log('=====================================');
}; 