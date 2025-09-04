#!/usr/bin/env node

/**
 * Simple test script to verify Crashlytics setup
 * Run with: node test-crashlytics.js
 */

console.log('🔍 Crashlytics Setup Verification');
console.log('================================\n');

const fs = require('fs');
const path = require('path');

// Check required files
const requiredFiles = [
  'google-services.json',
  'android/app/google-services.json',
  'src/utils/logger.ts',
  'src/components/CrashlyticsTest.tsx',
  'src/utils/firebaseInit.ts'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log();

// Check package.json dependencies
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics'
  ];
  
  requiredDeps.forEach(dep => {
    const exists = deps[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep} ${exists ? `(${exists})` : ''}`);
  });
} catch (error) {
  console.log('  ❌ Could not read package.json');
}

console.log();

// Check app.config.js
console.log('⚙️ Checking app configuration...');
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
  
  console.log(`  ${hasFirebaseApp ? '✅' : '❌'} Firebase App plugin configured`);
  console.log(`  ${hasCrashlytics ? '✅' : '❌'} Crashlytics plugin configured`);
  
  const hasGoogleServices = appConfig.expo?.android?.googleServicesFile;
  console.log(`  ${hasGoogleServices ? '✅' : '❌'} Google Services file configured`);
  
} catch (error) {
  console.log('  ❌ Could not read app.config.js');
}

console.log();

// Summary
console.log('📋 Summary');
console.log('----------');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('🚀 You can now test the Crashlytics functionality');
  console.log();
  console.log('Next steps:');
  console.log('1. Run: npm start or expo start');
  console.log('2. Navigate to Map screen → Test Crashlytics button');
  console.log('3. Test all three buttons and check console logs');
  console.log('4. Check Firebase Crashlytics dashboard for events');
} else {
  console.log('❌ Some required files are missing');
  console.log('Please ensure all files are properly set up before testing');
}

console.log();
console.log('📖 For detailed instructions, see: CRASHLYTICS_DEBUG_GUIDE.md');
