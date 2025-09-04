# Crashlytics Debugging Guide

## Overview
This guide explains the Crashlytics debugging fixes implemented and how to test them.

## Issues Fixed

### 1. **Initialization Race Conditions**
- **Problem**: Logger methods were being called before Crashlytics was fully initialized
- **Solution**: Added async initialization with proper waiting mechanisms
- **Files Modified**: `src/utils/logger.ts`, `app/_layout.tsx`, `src/utils/firebaseInit.ts`

### 2. **Missing Firebase Setup**
- **Problem**: Firebase wasn't being explicitly initialized early in the app lifecycle
- **Solution**: Created `firebaseInit.ts` and integrated it into app startup
- **Files Modified**: `src/utils/firebaseInit.ts`, `app/_layout.tsx`

### 3. **Test Button Improvements**
- **Problem**: Test buttons didn't provide feedback or handle initialization status
- **Solution**: Enhanced CrashlyticsTest component with status indicators and async handling
- **Files Modified**: `src/components/CrashlyticsTest.tsx`

## How to Test

### Step 1: Check Console Logs
1. Open the app and check the console/logs
2. Look for these initialization messages:
   ```
   [App] Starting app initialization...
   [Firebase] Starting Firebase initialization...
   [Firebase] Crashlytics collection enabled: true
   [Logger] Starting Crashlytics initialization...
   [Logger] Crashlytics initialized successfully
   [App] App initialization completed
   ```

### Step 2: Test the Crashlytics Interface
1. Navigate to the Map screen (Explore tab)
2. Tap the "🧪 Test Crashlytics" button in the top right
3. You should see:
   - **Crashlytics Status**: Should show "✅ Initialized"
   - All three test buttons should be enabled (not grayed out)

### Step 3: Test Each Button

#### Test Logging Button
1. Tap "Test Logging"
2. Should see:
   - Loading indicator briefly
   - Success alert: "Test log sent to Crashlytics!"
   - Console logs showing the test was executed

#### Test Error Button
1. Tap "Test Error"
2. Should see:
   - Loading indicator briefly
   - Success alert: "Test error sent to Crashlytics!"
   - Console logs showing the error was logged

#### Test Crash Button
1. Tap "Test Crash"
2. Confirm the crash in the alert dialog
3. App should crash after 1 second
4. When restarted, the crash should appear in Firebase Crashlytics dashboard

## Checking Firebase Crashlytics Dashboard

### For Development Builds
- Crashes from development builds may take 5-10 minutes to appear
- Logs and non-fatal errors appear faster (1-2 minutes)
- Enable debug mode for faster reporting (see below)

### For Production Builds
- All events should appear within 1-2 minutes
- More reliable reporting than debug builds

## Enable Debug Mode (Optional)

To get faster crash reporting in development, you can enable debug mode:

1. In Android Studio or via ADB:
   ```bash
   adb shell setprop debug.firebase.crashlytics.debug_mode true
   ```

2. Or add to your build configuration (temporary):
   ```xml
   <!-- In android/app/src/main/AndroidManifest.xml -->
   <meta-data
       android:name="firebase_crashlytics_debug_mode"
       android:value="true" />
   ```

## Troubleshooting

### If Buttons Are Still Disabled
1. Check console for initialization errors
2. Verify `google-services.json` is in the correct location
3. Ensure Firebase project has Crashlytics enabled
4. Try restarting the app completely

### If Events Don't Appear in Dashboard
1. Check Firebase project configuration
2. Verify app package name matches Firebase project
3. Wait 5-10 minutes for development builds
4. Check Firebase Crashlytics is enabled in the Firebase console

### If App Crashes on Startup
1. Check console for Firebase initialization errors
2. Verify all Firebase dependencies are correctly installed
3. Check that `@react-native-firebase/app` and `@react-native-firebase/crashlytics` are properly linked

## Key Code Changes

### Logger Class (`src/utils/logger.ts`)
- Added async initialization with Promise handling
- All methods now wait for initialization before executing
- Added status checking methods
- Enhanced error handling and console logging

### CrashlyticsTest Component (`src/components/CrashlyticsTest.tsx`)
- Added initialization status display
- Made all test methods async
- Added loading states and better user feedback
- Enhanced error handling with detailed console logs

### App Layout (`app/_layout.tsx`)
- Added Firebase initialization on app startup
- Made logger calls async to prevent race conditions
- Enhanced error handling during initialization

### Firebase Initialization (`src/utils/firebaseInit.ts`)
- New utility to ensure Firebase is properly initialized
- Platform checking and error handling
- Auto-initialization when module is imported

## Expected Behavior After Fixes

1. **App Startup**: Clean initialization with proper logging
2. **Test Interface**: Status indicator shows initialization state
3. **Test Buttons**: All work reliably with proper feedback
4. **Crashlytics Dashboard**: Events appear within expected timeframes
5. **Console Logs**: Detailed logging for debugging purposes

## Additional Notes

- The app now initializes Firebase before any Crashlytics operations
- All logger methods are async and wait for proper initialization
- Test buttons provide immediate feedback and detailed console logging
- The system gracefully handles initialization failures
- Development vs production builds may have different reporting speeds

## Next Steps

If issues persist after these fixes:
1. Check Firebase project configuration
2. Verify all dependencies are up to date
3. Test with a production build
4. Check Firebase console for any project-level issues
