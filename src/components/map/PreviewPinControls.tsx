import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, components } from '../../styles/theme';
import { Dropdown } from '../common';
import { getLocationDescription, formatCoordinates } from '../../utils/geocoding';

interface PreviewPinCoordinates {
  latitude: number;
  longitude: number;
}

interface PreviewPinControlsProps {
  coordinates: PreviewPinCoordinates;
  onConfirm: (coordinates: PreviewPinCoordinates, pinType: string) => void;
  onQuickAdd?: (coordinates: PreviewPinCoordinates, pinType: string) => void;
  onCancel: () => void;
  initialPinType?: string;
}

const PIN_TYPES = [
  { label: 'Plant', value: 'plant' },
  { label: 'Tree', value: 'tree' },
  { label: 'Seedling', value: 'seedling' },
  { label: 'Flower', value: 'flower' },
];

export const PreviewPinControls: React.FC<PreviewPinControlsProps> = ({
  coordinates,
  onConfirm,
  onQuickAdd,
  onCancel,
  initialPinType = 'plant',
}) => {
  const [selectedPinType, setSelectedPinType] = useState(initialPinType);
  const [locationDescription, setLocationDescription] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Pin Location',
      `Add a new ${selectedPinType} at this location?\n\nLatitude: ${coordinates.latitude.toFixed(6)}\nLongitude: ${coordinates.longitude.toFixed(6)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add Pin', 
          style: 'default',
          onPress: () => onConfirm(coordinates, selectedPinType)
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
            onPress: () => onQuickAdd(coordinates, selectedPinType)
          },
        ]
      );
    }
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  // Load location description when coordinates change
  useEffect(() => {
    const loadLocationDescription = async () => {
      setIsLoadingLocation(true);
      try {
        const description = await getLocationDescription(
          coordinates.latitude, 
          coordinates.longitude
        );
        setLocationDescription(description);
      } catch (error) {
        console.error('Failed to load location description:', error);
        setLocationDescription(formatCoordinates(coordinates.latitude, coordinates.longitude));
      } finally {
        setIsLoadingLocation(false);
      }
    };

    loadLocationDescription();
  }, [coordinates.latitude, coordinates.longitude]);

  return (
    <View style={styles.container}>
      {/* Location Description */}
      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="map" size={16} color={colors.accent.blue} />
          <Text style={styles.locationLabel}>Location:</Text>
          {isLoadingLocation ? (
            <Text style={styles.locationLoading}>Loading...</Text>
          ) : (
            <Text style={styles.locationValue}>{locationDescription}</Text>
          )}
        </View>
      </View>

      {/* Coordinate Display */}
      <View style={styles.coordinateContainer}>
        <View style={styles.coordinateRow}>
          <Ionicons name="location" size={16} color={colors.functional.darkGray} />
          <Text style={styles.coordinateLabel}>Latitude:</Text>
          <Text style={styles.coordinateValue}>{formatCoordinate(coordinates.latitude)}</Text>
        </View>
        <View style={styles.coordinateRow}>
          <Ionicons name="location" size={16} color={colors.functional.darkGray} />
          <Text style={styles.coordinateLabel}>Longitude:</Text>
          <Text style={styles.coordinateValue}>{formatCoordinate(coordinates.longitude)}</Text>
        </View>
      </View>

      {/* Pin Type Selection */}
      <View style={styles.pinTypeContainer}>
        <Text style={styles.pinTypeLabel}>Pin Type:</Text>
        <Dropdown
          data={PIN_TYPES}
          value={selectedPinType}
          onValueChange={setSelectedPinType}
          placeholder="Select pin type"
          style={styles.pinTypeDropdown}
          accessibilityLabel="Select pin type"
          accessibilityHint="Choose the type of pin you want to create"
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="information-circle" size={16} color={colors.accent.blue} />
        <Text style={styles.instructionsText}>
          Move the map or tap anywhere to adjust pin location, then tap ADD to confirm
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          activeOpacity={0.8}
          accessibilityLabel="Cancel pin placement"
          accessibilityHint="Cancel the pin placement and return to map view"
        >
          <Ionicons name="close" size={20} color={colors.functional.darkGray} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {onQuickAdd && (
          <TouchableOpacity
            style={[styles.button, styles.quickAddButton]}
            onPress={handleQuickAdd}
            activeOpacity={0.8}
            accessibilityLabel="Quick add pin"
            accessibilityHint="Quickly add a pin with default settings"
          >
            <Ionicons name="flash" size={20} color={colors.background.white} />
            <Text style={styles.quickAddButtonText}>QUICK</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
          activeOpacity={0.8}
          accessibilityLabel="Confirm pin placement"
          accessibilityHint="Confirm the pin placement and open detailed form"
        >
          <Ionicons name="add-circle" size={20} color={colors.background.white} />
          <Text style={styles.confirmButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    padding: spacing.lg,
    margin: spacing.lg,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  locationContainer: {
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationLabel: {
    ...typography.body.small,
    color: colors.accent.blue,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  locationValue: {
    ...typography.body.small,
    color: colors.functional.neutral,
    fontWeight: '500',
    flex: 1,
  },
  locationLoading: {
    ...typography.body.small,
    color: colors.functional.darkGray,
    fontStyle: 'italic',
  },
  coordinateContainer: {
    marginBottom: spacing.md,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  coordinateLabel: {
    ...typography.body.small,
    color: colors.functional.darkGray,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
    fontWeight: '500',
  },
  coordinateValue: {
    ...typography.body.small,
    color: colors.functional.neutral,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  pinTypeContainer: {
    marginBottom: spacing.md,
  },
  pinTypeLabel: {
    ...typography.body.small,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  pinTypeDropdown: {
    borderColor: colors.functional.lightGray,
    borderWidth: 1,
    borderRadius: spacing.sm,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.blueLight,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  instructionsText: {
    ...typography.body.small,
    color: colors.accent.blue,
    marginLeft: spacing.xs,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.functional.lightGray,
  },
  quickAddButton: {
    backgroundColor: colors.accent.amber,
  },
  confirmButton: {
    backgroundColor: colors.primary.darkGreen,
  },
  cancelButtonText: {
    ...typography.body.medium,
    color: colors.functional.darkGray,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  quickAddButtonText: {
    ...typography.body.medium,
    color: colors.background.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  confirmButtonText: {
    ...typography.body.medium,
    color: colors.background.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
}); 