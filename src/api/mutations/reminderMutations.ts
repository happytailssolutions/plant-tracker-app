import { gql } from '@apollo/client';
import { Reminder } from '../queries/reminderQueries';

// Mutation to create a new reminder
export const CREATE_REMINDER_MUTATION = gql`
  mutation CreateReminder($input: CreateReminderInput!) {
    createReminder(input: $input) {
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

// Mutation to update an existing reminder
export const UPDATE_REMINDER_MUTATION = gql`
  mutation UpdateReminder($input: UpdateReminderInput!) {
    updateReminder(input: $input) {
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

// Mutation to delete a reminder
export const DELETE_REMINDER_MUTATION = gql`
  mutation DeleteReminder($id: ID!) {
    deleteReminder(id: $id)
  }
`;

// Mutation to mark a reminder as completed
export const MARK_REMINDER_COMPLETED_MUTATION = gql`
  mutation MarkReminderAsCompleted($id: ID!) {
    markReminderAsCompleted(id: $id) {
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

// Mutation to create a quick reminder
export const CREATE_QUICK_REMINDER_MUTATION = gql`
  mutation CreateQuickReminder($plantId: ID!, $type: String!) {
    createQuickReminder(plantId: $plantId, type: $type) {
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

// TypeScript interfaces for mutation inputs and responses
export interface CreateReminderInput {
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  notificationType: 'GENERAL' | 'WARNING' | 'ALERT';
  recurringPattern?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  isRecurring?: boolean;
  plantId: string;
}

export interface UpdateReminderInput {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  notificationType?: 'GENERAL' | 'WARNING' | 'ALERT';
  recurringPattern?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  isRecurring?: boolean;
}

export interface CreateReminderMutationResponse {
  createReminder: Reminder;
}

export interface UpdateReminderMutationResponse {
  updateReminder: Reminder;
}

export interface DeleteReminderMutationResponse {
  deleteReminder: boolean;
}

export interface MarkReminderCompletedMutationResponse {
  markReminderAsCompleted: Reminder;
}

export interface CreateQuickReminderMutationResponse {
  createQuickReminder: Reminder;
}

export interface CreateReminderMutationVariables {
  input: CreateReminderInput;
}

export interface UpdateReminderMutationVariables {
  input: UpdateReminderInput;
}

export interface DeleteReminderMutationVariables {
  id: string;
}

export interface MarkReminderCompletedMutationVariables {
  id: string;
}

export interface CreateQuickReminderMutationVariables {
  plantId: string;
  type: 'weekly' | 'monthly' | 'yearly' | 'photo';
}
