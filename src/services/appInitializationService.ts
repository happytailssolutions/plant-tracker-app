import { notificationService, backgroundTaskService } from './';
import { useRemindersStore } from '../state/remindersStore';

export class AppInitializationService {
  private static instance: AppInitializationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AppInitializationService {
    if (!AppInitializationService.instance) {
      AppInitializationService.instance = new AppInitializationService();
    }
    return AppInitializationService.instance;
  }

  /**
   * Initialize all app services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('App services already initialized');
      return;
    }

    try {
      console.log('Initializing app services...');

      // Initialize notifications
      await this.initializeNotifications();

      // Initialize background tasks
      await this.initializeBackgroundTasks();

      // Set up notification handlers
      this.setupNotificationHandlers();

      this.isInitialized = true;
      console.log('App services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app services:', error);
      throw error;
    }
  }

  /**
   * Initialize notification service
   */
  private async initializeNotifications(): Promise<void> {
    console.log('Initializing notifications...');
    
    const token = await notificationService.initialize();
    
    if (token) {
      console.log('Notifications initialized with token:', token);
      // Here you could send the token to your backend if needed
    } else {
      console.log('Notifications not available on this device');
    }
  }

  /**
   * Initialize background task service
   */
  private async initializeBackgroundTasks(): Promise<void> {
    console.log('Initializing background tasks...');
    
    const isAvailable = await backgroundTaskService.isBackgroundFetchAvailable();
    
    if (isAvailable) {
      const success = await backgroundTaskService.registerBackgroundFetch();
      if (success) {
        console.log('Background tasks initialized successfully');
      } else {
        console.log('Failed to register background tasks');
      }
    } else {
      console.log('Background fetch not available on this device');
    }
  }

  /**
   * Set up notification event handlers
   */
  private setupNotificationHandlers(): void {
    console.log('Setting up notification handlers...');

    // Handle notifications received while app is in foreground
    notificationService.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
      
      // You could show an in-app notification or update the UI here
      const data = notification.request.content.data;
      
      if (data?.type === 'reminder') {
        // Handle reminder notification
        this.handleReminderNotification(data);
      } else if (data?.type === 'overdue') {
        // Handle overdue notification
        this.handleOverdueNotification(data);
      }
    });

    // Handle notification responses (user tapped on notification)
    notificationService.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response received:', response);
      
      const data = response.notification.request.content.data;
      
      if (data?.type === 'reminder' || data?.type === 'overdue') {
        // Navigate to the specific plant or reminder
        this.handleNotificationTap(data);
      }
    });
  }

  /**
   * Handle reminder notification received
   */
  private handleReminderNotification(data: any): void {
    console.log('Handling reminder notification:', data);
    
    // You could update the reminders store or show an in-app alert
    // For now, just log it
  }

  /**
   * Handle overdue notification received
   */
  private handleOverdueNotification(data: any): void {
    console.log('Handling overdue notification:', data);
    
    // You could show a more urgent in-app notification
    // For now, just log it
  }

  /**
   * Handle notification tap (user opened the app from notification)
   */
  private handleNotificationTap(data: any): void {
    console.log('Handling notification tap:', data);
    
    // Here you would navigate to the specific plant or reminder
    // This would typically involve using your navigation service
    
    if (data.plantId) {
      console.log(`Should navigate to plant: ${data.plantId}`);
      // Example: navigationService.navigate('PlantDetails', { plantId: data.plantId });
    }
    
    if (data.reminderId) {
      console.log(`Should highlight reminder: ${data.reminderId}`);
      // You could also highlight the specific reminder in the UI
    }
  }

  /**
   * Cleanup services (call this when app is closing)
   */
  async cleanup(): Promise<void> {
    try {
      console.log('Cleaning up app services...');
      
      // Unregister background tasks
      await backgroundTaskService.unregisterBackgroundFetch();
      
      // Clear any remaining notifications
      await notificationService.clearAllNotifications();
      
      this.isInitialized = false;
      console.log('App services cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup app services:', error);
    }
  }

  /**
   * Check if services are initialized
   */
  isServicesInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Manually trigger background task (for testing)
   */
  async triggerBackgroundCheck(): Promise<void> {
    if (this.isInitialized) {
      await backgroundTaskService.triggerBackgroundTask();
    } else {
      console.log('Services not initialized yet');
    }
  }
}

// Export singleton instance
export const appInitializationService = AppInitializationService.getInstance();
