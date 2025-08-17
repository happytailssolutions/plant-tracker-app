import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface QuickActionsBarProps {
  onQuickAction: (action: string) => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onQuickAction }) => {
  const quickActions = [
    { id: 'weekly', label: 'Weekly', icon: '📅' },
    { id: 'monthly', label: 'Monthly', icon: '📅' },
    { id: 'yearly', label: 'Yearly', icon: '📅' },
    { id: 'photo', label: 'Update Photo', icon: '📸' },
  ];

  return (
    <View style={styles.container}>
      {quickActions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={() => onQuickAction(action.id)}
        >
          <Text style={styles.actionIcon}>{action.icon}</Text>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.secondary.greenPale,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.textStyles.caption,
    color: colors.primary.darkGreen,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QuickActionsBar;
