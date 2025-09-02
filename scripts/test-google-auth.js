console.log('🔍 Google OAuth Configuration Diagnostic');
console.log('=====================================');

// Check environment variables
const envVars = {
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

console.log('\n📋 Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value ? 'Set' : 'Missing'}`);
});

// Check app config from app.config.js
try {
  const fs = require('fs');
  const path = require('path');
  
  const appConfigPath = path.join(__dirname, '..', 'app.config.js');
  if (fs.existsSync(appConfigPath)) {
    console.log('\n📱 App Configuration (from app.config.js):');
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
    
    // Extract package name
    const packageMatch = appConfigContent.match(/package:\s*"([^"]+)"/);
    if (packageMatch) {
      console.log('Package name:', packageMatch[1]);
    }
    
    // Extract web client ID
    const webClientIdMatch = appConfigContent.match(/"webClientId":\s*"([^"]+)"/);
    if (webClientIdMatch) {
      console.log('Web Client ID:', webClientIdMatch[1]);
    }
  }
} catch (error) {
  console.log('Could not read app.config.js:', error.message);
}

// Check google-services.json
try {
  const fs = require('fs');
  const path = require('path');
  
  const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
  if (fs.existsSync(googleServicesPath)) {
    console.log('\n📄 Google Services File:');
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    console.log('Project ID:', googleServices.project_info?.project_id);
    console.log('Package name:', googleServices.client?.[0]?.client_info?.android_client_info?.package_name);
    
    // Check if OAuth clients are configured
    const oauthClients = googleServices.client?.[0]?.oauth_client || [];
    console.log('OAuth clients configured:', oauthClients.length);
  } else {
    console.log('\n❌ google-services.json not found');
  }
} catch (error) {
  console.log('Could not read google-services.json:', error.message);
}

// Check for common issues
console.log('\n🔍 Common Issues Check:');
console.log('1. Make sure your Google Cloud Console OAuth 2.0 client ID matches your webClientId');
console.log('2. Ensure your package name (com.planttracker) is added to the OAuth client');
console.log('3. Check that your SHA-1 fingerprint is correctly configured');
console.log('4. Verify that Google Sign-In API is enabled in Google Cloud Console');
console.log('5. Make sure your google-services.json file is up to date');

// Instructions for fixing developer error
console.log('\n🔧 To fix "Developer Error":');
console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('2. Select your project');
console.log('3. Go to "APIs & Services" > "Credentials"');
console.log('4. Find your OAuth 2.0 Client ID');
console.log('5. Add your package name "com.planttracker" to the authorized package names');
console.log('6. Add your SHA-1 fingerprint (get it from your keystore)');
console.log('7. Make sure "Google Sign-In API" is enabled in "APIs & Services" > "Library"');

console.log('\n📝 Next Steps:');
console.log('1. Check the console logs above for any missing configurations');
console.log('2. Verify your Google Cloud Console settings match your app config');
console.log('3. Rebuild and test the app');
console.log('4. If issues persist, check the Android logcat for detailed error messages');

console.log('\n🔍 To get SHA-1 fingerprint for debug builds:');
console.log('keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android');

console.log('\n🔍 To get SHA-1 fingerprint for release builds:');
console.log('keytool -list -v -keystore your-release-key.keystore -alias your-key-alias');
