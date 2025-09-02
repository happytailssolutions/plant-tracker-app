import crashlytics from '@react-native-firebase/crashlytics';
import Constants from 'expo-constants';

class Logger {
  private static instance: Logger;
  
  private constructor() {
    // Initialize crashlytics
    this.initCrashlytics();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async initCrashlytics() {
    try {
      // Enable crashlytics immediately
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Set basic app info
      crashlytics().setCustomKey('app_version', '1.0.0');
      crashlytics().setCustomKey('build_type', __DEV__ ? 'debug' : 'release');
      crashlytics().setCustomKey('platform', 'android');
      
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
        try {
          crashlytics().setCustomKey(key, value || 'undefined');
        } catch (setKeyError) {
          if (__DEV__) {
            console.error(`Failed to set custom key ${key}:`, setKeyError);
          }
        }
      });
      
      this.log('Crashlytics initialized successfully');
    } catch (error) {
      // If crashlytics fails to initialize, log it but don't crash the app
      console.error('Failed to initialize Crashlytics:', error);
    }
  }

  public log(message: string, error?: any) {
    // Always log to console for debugging
    console.log(`[Logger] ${message}`);
    if (error) console.error(`[Logger Error]`, error);

    try {
      // Always log to crashlytics
      crashlytics().log(`${new Date().toISOString()}: ${message}`);
      
      if (error) {
        // Log error with additional context
        crashlytics().recordError(error, message);
      }
    } catch (crashlyticsError) {
      // If crashlytics fails, always log to console
      console.error('Crashlytics logging failed:', crashlyticsError);
    }
  }

  public setUser(userId: string) {
    try {
      crashlytics().setUserId(userId);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to set user in Crashlytics:', error);
      }
    }
  }

  public setCustomKey(key: string, value: string | number | boolean) {
    try {
      crashlytics().setCustomKey(key, value);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to set custom key in Crashlytics:', error);
      }
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
      // Set additional context
      if (context) {
        crashlytics().setCustomKey('error_context', context);
      }
      
      // Set timestamp
      crashlytics().setCustomKey('error_timestamp', new Date().toISOString());

      // Log the full error
      crashlytics().recordError(error);
      
      // Also log as a regular log entry
      crashlytics().log(`ERROR: ${errorMessage} | Context: ${context || 'none'}`);
      
      console.log('[Logger] Error successfully logged to Crashlytics');
    } catch (crashlyticsError) {
      console.error('Failed to log error to Crashlytics:', crashlyticsError);
    }
  }

  public logNavigation(screenName: string) {
    this.log(`Navigation: ${screenName}`);
    try {
      crashlytics().setCustomKey('current_screen', screenName);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to set navigation in Crashlytics:', error);
      }
    }
  }

  public logGraphQLError(operation: string, error: any) {
    this.logError(error, `GraphQL Operation: ${operation}`);
    try {
      crashlytics().setCustomKey('last_failed_graphql_operation', operation);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to set GraphQL error in Crashlytics:', error);
      }
    }
  }

  // Test function to verify Crashlytics is working
  public testCrashlytics() {
    this.log('Testing Crashlytics integration');
    crashlytics().setCustomKey('test_key', 'test_value');
    
    // Force a test crash (only in development)
    if (__DEV__) {
      this.log('Crashlytics test - this will cause a crash in development');
      // Uncomment the line below to test crash reporting
      // crashlytics().crash();
    }
  }
}

export const logger = Logger.getInstance();