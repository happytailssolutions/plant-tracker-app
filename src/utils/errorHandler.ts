import { logger } from './logger';

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  try {
    // Handle unhandled promise rejections
    const originalHandler = global.ErrorUtils?.setGlobalHandler;
    
    if (originalHandler) {
      originalHandler((error: Error, isFatal?: boolean) => {
        try {
          logger.logError(error, `Global error handler - Fatal: ${isFatal}`);
          
          // Log additional context
          logger.setCustomKey('error_fatal', isFatal || false);
          logger.setCustomKey('error_timestamp', new Date().toISOString());
        } catch (loggerError) {
          // If logger fails, just log to console
          console.error('Global error handler failed:', loggerError);
        }
        
        // In development, still show the error
        if (__DEV__) {
          console.error('Global error:', error);
          console.error('Is fatal:', isFatal);
        }
      });
    }

    // Handle unhandled promise rejections
    const originalUnhandledRejectionHandler = global.onunhandledrejection;
    
    global.onunhandledrejection = (event: any) => {
      try {
        logger.logError(
          new Error(`Unhandled promise rejection: ${event.reason}`),
          'Unhandled promise rejection'
        );
      } catch (loggerError) {
        console.error('Failed to log unhandled rejection:', loggerError);
      }
      
      // Call original handler if it exists
      if (originalUnhandledRejectionHandler) {
        originalUnhandledRejectionHandler(event);
      }
    };
  } catch (error) {
    console.error('Failed to setup global error handling:', error);
  }
};
