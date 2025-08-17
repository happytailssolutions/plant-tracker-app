import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Check if we're in a development environment
const __DEV__ = process.env.NODE_ENV === 'development';
import { useRemindersStore } from '../state/remindersStore';
import { notificationService } from './notificationService';

const BACKGROUND_FETCH_TASK = 'background-fetch-reminders';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Running background task to check for overdue reminders...');
    
    // Get the reminders store
    const { 
      fetchActiveReminders, 
      markOverdueReminders, 
      reminders 
    } = useRemindersStore.getState();

    // Fetch latest reminders
    await fetchActiveReminders();
    
    // Mark overdue reminders
    markOverdueReminders();
    
    // Get updated reminders after marking overdue
    const updatedReminders = useRemindersStore.getState().reminders;
    
    // Send notifications for newly overdue reminders
    const overdueReminders = updatedReminders.filter(r => r.status === 'OVERDUE');
    
    for (const reminder of overdueReminders) {
      // Only send notifications for WARNING and ALERT types
      if (reminder.notificationType === 'WARNING' || reminder.notificationType === 'ALERT') {
        await notificationService.sendImmediateNotification(
          '⚠️ Overdue Plant Reminder',
          `${reminder.title} was due and needs attention!`,
          {
            reminderId: reminder.id,
            plantId: reminder.plantId,
            type: 'overdue',
          }
        );
      }
    }

    console.log(`Background task completed. Found ${overdueReminders.length} overdue reminders.`);
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

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

  /**
   * Register the background fetch task
   */
  async registerBackgroundFetch(): Promise<boolean> {
    try {
      // In development mode, skip background task registration
      if (__DEV__) {
        console.log('[DEV] Skipping background fetch registration in development');
        this.isRegistered = true;
        return true;
      }

      // Check if already registered
      if (this.isRegistered) {
        console.log('Background fetch already registered');
        return true;
      }

      // Check if task is already registered
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      
      if (!isTaskRegistered) {
        console.log('Registering background fetch task...');
        
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 60 * 60 * 1000, // 1 hour
          stopOnTerminate: false, // Continue running when app is terminated
          startOnBoot: true, // Start when device boots
        });
        
        console.log('Background fetch task registered successfully');
      }

      this.isRegistered = true;
      return true;
    } catch (error) {
      console.error('Failed to register background fetch:', error);
      // In development, don't fail
      if (__DEV__) {
        console.log('[DEV] Background fetch failed, but continuing in development mode');
        this.isRegistered = true;
        return true;
      }
      return false;
    }
  }

  /**
   * Unregister the background fetch task
   */
  async unregisterBackgroundFetch(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      this.isRegistered = false;
      console.log('Background fetch task unregistered');
    } catch (error) {
      console.error('Failed to unregister background fetch:', error);
    }
  }

  /**
   * Get background fetch status
   */
  async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    return await BackgroundFetch.getStatusAsync();
  }

  /**
   * Check if background fetch is available
   */
  async isBackgroundFetchAvailable(): Promise<boolean> {
    const status = await this.getBackgroundFetchStatus();
    return status === BackgroundFetch.BackgroundFetchStatus.Available;
  }

  /**
   * Manually trigger the background task (for testing)
   */
  async triggerBackgroundTask(): Promise<void> {
    try {
      console.log('Manually triggering background task...');
      await TaskManager.startTaskAsync(BACKGROUND_FETCH_TASK, {});
    } catch (error) {
      console.error('Failed to trigger background task:', error);
    }
  }
}

// Export singleton instance
export const backgroundTaskService = BackgroundTaskService.getInstance();
