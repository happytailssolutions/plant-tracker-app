import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, components } from '../../styles/theme';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<View>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleOpenDropdown = () => {
    if (disabled) return;
    
    dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({
        top: pageY + height,
        left: pageX,
        width: width,
      });
      // Small delay to ensure positioning is correct
      setTimeout(() => {
        setIsOpen(true);
      }, 50);
    });
  };

  const handleSelectOption = (optionValue: string) => {
    console.log('Dropdown: Selecting option:', optionValue);
    onValueChange(optionValue);
    setIsOpen(false);
  };

  const handleCloseDropdown = () => {
    setIsOpen(false);
  };

  // No automatic backdrop press handler - only close when user actually taps backdrop

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        ref={dropdownRef}
        style={[
          styles.pickerContainer,
          error && styles.inputError,
          disabled && styles.disabled,
        ]}
        onPress={handleOpenDropdown}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.pickerText,
          !selectedOption && styles.placeholderText,
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.functional.neutral} 
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDropdown}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCloseDropdown}
          delayPressIn={0}
        >
          <TouchableOpacity
            style={[
              styles.dropdownMenu,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
                         <ScrollView 
               style={styles.optionsContainer}
               showsVerticalScrollIndicator={false}
               nestedScrollEnabled
               onTouchStart={(e) => e.stopPropagation()}
             >
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    value === option.value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelectOption(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color={colors.primary.darkGreen} 
                    />
                  )}
                </TouchableOpacity>
              ))}
                         </ScrollView>
           </TouchableOpacity>
         </TouchableOpacity>
       </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    ...components.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    flex: 1,
  },
  placeholderText: {
    color: colors.functional.neutral,
  },
  inputError: {
    borderColor: colors.functional.error,
  },
  disabled: {
    opacity: 0.5,
  },
  errorText: {
    ...typography.textStyles.caption,
    color: colors.functional.error,
    marginTop: spacing.xs,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: colors.background.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.functional.neutral,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
  },
  optionsContainer: {
    maxHeight: 200,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  selectedOption: {
    backgroundColor: colors.secondary.greenPale,
  },
  optionText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary.darkGreen,
    fontWeight: typography.fontWeight.medium,
  },
});

export default Dropdown; 