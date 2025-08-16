export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  notificationType: 'general' | 'warning' | 'alert';
  status: 'active' | 'completed' | 'dismissed' | 'overdue';
  recurringPattern: 'none' | 'weekly' | 'monthly' | 'yearly';
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  plantId: string;
  createdById: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  notificationType: 'general' | 'warning' | 'alert';
  recurringPattern?: 'none' | 'weekly' | 'monthly' | 'yearly';
  isRecurring?: boolean;
  plantId: string;
}

export interface UpdateReminderInput {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  notificationType?: 'general' | 'warning' | 'alert';
  status?: 'active' | 'completed' | 'dismissed' | 'overdue';
  recurringPattern?: 'none' | 'weekly' | 'monthly' | 'yearly';
  isRecurring?: boolean;
  completedAt?: string;
}
