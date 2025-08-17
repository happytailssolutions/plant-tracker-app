import { create } from 'zustand';
import { apolloClient } from '../api/apollo-client';
import { notificationService } from '../services';
import {
  REMINDERS_BY_PLANT_QUERY,
  ACTIVE_REMINDERS_QUERY,
  OVERDUE_REMINDERS_QUERY,
  type RemindersByPlantQueryResponse,
  type ActiveRemindersQueryResponse,
  type OverdueRemindersQueryResponse,
} from '../api/queries/reminderQueries';
import {
  CREATE_REMINDER_MUTATION,
  UPDATE_REMINDER_MUTATION,
  DELETE_REMINDER_MUTATION,
  MARK_REMINDER_COMPLETED_MUTATION,
  CREATE_QUICK_REMINDER_MUTATION,
  type CreateReminderMutationResponse,
  type UpdateReminderMutationResponse,
  type DeleteReminderMutationResponse,
  type MarkReminderCompletedMutationResponse,
  type CreateQuickReminderMutationResponse,
  type CreateReminderMutationVariables,
  type UpdateReminderMutationVariables,
  type DeleteReminderMutationVariables,
  type MarkReminderCompletedMutationVariables,
  type CreateQuickReminderMutationVariables,
} from '../api/mutations/reminderMutations';

