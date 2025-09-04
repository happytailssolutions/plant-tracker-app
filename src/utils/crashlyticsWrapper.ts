/**
 * Crashlytics wrapper to handle version differences and method availability
 */

let crashlyticsModule: any = null;
let crashlyticsInstance: any = null;

/**
 * Initialize the Crashlytics wrapper
 */
export const initializeCrashlyticsWrapper = async (): Promise<boolean> => {
  try {
    console.log('[CrashlyticsWrapper] Initializing Crashlytics wrapper...');
    
    // Import the module
    crashlyticsModule = await import('@react-native-firebase/crashlytics');
    console.log('[CrashlyticsWrapper] Module imported successfully');
    
    // Get the default export
    const crashlytics = crashlyticsModule.default;
    if (typeof crashlytics !== 'function') {
      throw new Error(`Expected crashlytics to be a function, got ${typeof crashlytics}`);
    }
    
    // Create instance
    crashlyticsInstance = crashlytics();
    console.log('[CrashlyticsWrapper] Instance created successfully');
    
    // Test basic functionality by trying to set a test key
    if (typeof crashlyticsInstance.setCustomKey === 'function') {
      crashlyticsInstance.setCustomKey('test_initialization', Date.now());
      console.log('[CrashlyticsWrapper] Test setCustomKey successful');
    }
    
    // Try to enable collection if the method exists
    if (typeof crashlyticsInstance.setCrashlyticsCollectionEnabled === 'function') {
      crashlyticsInstance.setCrashlyticsCollectionEnabled(true);
      console.log('[CrashlyticsWrapper] Collection enabled');
    }
    
    // Test logging
    if (typeof crashlyticsInstance.log === 'function') {
      crashlyticsInstance.log('CrashlyticsWrapper: Initialization successful');
      console.log('[CrashlyticsWrapper] Test log successful');
    }
    
    console.log('[CrashlyticsWrapper] Initialization completed successfully');
    return true;
    
  } catch (error) {
    console.error('[CrashlyticsWrapper] Failed to initialize:', error);
    crashlyticsModule = null;
    crashlyticsInstance = null;
    return false;
  }
};

/**
 * Safe log function
 */
export const safeCrashlyticsLog = (message: string): void => {
  try {
    if (crashlyticsInstance && typeof crashlyticsInstance.log === 'function') {
      crashlyticsInstance.log(`${new Date().toISOString()}: ${message}`);
    } else {
      console.log('[CrashlyticsWrapper] Log skipped - not initialized:', message);
    }
  } catch (error) {
    console.error('[CrashlyticsWrapper] Log failed:', error);
  }
};

/**
 * Safe error logging function
 */
export const safeCrashlyticsError = (error: Error, context?: string): void => {
  try {
    if (crashlyticsInstance && typeof crashlyticsInstance.recordError === 'function') {
      crashlyticsInstance.recordError(error);
      if (context && typeof crashlyticsInstance.log === 'function') {
        crashlyticsInstance.log(`ERROR: ${error.message} | Context: ${context}`);
      }
    } else {
      console.error('[CrashlyticsWrapper] Error log skipped - not initialized:', error.message);
    }
  } catch (logError) {
    console.error('[CrashlyticsWrapper] Error logging failed:', logError);
  }
};

/**
 * Safe custom key setting function
 */
export const safeCrashlyticsSetCustomKey = (key: string, value: string | number | boolean): void => {
  try {
    if (crashlyticsInstance && typeof crashlyticsInstance.setCustomKey === 'function') {
      crashlyticsInstance.setCustomKey(key, value);
    } else {
      console.log('[CrashlyticsWrapper] SetCustomKey skipped - not initialized:', key, value);
    }
  } catch (error) {
    console.error('[CrashlyticsWrapper] SetCustomKey failed:', error);
  }
};

/**
 * Check if Crashlytics is available and initialized
 */
export const isCrashlyticsAvailable = (): boolean => {
  return crashlyticsInstance !== null;
};

/**
 * Force send any unsent reports (useful for testing)
 */
export const forceSendCrashlyticsReports = (): void => {
  try {
    if (crashlyticsInstance && typeof crashlyticsInstance.sendUnsentReports === 'function') {
      crashlyticsInstance.sendUnsentReports();
      console.log('[CrashlyticsWrapper] Forced send of unsent reports');
    } else {
      console.log('[CrashlyticsWrapper] sendUnsentReports not available');
    }
  } catch (error) {
    console.error('[CrashlyticsWrapper] Force send failed:', error);
  }
};

/**
 * Check if there are unsent reports
 */
export const checkUnsentReports = async (): Promise<boolean> => {
  try {
    if (crashlyticsInstance && typeof crashlyticsInstance.checkForUnsentReports === 'function') {
      const hasUnsent = await crashlyticsInstance.checkForUnsentReports();
      console.log('[CrashlyticsWrapper] Has unsent reports:', hasUnsent);
      return hasUnsent;
    } else {
      console.log('[CrashlyticsWrapper] checkForUnsentReports not available');
      return false;
    }
  } catch (error) {
    console.error('[CrashlyticsWrapper] Check unsent reports failed:', error);
    return false;
  }
};

/**
 * Get initialization status
 */
export const getCrashlyticsStatus = () => {
  return {
    moduleLoaded: crashlyticsModule !== null,
    instanceCreated: crashlyticsInstance !== null,
    hasLog: crashlyticsInstance && typeof crashlyticsInstance.log === 'function',
    hasRecordError: crashlyticsInstance && typeof crashlyticsInstance.recordError === 'function',
    hasSetCustomKey: crashlyticsInstance && typeof crashlyticsInstance.setCustomKey === 'function',
    hasSendUnsentReports: crashlyticsInstance && typeof crashlyticsInstance.sendUnsentReports === 'function',
    hasCheckForUnsentReports: crashlyticsInstance && typeof crashlyticsInstance.checkForUnsentReports === 'function',
  };
};
