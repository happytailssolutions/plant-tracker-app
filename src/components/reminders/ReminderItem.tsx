import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useMutation } from '@apollo/client';
import { DELETE_REMINDER_MUTATION, MARK_REMINDER_COMPLETED_MUTATION } from '../../api/mutations/reminders';
import { Reminder } from '../../types/reminder';
import { colors, spacing, typography } from '../../styles/theme';

interface ReminderItemProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onUpdate: () => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  onEdit,
  onUpdate,
}) => {
  const [deleteReminder] = useMutation(DELETE_REMINDER_MUTATION);
  const [markCompleted] = useMutation(MARK_REMINDER_COMPLETED_MUTATION);

  const isOverdue = reminder.status === 'active' && new Date(reminder.dueDate) < new Date();
  const isCompleted = reminder.status === 'completed';

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'general':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return colors.text.secondary;
    if (isOverdue) return colors.functional.error;
    return colors.text.primary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date < today) {
      return `${Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleComplete = async () => {
    try {
      await markCompleted({
        variables: { id: reminder.id },
      });
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark reminder as completed');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReminder({
                variables: { id: reminder.id },
              });
              onUpdate();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: getStatusColor() }]}>
              {reminder.title}
            </Text>
            {reminder.isRecurring && (
              <Text style={styles.recurringBadge}>🔄</Text>
            )}
          </View>
          <View style={styles.typeIcon}>
            {getNotificationTypeIcon(reminder.notificationType)}
          </View>
        </View>

        {reminder.description && (
          <Text style={[styles.description, { color: getStatusColor() }]}>
            {reminder.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={[styles.date, { color: getStatusColor() }]}>
            {formatDate(reminder.dueDate)}
          </Text>
          {reminder.dueTime && (
            <Text style={[styles.time, { color: getStatusColor() }]}>
              {reminder.dueTime}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>✓</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(reminder)}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  recurringBadge: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  typeIcon: {
    fontSize: 20,
  },
  description: {
    ...typography.textStyles.caption,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.sm,
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  completeButton: {
    backgroundColor: colors.functional.success,
  },
  completeButtonText: {
    color: colors.background.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  editButton: {
    backgroundColor: colors.primary.lightGreen,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: colors.functional.error,
  },
  deleteButtonText: {
    fontSize: 16,
  },
});

export default ReminderItem;