// Types for reminder state (matching GraphQL schema)
export interface Reminder {
  id: string;
  plantId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  dueTime?: string; // HH:MM format
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

export interface CreateReminderData {
  plantId: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  notificationType: 'GENERAL' | 'WARNING' | 'ALERT';
  isRecurring?: boolean;
  recurringPattern?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface UpdateReminderData {
  id: string;
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  notificationType?: 'GENERAL' | 'WARNING' | 'ALERT';
  isRecurring?: boolean;
  recurringPattern?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

interface RemindersState {
  // State
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Cache for plant-specific reminders
  remindersByPlant: Record<string, Reminder[]>;
  
  // Actions
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Plant-specific actions
  getRemindersByPlant: (plantId: string) => Reminder[];
  getActiveRemindersByPlant: (plantId: string) => Reminder[];
  getOverdueRemindersByPlant: (plantId: string) => Reminder[];
  
  // Reminder status actions
  completeReminder: (id: string) => void;
  dismissReminder: (id: string) => void;
  reactivateReminder: (id: string) => void;
  
  // Bulk actions
  markOverdueReminders: () => void;
  clearCompletedReminders: () => void;
  
  // Utility actions
  refreshCache: () => void;
  clearState: () => void;
  
  // Quick action helpers
  createQuickReminder: (plantId: string, type: 'weekly' | 'monthly' | 'yearly' | 'photo') => CreateReminderData;
  
  // API-integrated methods
  fetchRemindersByPlant: (plantId: string) => Promise<void>;
  fetchActiveReminders: () => Promise<void>;
  fetchOverdueReminders: () => Promise<void>;
  createReminderAPI: (data: CreateReminderData) => Promise<Reminder>;
  updateReminderAPI: (data: UpdateReminderData) => Promise<Reminder>;
  deleteReminderAPI: (id: string) => Promise<void>;
  markReminderCompletedAPI: (id: string) => Promise<Reminder>;
  createQuickReminderAPI: (plantId: string, type: 'weekly' | 'monthly' | 'yearly' | 'photo') => Promise<Reminder>;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  // Initial state
  reminders: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  remindersByPlant: {},
  
  // Basic CRUD actions
  setReminders: (reminders: Reminder[]) => {
    const remindersByPlant: Record<string, Reminder[]> = {};
    
    // Group reminders by plantId for efficient access
    reminders.forEach(reminder => {
      if (!remindersByPlant[reminder.plantId]) {
        remindersByPlant[reminder.plantId] = [];
      }
      remindersByPlant[reminder.plantId].push(reminder);
    });
    
    set({ 
      reminders, 
      remindersByPlant,
      lastFetch: Date.now(),
      error: null 
    });
  },
  
  addReminder: (reminder: Reminder) => 
    set((state) => {
      const newReminders = [...state.reminders, reminder];
      const updatedRemindersByPlant = { ...state.remindersByPlant };
      
      if (!updatedRemindersByPlant[reminder.plantId]) {
        updatedRemindersByPlant[reminder.plantId] = [];
      }
      updatedRemindersByPlant[reminder.plantId] = [
        ...updatedRemindersByPlant[reminder.plantId],
        reminder
      ];
      
      return {
        reminders: newReminders,
        remindersByPlant: updatedRemindersByPlant,
      };
    }),
    
  updateReminder: (id: string, updates: Partial<Reminder>) => 
    set((state) => {
      const reminderIndex = state.reminders.findIndex(r => r.id === id);
      if (reminderIndex === -1) return state;
      
      const updatedReminder = { ...state.reminders[reminderIndex], ...updates };
      const newReminders = [...state.reminders];
      newReminders[reminderIndex] = updatedReminder;
      
      // Update cache
      const updatedRemindersByPlant = { ...state.remindersByPlant };
      const plantId = updatedReminder.plantId;
      if (updatedRemindersByPlant[plantId]) {
        const plantReminderIndex = updatedRemindersByPlant[plantId].findIndex(r => r.id === id);
        if (plantReminderIndex !== -1) {
          updatedRemindersByPlant[plantId] = [...updatedRemindersByPlant[plantId]];
          updatedRemindersByPlant[plantId][plantReminderIndex] = updatedReminder;
        }
      }
      
      return {
        reminders: newReminders,
        remindersByPlant: updatedRemindersByPlant,
      };
    }),
    
  removeReminder: (id: string) => 
    set((state) => {
      const reminder = state.reminders.find(r => r.id === id);
      if (!reminder) return state;
      
      const newReminders = state.reminders.filter(r => r.id !== id);
      const updatedRemindersByPlant = { ...state.remindersByPlant };
      
      if (updatedRemindersByPlant[reminder.plantId]) {
        updatedRemindersByPlant[reminder.plantId] = 
          updatedRemindersByPlant[reminder.plantId].filter(r => r.id !== id);
      }
      
      return {
        reminders: newReminders,
        remindersByPlant: updatedRemindersByPlant,
      };
    }),
    
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),
    
  setError: (error: string | null) => 
    set({ error }),
    
  clearError: () => 
    set({ error: null }),
    
  // Plant-specific getters
  getRemindersByPlant: (plantId: string) => {
    const state = get();
    return state.remindersByPlant[plantId] || [];
  },
  
  getActiveRemindersByPlant: (plantId: string) => {
    const state = get();
    const plantReminders = state.remindersByPlant[plantId] || [];
    return plantReminders.filter(r => r.status === 'ACTIVE');
  },
  
  getOverdueRemindersByPlant: (plantId: string) => {
    const state = get();
    const plantReminders = state.remindersByPlant[plantId] || [];
    return plantReminders.filter(r => r.status === 'OVERDUE');
  },
  
  // Status change actions
  completeReminder: (id: string) => {
    const { updateReminder } = get();
    updateReminder(id, { 
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
  
  dismissReminder: (id: string) => {
    const { updateReminder } = get();
    updateReminder(id, { 
      status: 'DISMISSED',
      updatedAt: new Date().toISOString(),
    });
  },
  
  reactivateReminder: (id: string) => {
    const { updateReminder } = get();
    updateReminder(id, { 
      status: 'ACTIVE',
      completedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
  },
  
  // Utility actions
  markOverdueReminders: () => {
    const state = get();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    state.reminders.forEach(reminder => {
      if (reminder.status === 'ACTIVE' && reminder.dueDate < today) {
        get().updateReminder(reminder.id, { status: 'OVERDUE' });
      }
    });
  },
  
  clearCompletedReminders: () => 
    set((state) => {
      const activeReminders = state.reminders.filter(r => r.status !== 'COMPLETED');
      const remindersByPlant: Record<string, Reminder[]> = {};
      
      activeReminders.forEach(reminder => {
        if (!remindersByPlant[reminder.plantId]) {
          remindersByPlant[reminder.plantId] = [];
        }
        remindersByPlant[reminder.plantId].push(reminder);
      });
      
      return {
        reminders: activeReminders,
        remindersByPlant,
      };
    }),
    
  refreshCache: () => {
    const state = get();
    const remindersByPlant: Record<string, Reminder[]> = {};
    
    state.reminders.forEach(reminder => {
      if (!remindersByPlant[reminder.plantId]) {
        remindersByPlant[reminder.plantId] = [];
      }
      remindersByPlant[reminder.plantId].push(reminder);
    });
    
    set({ remindersByPlant });
  },
  
  clearState: () => 
    set({
      reminders: [],
      isLoading: false,
      error: null,
      lastFetch: null,
      remindersByPlant: {},
    }),
    
  // Quick action helpers
  createQuickReminder: (plantId: string, type: 'weekly' | 'monthly' | 'yearly' | 'photo'): CreateReminderData => {
    const now = new Date();
    let dueDate = new Date();
    let title = '';
    let notificationType: 'GENERAL' | 'WARNING' | 'ALERT' = 'WARNING';
    
    switch (type) {
      case 'weekly':
        dueDate.setDate(now.getDate() + 7);
        title = 'Water plant';
        break;
      case 'monthly':
        dueDate.setMonth(now.getMonth() + 1);
        title = 'Fertilize';
        break;
      case 'yearly':
        dueDate.setFullYear(now.getFullYear() + 1);
        title = 'Prune';
        break;
      case 'photo':
        dueDate.setFullYear(now.getFullYear() + 1);
        title = 'Update plant photo';
        notificationType = 'GENERAL';
        break;
    }
    
    return {
      plantId,
      title,
      dueDate: dueDate.toISOString().split('T')[0],
      notificationType,
      isRecurring: false,
    };
  },

  // API-integrated methods
  fetchRemindersByPlant: async (plantId: string) => {
    const { setLoading, setError, setReminders } = get();
    setLoading(true);
    setError(null);

    try {
      const { data } = await apolloClient.query<RemindersByPlantQueryResponse>({
        query: REMINDERS_BY_PLANT_QUERY,
        variables: { plantId },
        fetchPolicy: 'cache-and-network',
      });

      setReminders(data.remindersByPlant);
    } catch (error) {
      console.error('Error fetching reminders by plant:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  },

  fetchActiveReminders: async () => {
    const { setLoading, setError, setReminders } = get();
    setLoading(true);
    setError(null);

    try {
      const { data } = await apolloClient.query<ActiveRemindersQueryResponse>({
        query: ACTIVE_REMINDERS_QUERY,
        fetchPolicy: 'cache-and-network',
      });

      setReminders(data.activeRemindersForUser);
    } catch (error) {
      console.error('Error fetching active reminders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch active reminders');
    } finally {
      setLoading(false);
    }
  },

  fetchOverdueReminders: async () => {
    const { setLoading, setError, setReminders } = get();
    setLoading(true);
    setError(null);

    try {
      const { data } = await apolloClient.query<OverdueRemindersQueryResponse>({
        query: OVERDUE_REMINDERS_QUERY,
        fetchPolicy: 'cache-and-network',
      });

      setReminders(data.overdueRemindersForUser);
    } catch (error) {
      console.error('Error fetching overdue reminders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch overdue reminders');
    } finally {
      setLoading(false);
    }
  },

  createReminderAPI: async (data: CreateReminderData): Promise<Reminder> => {
    const { setLoading, setError, addReminder } = get();
    setLoading(true);
    setError(null);

    try {
      const { data: result } = await apolloClient.mutate<CreateReminderMutationResponse, CreateReminderMutationVariables>({
        mutation: CREATE_REMINDER_MUTATION,
        variables: { input: data },
      });

      if (result?.createReminder) {
        addReminder(result.createReminder);
        
        // Schedule notification for ALERT type reminders
        if (result.createReminder.notificationType === 'ALERT') {
          if (result.createReminder.isRecurring) {
            await notificationService.scheduleRecurringNotification(result.createReminder);
          } else {
            await notificationService.scheduleReminderNotification(result.createReminder);
          }
        }
        
        return result.createReminder;
      }
      throw new Error('No reminder returned from server');
    } catch (error) {
      console.error('Error creating reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create reminder';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  updateReminderAPI: async (data: UpdateReminderData): Promise<Reminder> => {
    const { setLoading, setError, updateReminder } = get();
    setLoading(true);
    setError(null);

    try {
      const { data: result } = await apolloClient.mutate<UpdateReminderMutationResponse, UpdateReminderMutationVariables>({
        mutation: UPDATE_REMINDER_MUTATION,
        variables: { input: data },
      });

      if (result?.updateReminder) {
        updateReminder(data.id, result.updateReminder);
        return result.updateReminder;
      }
      throw new Error('No reminder returned from server');
    } catch (error) {
      console.error('Error updating reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update reminder';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  deleteReminderAPI: async (id: string): Promise<void> => {
    const { setLoading, setError, removeReminder } = get();
    setLoading(true);
    setError(null);

    try {
      await apolloClient.mutate<DeleteReminderMutationResponse, DeleteReminderMutationVariables>({
        mutation: DELETE_REMINDER_MUTATION,
        variables: { id },
      });

      // Cancel any scheduled notifications for this reminder
      await notificationService.cancelReminderNotifications(id);
      
      removeReminder(id);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete reminder';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  markReminderCompletedAPI: async (id: string): Promise<Reminder> => {
    const { setLoading, setError, updateReminder } = get();
    setLoading(true);
    setError(null);

    try {
      const { data: result } = await apolloClient.mutate<MarkReminderCompletedMutationResponse, MarkReminderCompletedMutationVariables>({
        mutation: MARK_REMINDER_COMPLETED_MUTATION,
        variables: { id },
      });

      if (result?.markReminderAsCompleted) {
        updateReminder(id, result.markReminderAsCompleted);
        return result.markReminderAsCompleted;
      }
      throw new Error('No reminder returned from server');
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark reminder as completed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },

  createQuickReminderAPI: async (plantId: string, type: 'weekly' | 'monthly' | 'yearly' | 'photo'): Promise<Reminder> => {
    const { setLoading, setError, addReminder } = get();
    setLoading(true);
    setError(null);

    try {
      const { data: result } = await apolloClient.mutate<CreateQuickReminderMutationResponse, CreateQuickReminderMutationVariables>({
        mutation: CREATE_QUICK_REMINDER_MUTATION,
        variables: { plantId, type },
      });

      if (result?.createQuickReminder) {
        addReminder(result.createQuickReminder);
        
        // Schedule notification for ALERT type reminders
        if (result.createQuickReminder.notificationType === 'ALERT') {
          if (result.createQuickReminder.isRecurring) {
            await notificationService.scheduleRecurringNotification(result.createQuickReminder);
          } else {
            await notificationService.scheduleReminderNotification(result.createQuickReminder);
          }
        }
        
        return result.createQuickReminder;
      }
      throw new Error('No reminder returned from server');
    } catch (error) {
      console.error('Error creating quick reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quick reminder';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },
}));
