import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { REMINDERS_BY_PLANT_QUERY } from '../../api/queries/reminders';
import { Reminder } from '../../types/reminder';
import { colors, spacing, typography } from '../../styles/theme';
import ReminderList from './ReminderList';
import QuickActionsBar from './QuickActionsBar';
import AddReminderModal from './AddReminderModal';

interface RemindersSectionProps {
  plantId: string;
}

const RemindersSection: React.FC<RemindersSectionProps> = ({ plantId }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const { data, loading, error, refetch } = useQuery(REMINDERS_BY_PLANT_QUERY, {
    variables: { plantId },
    fetchPolicy: 'cache-and-network',
  });

  const reminders = data?.remindersByPlant || [];
  const hasOverdueReminders = reminders.some(
    (reminder: Reminder) => 
      reminder.status === 'active' && 
      new Date(reminder.dueDate) < new Date()
  );

  const handleAddReminder = () => {
    setEditingReminder(null);
    setIsAddModalVisible(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsAddModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAddModalVisible(false);
    setEditingReminder(null);
    refetch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>📅 Reminders</Text>
          {hasOverdueReminders && (
            <View style={styles.overdueIndicator}>
              <Text style={styles.overdueText}>!</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddReminder}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <QuickActionsBar plantId={plantId} onReminderCreated={refetch} />

      <ReminderList
        reminders={reminders}
        loading={loading}
        error={error}
        onEditReminder={handleEditReminder}
        onReminderUpdated={refetch}
      />

      <AddReminderModal
        visible={isAddModalVisible}
        plantId={plantId}
        reminder={editingReminder}
        onClose={handleModalClose}
        onReminderSaved={handleModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  overdueIndicator: {
    backgroundColor: colors.functional.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  overdueText: {
    color: colors.background.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  addButton: {
    backgroundColor: colors.primary.darkGreen,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background.white,
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
  },
});

export default RemindersSection;
