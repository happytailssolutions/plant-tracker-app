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
    console.log('[DEV] Notification service initialized in development mode');
    this.expoPushToken = 'dev-token';
    return 'dev-token';
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }

  async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    console.log(`[DEV] Would schedule notification for reminder: ${reminder.title}`);
    return `dev-notification-${reminder.id}`;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    console.log(`[DEV] Would cancel notification: ${notificationId}`);
  }

  async cancelReminderNotifications(reminderId: string): Promise<void> {
    console.log(`[DEV] Would cancel all notifications for reminder: ${reminderId}`);
  }

  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    console.log(`[DEV] Would send immediate notification: ${title} - ${body}`);
  }

  addNotificationReceivedListener(handler: any): any {
    console.log('[DEV] Would add notification received listener');
    return { remove: () => console.log('[DEV] Listener removed') };
  }

  addNotificationResponseReceivedListener(handler: any): any {
    console.log('[DEV] Would add notification response listener');
    return { remove: () => console.log('[DEV] Listener removed') };
  }

  async getScheduledNotifications(): Promise<any[]> {
    console.log('[DEV] Would get scheduled notifications');
    return [];
  }

  async clearAllNotifications(): Promise<void> {
    console.log('[DEV] Would clear all notifications');
  }

  async scheduleRecurringNotification(reminder: Reminder): Promise<string[]> {
    console.log(`[DEV] Would schedule recurring notifications for: ${reminder.title}`);
    return [`dev-recurring-${reminder.id}-1`, `dev-recurring-${reminder.id}-2`];
  }
}

export const notificationService = NotificationService.getInstance();
