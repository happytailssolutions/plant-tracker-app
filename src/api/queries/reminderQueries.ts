import { gql } from '@apollo/client';

// Query to get reminders for a specific plant
export const REMINDERS_BY_PLANT_QUERY = gql`
  query RemindersByPlant($plantId: String!) {
    remindersByPlant(plantId: $plantId) {
      id
      title
      description
      dueDate
      dueTime
      notificationType
      status
      isRecurring
      recurringPattern
      createdAt
      completedAt
      updatedAt
    }
  }
`;

// Query to get all active reminders for the current user
export const ACTIVE_REMINDERS_QUERY = gql`
  query ActiveRemindersForUser {
    activeRemindersForUser {
      id
      title
      description
      dueDate
      dueTime
      notificationType
      status
      isRecurring
      recurringPattern
      createdAt
      completedAt
      updatedAt
      plant {
        id
        name
        pinType
      }
    }
  }
`;

// Query to get overdue reminders for the current user
export const OVERDUE_REMINDERS_QUERY = gql`
  query OverdueRemindersForUser {
    overdueRemindersForUser {
      id
      title
      description
      dueDate
      dueTime
      notificationType
      status
      isRecurring
      recurringPattern
      createdAt
      completedAt
      updatedAt
      plant {
        id
        name
        pinType
      }
    }
  }
`;

// TypeScript interfaces for the query responses
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  notificationType: 'GENERAL' | 'WARNING' | 'ALERT';
  status: 'ACTIVE' | 'COMPLETED' | 'DISMISSED' | 'OVERDUE';
  isRecurring: boolean;
  recurringPattern?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
  plant?: {
    id: string;
    name: string;
    pinType: string;
  };
}

export interface RemindersByPlantQueryResponse {
  remindersByPlant: Reminder[];
}

export interface ActiveRemindersQueryResponse {
  activeRemindersForUser: Reminder[];
}

export interface OverdueRemindersQueryResponse {
  overdueRemindersForUser: Reminder[];
}
