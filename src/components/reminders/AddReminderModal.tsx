import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation } from '@apollo/client';
import { CREATE_REMINDER_MUTATION, UPDATE_REMINDER_MUTATION } from '../../api/mutations/reminders';
import { Reminder } from '../../types/reminder';
import { colors, spacing, typography } from '../../styles/theme';
import NotificationTypeSelector, { NotificationType } from './NotificationTypeSelector';

interface AddReminderModalProps {
  visible: boolean;
  plantId: string;
  reminder?: Reminder | null;
  onClose: () => void;
  onReminderSaved: () => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  visible,
  plantId,
  reminder,
  onClose,
  onReminderSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('alert');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [createReminder] = useMutation(CREATE_REMINDER_MUTATION);
  const [updateReminder] = useMutation(UPDATE_REMINDER_MUTATION);

  const isEditing = !!reminder;

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description || '');
      setDueDate(new Date(reminder.dueDate));
      setDueTime(reminder.dueTime || '');
      setNotificationType(reminder.notificationType as NotificationType);
      setIsRecurring(reminder.isRecurring);
    } else {
      // Reset form for new reminder
      setTitle('');
      setDescription('');
      setDueDate(new Date());
      setDueTime('');
      setNotificationType('alert');
      setIsRecurring(false);
    }
  }, [reminder, visible]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setDueTime(`${hours}:${minutes}`);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder');
      return false;
    }
    if (dueDate < new Date()) {
      Alert.alert('Error', 'Due date cannot be in the past');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing && reminder) {
        await updateReminder({
          variables: {
            input: {
              id: reminder.id,
              title: title.trim(),
              description: description.trim() || null,
              dueDate: dueDate.toISOString().split('T')[0],
              dueTime: dueTime || null,
              notificationType,
              isRecurring,
            },
          },
        });
        Alert.alert('Success', 'Reminder updated successfully!');
      } else {
        await createReminder({
          variables: {
            input: {
              title: title.trim(),
              description: description.trim() || null,
              dueDate: dueDate.toISOString().split('T')[0],
              dueTime: dueTime || null,
              notificationType,
              plantId,
              isRecurring,
            },
          },
        });
        Alert.alert('Success', 'Reminder created successfully!');
      }
      onReminderSaved();
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTime = (time: string) => {
    if (!time) return 'Set time';
    return time;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Reminder' : 'Add Reminder'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter reminder title"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description (optional)"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>{formatTime(dueTime)}</Text>
            </TouchableOpacity>
          </View>

          <NotificationTypeSelector
            selectedType={notificationType}
            onTypeChange={setNotificationType}
          />

          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <View style={[styles.checkbox, isRecurring && styles.checkboxChecked]}>
                {isRecurring && <Text style={styles.checkboxText}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Make this reminder recurring</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.textStyles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.white,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary.darkGreen,
    borderRadius: spacing.xs,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.darkGreen,
  },
  checkboxText: {
    color: colors.background.white,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  checkboxLabel: {
    ...typography.textStyles.body,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  saveButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.textStyles.body,
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium,
  },
});

export default AddReminderModal;
