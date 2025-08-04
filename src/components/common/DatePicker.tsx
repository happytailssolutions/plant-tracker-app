import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '../../styles/theme';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder: string;
  label: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
  label,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  // Update tempDate when value prop changes
  useEffect(() => {
    if (value) {
      setTempDate(new Date(value));
    }
  }, [value]);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForStorage = (date: Date): string => {
    return date.toISOString();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Always update tempDate when user scrolls
    if (selectedDate) {
      setTempDate(selectedDate);
    }
    
    // On Android, close immediately after selection
    if (Platform.OS === 'android') {
      if (selectedDate) {
        onChange(formatDateForStorage(selectedDate));
      }
      setShowPicker(false);
    }
    // On iOS, keep open until user confirms
  };

  const handleConfirm = () => {
    onChange(formatDateForStorage(tempDate));
    setShowPicker(false);
  };

  const handleCancel = () => {
    // Reset to original value
    if (value) {
      setTempDate(new Date(value));
    } else {
      setTempDate(new Date());
    }
    setShowPicker(false);
  };

  const clearDate = () => {
    onChange('');
    setTempDate(new Date());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.input, error && styles.inputError]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[
            styles.inputText,
            !value && styles.placeholderText
          ]}>
            {value ? formatDate(new Date(value)) : placeholder}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={clearDate}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Date Picker Modal */}
      {showPicker && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()} // No future dates
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.white,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.functional.error,
  },
  inputText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    flex: 1,
  },
  placeholderText: {
    color: colors.functional.neutral,
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  clearButton: {
    marginLeft: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.functional.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.background.white,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    ...typography.textStyles.caption,
    color: colors.functional.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
  },
  modalTitle: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
  },
  modalButton: {
    ...typography.textStyles.body,
    color: colors.primary.darkGreen,
    fontWeight: '600',
  },
}); 