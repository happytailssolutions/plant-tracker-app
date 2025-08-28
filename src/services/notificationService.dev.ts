// Development-only notification service that doesn't use native modules
import { Reminder } from '../state/remindersStore';

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

  async initialize(): Promise<string | null> {
    this.expoPushToken = 'dev-token';
    return 'dev-token';
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    return `dev-notification-${reminder.id}`;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    // Would cancel notification in production
  }

  async cancelReminderNotifications(reminderId: string): Promise<void> {
    // Would cancel all notifications for reminder in production
  }

  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    // Would send immediate notification in production
  }

  addNotificationReceivedListener(handler: any): any {
    return { remove: () => {} };
  }

  addNotificationResponseReceivedListener(handler: any): any {
    return { remove: () => {} };
  }

  async getScheduledNotifications(): Promise<any[]> {
    return [];
  }

  async clearAllNotifications(): Promise<void> {
    // Would clear all notifications in production
  }

  async scheduleRecurringNotification(reminder: Reminder): Promise<string[]> {
    return [`dev-recurring-${reminder.id}-1`, `dev-recurring-${reminder.id}-2`];
  }
}

export const notificationService = NotificationService.getInstance();
