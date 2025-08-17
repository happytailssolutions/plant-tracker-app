import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { Reminder } from '../state/remindersStore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notifications and get push token
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      // Get existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      console.log('Push notification token:', token);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Plant Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
          sound: true,
        });
      }

      return token;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification for a reminder
   */
  async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    try {
      // Only schedule notifications for ALERT type reminders
      if (reminder.notificationType !== 'ALERT') {
        return null;
      }

      const dueDate = new Date(reminder.dueDate);
      
      // If there's a specific time, use it
      if (reminder.dueTime) {
        const [hours, minutes] = reminder.dueTime.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
      } else {
        // Default to 9 AM if no time specified
        dueDate.setHours(9, 0, 0, 0);
      }

      // Don't schedule notifications for past dates
      if (dueDate <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌱 Plant Reminder',
          body: reminder.title,
          data: {
            reminderId: reminder.id,
            plantId: reminder.plantId,
            type: 'reminder',
          },
          sound: true,
        },
        trigger: {
          date: dueDate,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        },
      });

      console.log(`Scheduled notification ${notificationId} for reminder ${reminder.id}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications for a specific reminder
   */
  async cancelReminderNotifications(reminderId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await this.cancelNotification(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error cancelling reminder notifications:', error);
    }
  }

  /**
   * Send an immediate local notification
   */
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  /**
   * Handle notification received while app is in foreground
   */
  addNotificationReceivedListener(handler: (notification: Notifications.Notification) => void): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(handler);
  }

  /**
   * Handle notification response (user tapped on notification)
   */
  addNotificationResponseReceivedListener(
    handler: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Clear all notifications from the notification tray
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Schedule recurring notifications for a reminder
   */
  async scheduleRecurringNotification(reminder: Reminder): Promise<string[]> {
    const notificationIds: string[] = [];

    if (!reminder.isRecurring || !reminder.recurringPattern || reminder.notificationType !== 'ALERT') {
      return notificationIds;
    }

    try {
      const baseDate = new Date(reminder.dueDate);
      const currentDate = new Date();
      
      // Schedule up to 12 future occurrences
      for (let i = 0; i < 12; i++) {
        const notificationDate = new Date(baseDate);
        
        switch (reminder.recurringPattern) {
          case 'WEEKLY':
            notificationDate.setDate(baseDate.getDate() + (i * 7));
            break;
          case 'MONTHLY':
            notificationDate.setMonth(baseDate.getMonth() + i);
            break;
          case 'YEARLY':
            notificationDate.setFullYear(baseDate.getFullYear() + i);
            break;
        }

        // Only schedule future notifications
        if (notificationDate > currentDate) {
          if (reminder.dueTime) {
            const [hours, minutes] = reminder.dueTime.split(':').map(Number);
            notificationDate.setHours(hours, minutes, 0, 0);
          } else {
            notificationDate.setHours(9, 0, 0, 0);
          }

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🌱 Plant Reminder',
              body: `${reminder.title} (Recurring)`,
              data: {
                reminderId: reminder.id,
                plantId: reminder.plantId,
                type: 'reminder',
                recurring: true,
                occurrence: i + 1,
              },
              sound: true,
            },
            trigger: {
              date: notificationDate,
              channelId: Platform.OS === 'android' ? 'reminders' : undefined,
            },
          });

          notificationIds.push(notificationId);
        }
      }

      console.log(`Scheduled ${notificationIds.length} recurring notifications for reminder ${reminder.id}`);
      return notificationIds;
    } catch (error) {
      console.error('Error scheduling recurring notifications:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
