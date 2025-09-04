import { Platform } from 'react-native';

/**
 * Firebase initialization utility
 * 
 * This file ensures Firebase is properly initialized for the app.
 * React Native Firebase auto-initializes on app start, but we can
 * add additional configuration here if needed.
 */

let isFirebaseInitialized = false;

export const initializeFirebase = async (): Promise<boolean> => {
  try {
    console.log('[Firebase] Starting Firebase initialization...');
    
    // Check if we're on a supported platform
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      console.warn('[Firebase] Firebase is only supported on iOS and Android platforms');
      return false;
    }

    // React Native Firebase auto-initializes, so we just need to verify it's working
    const { default: crashlytics } = await import('@react-native-firebase/crashlytics');
    
    // Test basic functionality (synchronous method)
    const isEnabled = crashlytics().isCrashlyticsCollectionEnabled();
    console.log('[Firebase] Crashlytics collection enabled:', isEnabled);
    
    // Enable crashlytics if not already enabled (synchronous method)
    if (!isEnabled) {
      crashlytics().setCrashlyticsCollectionEnabled(true);
      console.log('[Firebase] Crashlytics collection enabled');
    }
    
    isFirebaseInitialized = true;
    console.log('[Firebase] Firebase initialized successfully');
    
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase:', error);
    isFirebaseInitialized = false;
    return false;
  }
};

export const isFirebaseReady = (): boolean => {
  return isFirebaseInitialized;
};

// Auto-initialize when this module is imported
if (!isFirebaseInitialized) {
  initializeFirebase().catch((error) => {
    console.error('[Firebase] Auto-initialization failed:', error);
  });
}
