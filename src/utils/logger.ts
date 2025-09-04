import Constants from 'expo-constants';
import { 
  initializeCrashlyticsWrapper, 
  safeCrashlyticsLog, 
  safeCrashlyticsError, 
  safeCrashlyticsSetCustomKey, 
  isCrashlyticsAvailable,
  getCrashlyticsStatus
} from './crashlyticsWrapper';

class Logger {
  private static instance: Logger;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  
  private constructor() {
    // Initialize crashlytics
    this.initializationPromise = this.initCrashlytics();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async initCrashlytics(): Promise<void> {
    try {
      console.log('[Logger] Starting Crashlytics initialization...');
      
      // Use the wrapper to initialize
      const success = await initializeCrashlyticsWrapper();
      
      if (!success) {
        throw new Error('CrashlyticsWrapper initialization failed');
      }
      
      // Log the status
      const status = getCrashlyticsStatus();
      console.log('[Logger] Crashlytics status:', status);
      
      // Set basic app info
      safeCrashlyticsSetCustomKey('app_version', '1.0.0');
      safeCrashlyticsSetCustomKey('build_type', __DEV__ ? 'debug' : 'release');
      safeCrashlyticsSetCustomKey('platform', 'android');
      safeCrashlyticsSetCustomKey('initialization_timestamp', new Date().toISOString());
      
      // Log all environment variables
      const envVars = {
        GRAPHQL_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_GRAPHQL_URL,
        SUPABASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        APP_VARIANT: __DEV__ ? 'development' : 'production'
      };

      // Log environment configuration
      Object.entries(envVars).forEach(([key, value]) => {
        safeCrashlyticsSetCustomKey(key, value || 'undefined');
      });
      
      // Send a test log to verify it's working
      safeCrashlyticsLog('Logger initialized successfully');
      
      // Mark as initialized
      this.isInitialized = true;
      console.log('[Logger] Crashlytics initialized successfully');
      
    } catch (error) {
      // If crashlytics fails to initialize, log it but don't crash the app
      console.error('[Logger] Failed to initialize Crashlytics:', error);
      this.isInitialized = false;
    }
  }

  // Ensure Crashlytics is initialized before any operation
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  public async log(message: string, error?: any) {
    // Always log to console for debugging
    console.log(`[Logger] ${message}`);
    if (error) console.error(`[Logger Error]`, error);

    try {
      // Ensure Crashlytics is initialized before logging
      await this.ensureInitialized();
      
      if (!this.isInitialized || !isCrashlyticsAvailable()) {
        console.warn('[Logger] Crashlytics not initialized, skipping log');
        return;
      }

      // Log to crashlytics using wrapper
      safeCrashlyticsLog(message);
      
      if (error) {
        // Log error with additional context
        safeCrashlyticsError(error, message);
      }
    } catch (crashlyticsError) {
      // If crashlytics fails, always log to console
      console.error('[Logger] Crashlytics logging failed:', crashlyticsError);
    }
  }

  public async setUser(userId: string) {
    try {
      await this.ensureInitialized();
      if (this.isInitialized && isCrashlyticsAvailable()) {
        // Note: setUserId might not be available in wrapper, use setCustomKey instead
        safeCrashlyticsSetCustomKey('user_id', userId);
      }
    } catch (error) {
      console.error('[Logger] Failed to set user in Crashlytics:', error);
    }
  }

  public async setCustomKey(key: string, value: string | number | boolean) {
    try {
      await this.ensureInitialized();
      if (this.isInitialized && isCrashlyticsAvailable()) {
        safeCrashlyticsSetCustomKey(key, value);
      }
    } catch (error) {
      console.error('[Logger] Failed to set custom key in Crashlytics:', error);
    }
  }

  public async logError(error: any, context?: string) {
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || '';
    
    // Always log errors to console
    console.error(`[Logger Error] ${errorMessage}`);
    console.error(`[Logger Stack]`, errorStack);
    if (context) console.error(`[Logger Context]`, context);

    try {
      // Ensure Crashlytics is initialized
      await this.ensureInitialized();
      
      if (!this.isInitialized || !isCrashlyticsAvailable()) {
        console.warn('[Logger] Crashlytics not initialized, skipping error log');
        return;
      }

      // Set additional context
      if (context) {
        safeCrashlyticsSetCustomKey('error_context', context);
      }
      
      // Set timestamp
      safeCrashlyticsSetCustomKey('error_timestamp', new Date().toISOString());

      // Log the full error
      safeCrashlyticsError(error, context);
      
      console.log('[Logger] Error successfully logged to Crashlytics');
    } catch (crashlyticsError) {
      console.error('[Logger] Failed to log error to Crashlytics:', crashlyticsError);
    }
  }

  public async logNavigation(screenName: string) {
    await this.log(`Navigation: ${screenName}`);
    try {
      await this.ensureInitialized();
      if (this.isInitialized && isCrashlyticsAvailable()) {
        safeCrashlyticsSetCustomKey('current_screen', screenName);
      }
    } catch (error) {
      console.error('[Logger] Failed to set navigation in Crashlytics:', error);
    }
  }

  public async logGraphQLError(operation: string, error: any) {
    await this.logError(error, `GraphQL Operation: ${operation}`);
    try {
      await this.ensureInitialized();
      if (this.isInitialized && isCrashlyticsAvailable()) {
        safeCrashlyticsSetCustomKey('last_failed_graphql_operation', operation);
      }
    } catch (error) {
      console.error('[Logger] Failed to set GraphQL error in Crashlytics:', error);
    }
  }



  // Get initialization status
  public getInitializationStatus(): { isInitialized: boolean; promise: Promise<void> | null; crashlyticsAvailable: boolean; crashlyticsStatus: any } {
    return {
      isInitialized: this.isInitialized,
      promise: this.initializationPromise,
      crashlyticsAvailable: isCrashlyticsAvailable(),
      crashlyticsStatus: getCrashlyticsStatus()
    };
  }
}

export const logger = Logger.getInstance();