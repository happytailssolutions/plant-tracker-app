import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface NotificationTypeSelectorProps {
  selectedType: 'GENERAL' | 'WARNING' | 'ALERT';
  onTypeChange: (type: 'GENERAL' | 'WARNING' | 'ALERT') => void;
}

const NotificationTypeSelector: React.FC<NotificationTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const notificationTypes = [
    {
      id: 'GENERAL',
      label: 'General',
      color: colors.accent.blue,
      description: 'Visual indicators only - gentle reminders that appear in the app',
    },
    {
      id: 'WARNING',
      label: 'Warning',
      color: colors.accent.amber,
      description: 'Visual indicators + in-app warnings - important but not critical reminders',
    },
    {
      id: 'ALERT',
      label: 'Alert',
      color: colors.functional.error,
      description: 'Visual indicators + in-app warnings + push notifications - critical reminders',
    },
  ];

  const isTypeActive = (typeId: string) => {
    if (selectedType === 'ALERT') return true; // Alert includes all types
    if (selectedType === 'WARNING') return typeId === 'WARNING' || typeId === 'GENERAL'; // Warning includes general
    if (selectedType === 'GENERAL') return typeId === 'GENERAL'; // General only
    return false;
  };

  const handleInfoPress = () => {
    setShowInfoModal(true);
  };

  const InfoModal = () => (
    <Modal
      visible={showInfoModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowInfoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Notification Types</Text>
          
          <View style={styles.typeExplanation}>
            <View style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: colors.functional.error }]} />
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Alert (Highest Priority)</Text>
                <Text style={styles.typeDescription}>
                  • Push notifications to your phone{'\n'}
                  • In-app popup warnings{'\n'}
                  • Visual indicators everywhere{'\n'}
                  • Best for: Critical care (watering, fertilizing)
                </Text>
              </View>
            </View>
            
            <View style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: colors.accent.amber }]} />
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Warning (Medium Priority)</Text>
                <Text style={styles.typeDescription}>
                  • In-app popup warnings{'\n'}
                  • Visual indicators everywhere{'\n'}
                  • No push notifications{'\n'}
                  • Best for: Important but not critical tasks
                </Text>
              </View>
            </View>
            
            <View style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: colors.accent.blue }]} />
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>General (Lowest Priority)</Text>
                <Text style={styles.typeDescription}>
                  • Visual indicators only{'\n'}
                  • No notifications or warnings{'\n'}
                  • Best for: Gentle reminders, notes to self
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowInfoModal(false)}
          >
            <Text style={styles.modalCloseText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.typesContainer}>
        {notificationTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              {
                backgroundColor: isTypeActive(type.id) ? type.color : colors.background.white,
                borderColor: type.color,
              },
            ]}
            onPress={() => onTypeChange(type.id as 'GENERAL' | 'WARNING' | 'ALERT')}
          >
            <Text
              style={[
                styles.typeText,
                {
                  color: isTypeActive(type.id) ? colors.background.white : type.color,
                },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
          <Text style={styles.infoButtonText}>?</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.selectedDescription}>
        {notificationTypes.find(type => type.id === selectedType)?.description}
      </Text>
      
      <InfoModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  typesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  typeText: {
    ...typography.textStyles.bodySmall,
    fontWeight: '600',
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.functional.neutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    ...typography.textStyles.bodySmall,
    color: colors.background.white,
    fontWeight: 'bold',
  },
  selectedDescription: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    padding: spacing.lg,
    maxWidth: '90%',
    width: '100%',
  },
  modalTitle: {
    ...typography.textStyles.h3,
    color: colors.primary.darkGreen,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  typeExplanation: {
    marginBottom: spacing.lg,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  typeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    ...typography.textStyles.bodyBold,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  typeDescription: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    lineHeight: 18,
  },
  modalCloseButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  modalCloseText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
});

export default NotificationTypeSelector;
