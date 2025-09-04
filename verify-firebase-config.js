#!/usr/bin/env node

/**
 * Firebase Configuration Verification Script
 * Run with: node verify-firebase-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Configuration Verification');
console.log('=====================================\n');

// Check google-services.json
const googleServicesPath = 'google-services.json';
const androidGoogleServicesPath = 'android/app/google-services.json';

console.log('📄 Checking google-services.json files...');

[googleServicesPath, androidGoogleServicesPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const projectId = content.project_info?.project_id;
      const packageName = content.client?.[0]?.client_info?.android_client_info?.package_name;
      
      console.log(`  ✅ ${filePath}`);
      console.log(`     Project ID: ${projectId}`);
      console.log(`     Package: ${packageName}`);
    } catch (error) {
      console.log(`  ❌ ${filePath} - Invalid JSON: ${error.message}`);
    }
  } else {
    console.log(`  ❌ ${filePath} - File not found`);
  }
});

console.log();

// Check AndroidManifest.xml for debug mode
console.log('🤖 Checking AndroidManifest.xml...');
const manifestPath = 'android/app/src/main/AndroidManifest.xml';

if (fs.existsSync(manifestPath)) {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const hasDebugMode = manifestContent.includes('firebase_crashlytics_debug_mode');
  
  console.log(`  ✅ AndroidManifest.xml exists`);
  console.log(`  ${hasDebugMode ? '✅' : '❌'} Debug mode enabled: ${hasDebugMode}`);
  
  if (hasDebugMode) {
    const debugValue = manifestContent.match(/firebase_crashlytics_debug_mode.*?value="([^"]+)"/)?.[1];
    console.log(`     Debug value: ${debugValue}`);
  }
} else {
  console.log(`  ❌ AndroidManifest.xml not found`);
}

console.log();

// Check app.config.js
console.log('⚙️ Checking app.config.js...');
if (fs.existsSync('app.config.js')) {
  try {
    const appConfig = require('./app.config.js');
    const plugins = appConfig.expo?.plugins || [];
    
    const hasFirebaseApp = plugins.some(p => 
      p === '@react-native-firebase/app' || 
      (Array.isArray(p) && p[0] === '@react-native-firebase/app')
    );
    
    const hasCrashlytics = plugins.some(p => 
      p === '@react-native-firebase/crashlytics' || 
      (Array.isArray(p) && p[0] === '@react-native-firebase/crashlytics')
    );
    
    console.log(`  ✅ app.config.js exists`);
    console.log(`  ${hasFirebaseApp ? '✅' : '❌'} Firebase App plugin: ${hasFirebaseApp}`);
    console.log(`  ${hasCrashlytics ? '✅' : '❌'} Crashlytics plugin: ${hasCrashlytics}`);
    
    const googleServicesFile = appConfig.expo?.android?.googleServicesFile;
    console.log(`  ${googleServicesFile ? '✅' : '❌'} Google Services file configured: ${googleServicesFile || 'No'}`);
    
  } catch (error) {
    console.log(`  ❌ app.config.js - Error: ${error.message}`);
  }
} else {
  console.log(`  ❌ app.config.js not found`);
}

console.log();

// Summary
console.log('📋 Summary & Recommendations');
console.log('----------------------------');
console.log('1. ✅ Crashlytics initialization is working (from your logs)');
console.log('2. ✅ Events are being logged successfully');
console.log('3. 🔄 Dashboard visibility issue - try these steps:');
console.log('   a) Run your production build script');
console.log('   b) Use the new "Force Upload Reports" button in the test interface');
console.log('   c) Wait 2-5 minutes after forcing upload');
console.log('   d) Check Firebase console for any project-level issues');
console.log();
console.log('🚀 Next Steps:');
console.log('1. Build and install the production APK');
console.log('2. Test all Crashlytics buttons');
console.log('3. Use "Force Upload Reports" button');
console.log('4. Check dashboard in 2-5 minutes');
console.log();
console.log('💡 If still no events appear, check:');
console.log('   - Firebase project has Crashlytics enabled');
console.log('   - App package name matches Firebase project');
console.log('   - No network/firewall blocking Firebase endpoints');


