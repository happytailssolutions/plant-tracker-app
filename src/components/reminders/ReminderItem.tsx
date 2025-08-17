import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface ReminderItemProps {
  reminder: {
    id: string;
    title: string;
    dueDate: string;
    dueTime?: string;
    notificationType: 'GENERAL' | 'WARNING' | 'ALERT';
    status: 'ACTIVE' | 'COMPLETED' | 'DISMISSED' | 'OVERDUE';
    description?: string;
  };
  onPress?: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  onPress,
  onComplete,
  onDismiss,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return '🔴';
      case 'WARNING':
        return '🟡';
      case 'GENERAL':
        return '🔵';
      default:
        return '🔵';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.functional.success;
      case 'OVERDUE':
        return colors.functional.error;
      case 'DISMISSED':
        return colors.functional.neutral;
      default:
        return colors.functional.darkGray;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return ` at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <Text style={styles.icon}>{getNotificationIcon(reminder.notificationType)}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: getStatusColor(reminder.status) }]}>
            {reminder.title}
          </Text>
          <Text style={styles.dueDate}>
            Due: {formatDate(reminder.dueDate)}{formatTime(reminder.dueTime)}
          </Text>
          {reminder.description && (
            <Text style={styles.description}>{reminder.description}</Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {reminder.status === 'ACTIVE' && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
              <Text style={styles.actionButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDismiss}>
              <Text style={styles.actionButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        )}
        {reminder.status === 'COMPLETED' && (
          <View style={[styles.statusBadge, { backgroundColor: colors.functional.success }]}>
            <Text style={styles.statusText}>Done</Text>
          </View>
        )}
        {reminder.status === 'OVERDUE' && (
          <View style={[styles.statusBadge, { backgroundColor: colors.functional.error }]}>
            <Text style={styles.statusText}>Overdue</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
    backgroundColor: colors.background.white,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.bodyBold,
    marginBottom: spacing.xs,
  },
  dueDate: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    fontStyle: 'italic',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary.greenPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary.darkGreen,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  statusText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
  },
});

export default ReminderItem;
