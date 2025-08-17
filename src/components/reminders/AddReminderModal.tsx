import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '../../styles/theme';
import { type CreateReminderData } from '../../state/remindersStore';
import NotificationTypeSelector from './NotificationTypeSelector';
import QuickActionsBar from './QuickActionsBar';

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reminder: CreateReminderData) => void;
  plantId: string;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  visible,
  onClose,
  onSave,
  plantId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [notificationType, setNotificationType] = useState<'GENERAL' | 'WARNING' | 'ALERT'>('ALERT');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder');
      return;
    }

    const newReminder: CreateReminderData = {
      plantId: plantId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate.toISOString().split('T')[0],
      dueTime: dueTime ? dueTime.toTimeString().split(' ')[0] : undefined,
      notificationType: notificationType,
      isRecurring: false,
    };

    onSave(newReminder);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setDueTime(null);
    setNotificationType('ALERT');
    onClose();
  };

  const handleQuickAction = (action: string) => {
    const now = new Date();
    let newDate = new Date();
    let newTitle = '';
    let newType: 'GENERAL' | 'WARNING' | 'ALERT' = 'WARNING';

    switch (action) {
      case 'weekly':
        newDate.setDate(now.getDate() + 7);
        newTitle = 'Water plant';
        break;
      case 'monthly':
        newDate.setMonth(now.getMonth() + 1);
        newTitle = 'Fertilize';
        break;
      case 'yearly':
        newDate.setFullYear(now.getFullYear() + 1);
        newTitle = 'Prune';
        break;
      case 'photo':
        newDate.setFullYear(now.getFullYear() + 1);
        newTitle = 'Update plant photo';
        newType = 'GENERAL';
        break;
    }

    setTitle(newTitle);
    setDueDate(newDate);
    setNotificationType(newType);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time: Date | null) => {
    if (!time) return 'Not set';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✨ Add New Reminder</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Water plant"
              placeholderTextColor={colors.functional.neutral}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add any additional notes..."
              placeholderTextColor={colors.functional.neutral}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Time (Optional)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatTime(dueTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* Notification Type Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Notification Type</Text>
            <NotificationTypeSelector
              selectedType={notificationType}
              onTypeChange={setNotificationType}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.label}>Quick Actions</Text>
            <QuickActionsBar onQuickAction={handleQuickAction} />
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDueDate(selectedDate);
              }
            }}
          />
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={dueTime || new Date()}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setDueTime(selectedTime);
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    ...typography.textStyles.button,
    color: colors.functional.neutral,
  },
  headerTitle: {
    ...typography.textStyles.h3,
    color: colors.primary.darkGreen,
  },
  saveButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  saveButtonText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.textStyles.bodyBold,
    color: colors.functional.darkGray,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.white,
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.white,
  },
  dateButtonText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
  },
});

export default AddReminderModal;
