#!/usr/bin/env node

/**
 * Test script for Google Maps API key configuration
 * Run with: node scripts/test-api-key.js
 */

require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

console.log('=== Google Maps API Key Test ===\n');

// Check if API key exists
if (!API_KEY) {
  console.log('❌ No API key found in environment variables');
  console.log('Make sure EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is set in your .env file');
  process.exit(1);
}

console.log('✅ API key found');
console.log(`Length: ${API_KEY.length} characters`);
console.log(`Starts with: ${API_KEY.substring(0, 10)}...`);

// Validate format
if (!API_KEY.startsWith('AIza')) {
  console.log('⚠️  Warning: API key format doesn\'t match Google API key pattern');
}

// Test the API key
async function testApiKey() {
  console.log('\n🔍 Testing API key with geocoding request...');
  
  try {
    // Test with New York City coordinates
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=40.7128,-74.0060&key=${API_KEY}`;
    const response = await fetch(testUrl);
    const data = await response.json();

    console.log(`Response status: ${data.status}`);
    
    if (data.status === 'OK') {
      console.log('✅ API key is working correctly!');
      console.log(`Test location: ${data.results[0].formatted_address}`);
    } else {
      console.log('❌ API key test failed');
      console.log(`Error: ${data.status}`);
      if (data.error_message) {
        console.log(`Message: ${data.error_message}`);
      }
      
      // Provide specific guidance based on error
      if (data.status === 'REQUEST_DENIED') {
        console.log('\n🔧 To fix REQUEST_DENIED error:');
        console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
        console.log('2. Select your project');
        console.log('3. Go to "APIs & Services" > "Credentials"');
        console.log('4. Find your API key and click on it');
        console.log('5. Under "API restrictions", ensure "Geocoding API" is enabled');
        console.log('6. If using "Restrict key", add these APIs:');
        console.log('   - Maps SDK for Android');
        console.log('   - Maps SDK for iOS');
        console.log('   - Geocoding API');
        console.log('7. Save changes and wait a few minutes');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.log('\n💰 You\'ve exceeded your API quota');
        console.log('Check your Google Cloud Console billing and quotas');
      } else if (data.status === 'INVALID_REQUEST') {
        console.log('\n🔧 Invalid request - check your API key format');
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the test
testApiKey().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
}); 