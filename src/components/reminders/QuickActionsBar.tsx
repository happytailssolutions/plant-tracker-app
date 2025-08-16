import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import { CREATE_QUICK_REMINDER_MUTATION } from '../../api/mutations/reminders';
import { colors, spacing, typography } from '../../styles/theme';

interface QuickActionsBarProps {
  plantId: string;
  onReminderCreated: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  plantId,
  onReminderCreated,
}) => {
  const [createQuickReminder] = useMutation(CREATE_QUICK_REMINDER_MUTATION);

  const quickActions = [
    {
      type: 'weekly' as const,
      label: 'Weekly',
      icon: '💧',
      description: 'Water plant',
    },
    {
      type: 'monthly' as const,
      label: 'Monthly',
      icon: '🌱',
      description: 'Fertilize',
    },
    {
      type: 'yearly' as const,
      label: 'Yearly',
      icon: '✂️',
      description: 'Prune',
    },
    {
      type: 'photo' as const,
      label: '📸 Update Photo',
      icon: '📸',
      description: 'Update plant photo',
    },
  ];

  const handleQuickAction = async (type: 'weekly' | 'monthly' | 'yearly' | 'photo') => {
    try {
      await createQuickReminder({
        variables: { plantId, type },
      });
      onReminderCreated();
    } catch (error) {
      console.error('Failed to create quick reminder:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.type}
            style={styles.actionButton}
            onPress={() => handleQuickAction(action.type)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.h4,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.textStyles.caption,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionDescription: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 10,
  },
});

export default QuickActionsBar;
