import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

export type NotificationType = 'general' | 'warning' | 'alert';

interface NotificationTypeSelectorProps {
  selectedType: NotificationType;
  onTypeChange: (type: NotificationType) => void;
}

const NotificationTypeSelector: React.FC<NotificationTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const notificationTypes: { type: NotificationType; label: string; icon: string; color: string }[] = [
    {
      type: 'general',
      label: 'General',
      icon: '🟢',
      color: colors.functional.success,
    },
    {
      type: 'warning',
      label: 'Warning',
      icon: '🟡',
      color: colors.functional.warning,
    },
    {
      type: 'alert',
      label: 'Alert',
      icon: '🔴',
      color: colors.functional.error,
    },
  ];

  const handleTypeSelect = (type: NotificationType) => {
    onTypeChange(type);
  };

  const isTypeSelected = (type: NotificationType) => {
    switch (selectedType) {
      case 'general':
        return type === 'general';
      case 'warning':
        return type === 'general' || type === 'warning';
      case 'alert':
        return true; // All types are selected
      default:
        return false;
    }
  };

  const showHelpInfo = () => {
    Alert.alert(
      'Notification Types',
      `🔴 Alert: Push notification + In-app popup + Visual indicators
🟡 Warning: In-app popup + Visual indicators  
🟢 General: Visual indicators only

Higher priority types include all lower priority behaviors.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Notification Type</Text>
        <TouchableOpacity onPress={showHelpInfo} style={styles.helpButton}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bubblesContainer}>
        {notificationTypes.map((notificationType) => (
          <TouchableOpacity
            key={notificationType.type}
            style={[
              styles.bubble,
              isTypeSelected(notificationType.type) && styles.selectedBubble,
              { borderColor: notificationType.color }
            ]}
            onPress={() => handleTypeSelect(notificationType.type)}
          >
            <Text style={styles.bubbleIcon}>{notificationType.icon}</Text>
            <Text style={[
              styles.bubbleLabel,
              isTypeSelected(notificationType.type) && styles.selectedBubbleLabel
            ]}>
              {notificationType.label}
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  helpButton: {
    backgroundColor: colors.primary.lightGreen,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    color: colors.background.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  bubblesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bubble: {
    flex: 1,
    borderWidth: 2,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    backgroundColor: colors.background.white,
  },
  selectedBubble: {
    backgroundColor: colors.primary.lightGreen,
  },
  bubbleIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  bubbleLabel: {
    ...typography.textStyles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  selectedBubbleLabel: {
    color: colors.background.white,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default NotificationTypeSelector;
