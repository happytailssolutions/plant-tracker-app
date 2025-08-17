// Conditional exports for services based on environment
const isDevelopment = process.env.NODE_ENV === 'development' || (typeof __DEV__ !== 'undefined' && __DEV__);

if (isDevelopment) {
  // Import development versions that don't use native modules
  export { notificationService } from './notificationService.dev';
  export { backgroundTaskService } from './backgroundTaskService.dev';
} else {
  // Import production versions with full native module support
  export { notificationService } from './notificationService';
  export { backgroundTaskService } from './backgroundTaskService';
}

// App initialization service can be exported normally
export { appInitializationService } from './appInitializationService';
