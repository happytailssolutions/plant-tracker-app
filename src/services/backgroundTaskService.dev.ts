// Development-only background task service that doesn't use native modules

export class BackgroundTaskService {
  private static instance: BackgroundTaskService;
  private isRegistered = false;

  private constructor() {}

  static getInstance(): BackgroundTaskService {
    if (!BackgroundTaskService.instance) {
      BackgroundTaskService.instance = new BackgroundTaskService();
    }
    return BackgroundTaskService.instance;
  }

  async registerBackgroundFetch(): Promise<boolean> {
    console.log('[DEV] Background fetch registration skipped in development');
    this.isRegistered = true;
    return true;
  }

  async unregisterBackgroundFetch(): Promise<void> {
    console.log('[DEV] Background fetch unregistration skipped in development');
    this.isRegistered = false;
  }

  async getBackgroundFetchStatus(): Promise<any> {
    console.log('[DEV] Background fetch status check skipped in development');
    return 'available';
  }

  async isBackgroundFetchAvailable(): Promise<boolean> {
    console.log('[DEV] Background fetch availability check - returning true for development');
    return true;
  }

  async triggerBackgroundTask(): Promise<void> {
    console.log('[DEV] Background task trigger skipped in development');
  }
}

export const backgroundTaskService = BackgroundTaskService.getInstance();
