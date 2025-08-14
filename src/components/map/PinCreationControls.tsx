import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, components } from '../../styles/theme';
import { Dropdown } from '../common';

interface PinCreationCoordinates {
  latitude: number;
  longitude: number;
}

interface PinCreationControlsProps {
  coordinates: PinCreationCoordinates;
  onConfirm: (coordinates: PinCreationCoordinates, pinType: string, status: string) => void;
  onQuickAdd?: (coordinates: PinCreationCoordinates, pinType: string, status: string) => void;
  onCancel: () => void;
  initialPinType?: string;
  initialStatus?: string;
}

const PIN_TYPES = [
  { label: 'Tree', value: 'tree' },
  { label: 'Plant', value: 'plant' },
  { label: 'Seedling', value: 'seedling' },
  { label: 'Flower', value: 'flower' },
];

const STATUS_OPTIONS = [
  { label: 'Growing', value: 'Growing' },
  { label: 'Flowering', value: 'Flowering' },
  { label: 'Fruiting', value: 'Fruiting' },
  { label: 'Seedling', value: 'Seedling' },
  { label: 'Deciduous', value: 'Deciduous' },
];

export const PinCreationControls: React.FC<PinCreationControlsProps> = ({
  coordinates,
  onConfirm,
  onQuickAdd,
  onCancel,
  initialPinType = 'tree',
  initialStatus = 'Growing',
}) => {
  const [selectedPinType, setSelectedPinType] = useState(initialPinType);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Pin Location',
      `Add a new ${selectedPinType} at this location?\n\nLatitude: ${coordinates.latitude.toFixed(6)}\nLongitude: ${coordinates.longitude.toFixed(6)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add Pin', 
          style: 'default',
          onPress: () => onConfirm(coordinates, selectedPinType, selectedStatus)
        },
      ]
    );
  };

  const handleQuickAdd = () => {
    if (onQuickAdd) {
      Alert.alert(
        'Quick Add Pin',
        `Quickly add a ${selectedPinType} with default settings?\n\nLatitude: ${coordinates.latitude.toFixed(6)}\nLongitude: ${coordinates.longitude.toFixed(6)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Quick Add', 
            style: 'default',
            onPress: () => onQuickAdd(coordinates, selectedPinType, selectedStatus)
          },
        ]
      );
    }
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pin Location</Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.functional.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Coordinates Display */}
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesLabel}>Coordinates:</Text>
          <Text style={styles.coordinatesText}>
            {formatCoordinate(coordinates.latitude)}, {formatCoordinate(coordinates.longitude)}
          </Text>
        </View>

        {/* Pin Type Selection */}
        <View style={styles.dropdownContainer}>
          <Dropdown
            label="Pin Type"
            value={selectedPinType}
            options={PIN_TYPES}
            onValueChange={setSelectedPinType}
            placeholder="Select Pin Type"
          />
        </View>

        {/* Status Selection */}
        <View style={styles.dropdownContainer}>
          <Dropdown
            label="Status"
            value={selectedStatus}
            options={STATUS_OPTIONS}
            onValueChange={setSelectedStatus}
            placeholder="Select Status"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {onQuickAdd && (
            <TouchableOpacity
              style={[styles.button, styles.quickAddButton]}
              onPress={handleQuickAdd}
              activeOpacity={0.7}
            >
              <Text style={styles.quickAddButtonText}>Quick Add</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmButtonText}>Add Pin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: spacing.xl,
  },
  content: {
    backgroundColor: colors.background.white,
    marginHorizontal: spacing.md,
    borderRadius: spacing.md,
    padding: spacing.md,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  coordinatesContainer: {
    backgroundColor: colors.background.light,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  coordinatesLabel: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  coordinatesText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    fontWeight: typography.fontWeight.medium,
    fontFamily: 'monospace',
  },
  dropdownContainer: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.functional.neutral,
  },
  cancelButtonText: {
    ...typography.textStyles.body,
    color: colors.functional.darkGray,
    fontWeight: typography.fontWeight.medium,
  },
  quickAddButton: {
    backgroundColor: colors.secondary.greenLight,
  },
  quickAddButtonText: {
    ...typography.textStyles.body,
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium,
  },
  confirmButton: {
    backgroundColor: colors.primary.darkGreen,
  },
  confirmButtonText: {
    ...typography.textStyles.body,
    color: colors.background.white,
    fontWeight: typography.fontWeight.medium,
  },
});