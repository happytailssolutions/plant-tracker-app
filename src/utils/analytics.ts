import { logger } from './logger';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Analytics utility for production Crashlytics monitoring
export class Analytics {
  private static instance: Analytics;
  private sessionStartTime: number;
  private userJourney: string[] = [];
  private featureUsage: Record<string, number> = {};

  private constructor() {
    this.sessionStartTime = Date.now();
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  // A. Critical User Journey Monitoring
  public async trackUserJourney(screenName: string, action?: string) {
    const journey = action ? `${screenName}:${action}` : screenName;
    this.userJourney.push(journey);
    
    await logger.logNavigation(screenName);
    await logger.setCustomKey('current_screen', screenName);
    await logger.setCustomKey('user_journey', this.userJourney.join(' > '));
    await logger.setCustomKey('journey_step_count', this.userJourney.length);
    
    if (action) {
      await logger.setCustomKey('current_action', action);
    }
  }

  public async trackScreenLoad(screenName: string, loadTime?: number) {
    await this.trackUserJourney(screenName, 'loaded');
    await logger.setCustomKey('screen_load_time', loadTime || Date.now());
    await logger.setCustomKey('screen_name', screenName);
  }

  // B. Authentication Flow Monitoring
  public async trackAuthEvent(event: string, success: boolean, metadata?: Record<string, any>) {
    await logger.log(`Auth event: ${event} - ${success ? 'success' : 'failed'}`);
    await logger.setCustomKey('auth_event', event);
    await logger.setCustomKey('auth_success', success);
    await logger.setCustomKey('auth_timestamp', new Date().toISOString());
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        logger.setCustomKey(`auth_${key}`, value);
      });
    }
  }

  public async trackLoginAttempt(method: string, success: boolean, errorCode?: string) {
    await this.trackAuthEvent('login_attempt', success, {
      method,
      error_code: errorCode,
      attempt_count: this.getFeatureUsageCount('login_attempt') + 1
    });
    this.incrementFeatureUsage('login_attempt');
  }

  // C. API Performance & Error Tracking
  public async trackAPIOperation(operationName: string, duration: number, success: boolean, error?: any) {
    await logger.log(`API operation: ${operationName} - ${success ? 'success' : 'failed'} - ${duration}ms`);
    await logger.setCustomKey('api_operation', operationName);
    await logger.setCustomKey('api_duration', duration);
    await logger.setCustomKey('api_success', success);
    await logger.setCustomKey('api_timestamp', new Date().toISOString());

    if (!success && error) {
      await logger.logError(error, `API Error: ${operationName}`);
      await logger.setCustomKey('api_error_type', error.name || 'unknown');
      await logger.setCustomKey('api_error_message', error.message || 'unknown error');
    }

    // Track slow operations
    if (duration > 5000) {
      await logger.log(`Slow API operation: ${operationName} took ${duration}ms`);
      await logger.setCustomKey('slow_operation', operationName);
      await logger.setCustomKey('operation_duration', duration);
    }
  }

  public async trackGraphQLError(operationName: string, error: any) {
    await logger.logError(error, `GraphQL Error: ${operationName}`);
    await logger.setCustomKey('graphql_operation', operationName);
    await logger.setCustomKey('graphql_error_type', error.name || 'unknown');
    await logger.setCustomKey('graphql_error_message', error.message || 'unknown error');
    await logger.setCustomKey('graphql_timestamp', new Date().toISOString());
  }

  // D. Feature Usage Analytics
  public async trackFeatureUsage(featureName: string, action: string, metadata?: Record<string, any>) {
    const usageKey = `${featureName}_${action}`;
    this.incrementFeatureUsage(usageKey);
    
    await logger.log(`Feature used: ${featureName} - ${action}`);
    await logger.setCustomKey('feature_name', featureName);
    await logger.setCustomKey('feature_action', action);
    await logger.setCustomKey('feature_usage_count', this.getFeatureUsageCount(usageKey));
    await logger.setCustomKey('feature_usage_time', new Date().toISOString());
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        logger.setCustomKey(`feature_${key}`, value);
      });
    }
  }

  public async trackPinCreation(pinType: string, hasPhotos: boolean, location?: { latitude: number; longitude: number }) {
    await this.trackFeatureUsage('pin_creation', 'completed', {
      pin_type: pinType,
      has_photos: hasPhotos,
      latitude: location?.latitude,
      longitude: location?.longitude
    });
  }

  public async trackImageUpload(success: boolean, retryCount: number, fileSize?: number) {
    await this.trackFeatureUsage('image_upload', success ? 'completed' : 'failed', {
      retry_count: retryCount,
      file_size: fileSize
    });
  }

  // E. Advanced Analytics
  public async trackUserBehavior(action: string, metadata?: Record<string, any>) {
    await logger.log(`User behavior: ${action}`);
    await logger.setCustomKey('user_action', action);
    await logger.setCustomKey('action_timestamp', new Date().toISOString());
    await logger.setCustomKey('session_duration', Date.now() - this.sessionStartTime);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        logger.setCustomKey(`behavior_${key}`, value);
      });
    }
  }

  public async trackPerformanceMetric(metricName: string, value: number, unit: string = 'ms') {
    await logger.log(`Performance: ${metricName} = ${value}${unit}`);
    await logger.setCustomKey(`perf_${metricName}`, value);
    await logger.setCustomKey(`perf_${metricName}_unit`, unit);
    await logger.setCustomKey('perf_timestamp', new Date().toISOString());
  }

  // Error Categorization
  public async categorizeError(error: Error, context: string) {
    const category = this.determineErrorCategory(error, context);
    
    await logger.setCustomKey('error_category', category);
    await logger.setCustomKey('error_context', context);
    await logger.setCustomKey('error_name', error.name);
    await logger.setCustomKey('error_message', error.message);
    await logger.setCustomKey('error_timestamp', new Date().toISOString());
    
    await logger.logError(error, context);
  }

  private determineErrorCategory(error: Error, context: string): string {
    const message = error.message.toLowerCase();
    const contextLower = context.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return 'authentication';
    }
    if (message.includes('upload') || message.includes('file') || message.includes('image')) {
      return 'file_upload';
    }
    if (message.includes('graphql') || message.includes('query') || message.includes('mutation')) {
      return 'api';
    }
    if (message.includes('location') || message.includes('gps')) {
      return 'location';
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'permissions';
    }
    if (contextLower.includes('map') || contextLower.includes('pin')) {
      return 'map_interaction';
    }
    
    return 'unknown';
  }

  // Key Metrics Tracking
  public async trackAppMetrics() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    await logger.setCustomKey('app_version', Constants.expoConfig?.version || '1.0.0');
    await logger.setCustomKey('device_platform', Platform.OS);
    await logger.setCustomKey('device_model', Device.modelName || 'unknown');
    await logger.setCustomKey('session_duration', sessionDuration);
    await logger.setCustomKey('feature_usage_total', Object.values(this.featureUsage).reduce((a, b) => a + b, 0));
    await logger.setCustomKey('journey_completed', this.userJourney.length > 0);
  }

  // Utility methods
  private incrementFeatureUsage(key: string) {
    this.featureUsage[key] = (this.featureUsage[key] || 0) + 1;
  }

  private getFeatureUsageCount(key: string): number {
    return this.featureUsage[key] || 0;
  }

  // Session management
  public async endSession() {
    await this.trackAppMetrics();
    await logger.log('Session ended');
    await logger.setCustomKey('session_ended', true);
    await logger.setCustomKey('final_session_duration', Date.now() - this.sessionStartTime);
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Convenience functions for common operations
export const trackOperation = async <T>(
  operationName: string, 
  operation: () => Promise<T>,
  context?: string
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    await analytics.trackAPIOperation(operationName, duration, true);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    await analytics.trackAPIOperation(operationName, duration, false, error);
    if (context) {
      await analytics.categorizeError(error as Error, context);
    }
    throw error;
  }
};
