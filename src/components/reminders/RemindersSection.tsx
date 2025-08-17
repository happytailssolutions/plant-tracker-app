import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';
import { useRemindersStore, type CreateReminderData } from '../../state/remindersStore';
import AddReminderModal from './AddReminderModal';
import ReminderItem from './ReminderItem';
import QuickActionsBar from './QuickActionsBar';

interface RemindersSectionProps {
  plantId: string;
}

const RemindersSection: React.FC<RemindersSectionProps> = ({ plantId }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Get reminders from store
  const {
    getRemindersByPlant,
    createReminderAPI,
    markReminderCompletedAPI,
    deleteReminderAPI,
    createQuickReminderAPI,
    fetchRemindersByPlant,
    isLoading,
    error,
  } = useRemindersStore();
  
  const reminders = getRemindersByPlant(plantId);

  // Fetch reminders when component mounts or plantId changes
  useEffect(() => {
    if (plantId) {
      fetchRemindersByPlant(plantId);
    }
  }, [plantId, fetchRemindersByPlant]);

  const handleAddReminder = async (reminderData: CreateReminderData) => {
    try {
      await createReminderAPI(reminderData);
    } catch (error) {
      console.error('Failed to create reminder:', error);
      // Handle error (could show a toast notification)
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await markReminderCompletedAPI(reminderId);
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };

  const handleDismissReminder = async (reminderId: string) => {
    try {
      await deleteReminderAPI(reminderId);
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      await createQuickReminderAPI(plantId, action as 'weekly' | 'monthly' | 'yearly' | 'photo');
    } catch (error) {
      console.error('Failed to create quick reminder:', error);
    }
  };

  const renderReminder = ({ item }: { item: any }) => (
    <ReminderItem
      reminder={item}
      onComplete={() => handleCompleteReminder(item.id)}
      onDismiss={() => handleDismissReminder(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No reminders set</Text>
      <Text style={styles.emptySubtext}>
        Tap "Add Reminder" or use Quick Actions to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>📅 Reminders</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>

      {reminders.length > 0 ? (
        <FlatList
          data={reminders}
          renderItem={renderReminder}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsLabel}>Quick Actions:</Text>
        <QuickActionsBar onQuickAction={handleQuickAction} />
      </View>

      {/* Add Reminder Modal */}
      <AddReminderModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddReminder}
        plantId={plantId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    ...typography.textStyles.h3,
    color: colors.primary.darkGreen,
  },
  addButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  addButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.textStyles.bodyBold,
    color: colors.functional.neutral,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.greenPale,
  },
  quickActionsLabel: {
    ...typography.textStyles.bodyBold,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
  },
});

export default RemindersSection;
