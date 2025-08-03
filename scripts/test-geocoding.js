#!/usr/bin/env node

/**
 * Test geocoding API key
 * Usage: node scripts/test-geocoding.js YOUR_API_KEY_HERE
 */

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.log('❌ Please provide your API key as an argument');
  console.log('Usage: node scripts/test-geocoding.js YOUR_API_KEY_HERE');
  process.exit(1);
}

console.log('=== Testing Geocoding API ===\n');
console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`Length: ${API_KEY.length} characters\n`);

async function testGeocoding() {
  try {
    // Test with New York City coordinates
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=40.7128,-74.0060&key=${API_KEY}`;
    
    console.log('🔍 Making geocoding request...');
    const response = await fetch(testUrl);
    const data = await response.json();

    console.log(`Response Status: ${data.status}`);
    
    if (data.status === 'OK') {
      console.log('✅ Geocoding API is working!');
      console.log(`Test Location: ${data.results[0].formatted_address}`);
      console.log('\n🎉 Your API key is properly configured for geocoding!');
    } else {
      console.log('❌ Geocoding API test failed');
      console.log(`Error: ${data.status}`);
      if (data.error_message) {
        console.log(`Message: ${data.error_message}`);
      }
      
      if (data.status === 'REQUEST_DENIED') {
        console.log('\n🔧 To fix REQUEST_DENIED:');
        console.log('1. Enable "Geocoding API" in Google Cloud Console');
        console.log('2. Remove IP restrictions or add your IP to allowed list');
        console.log('3. Check if API key has proper permissions');
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testGeocoding(); 