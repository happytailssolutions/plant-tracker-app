import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Reminder } from '../../types/reminder';
import { colors, spacing, typography } from '../../styles/theme';
import ReminderItem from './ReminderItem';

interface ReminderListProps {
  reminders: Reminder[];
  loading: boolean;
  error: any;
  onEditReminder: (reminder: Reminder) => void;
  onReminderUpdated: () => void;
}

const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  loading,
  error,
  onEditReminder,
  onReminderUpdated,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.darkGreen} />
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load reminders</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  if (reminders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>No reminders yet</Text>
        <Text style={styles.emptySubtext}>
          Add reminders to keep track of plant care tasks
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reminders.map((reminder) => (
        <ReminderItem
          key={reminder.id}
          reminder={reminder}
          onEdit={onEditReminder}
          onUpdate={onReminderUpdated}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    ...typography.textStyles.body,
    color: colors.functional.error,
    fontWeight: typography.fontWeight.medium,
  },
  errorSubtext: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.textStyles.h4,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});

export default ReminderList;
