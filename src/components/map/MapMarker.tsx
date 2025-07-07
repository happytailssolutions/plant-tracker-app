import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Pin } from '../../api/queries/pinQueries';
import { colors, typography, spacing } from '../../styles/theme';

interface MapMarkerProps {
  pin: Pin;
  onPress?: (pin: Pin) => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ pin, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(pin);
    }
  };

  // Get marker color based on pin type
  const getMarkerColor = (pinType: string) => {
    switch (pinType.toLowerCase()) {
      case 'tree':
        return colors.primary.darkGreen;
      case 'plant':
        return colors.secondary.greenLight;
      case 'seedling':
        return colors.accent.amber;
      case 'flower':
        return colors.accent.teal;
      default:
        return colors.primary.darkGreen;
    }
  };

  const markerColor = getMarkerColor(pin.pinType);

  return (
    <Marker
      coordinate={{
        latitude: pin.latitude,
        longitude: pin.longitude,
      }}
      onPress={handlePress}
    >
      <View style={[styles.markerContainer, { backgroundColor: markerColor }]}>
        <Text style={styles.markerText}>
          {pin.pinType.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{pin.name}</Text>
          {pin.description && (
            <Text style={styles.calloutDescription}>{pin.description}</Text>
          )}
          <Text style={styles.calloutType}>{pin.pinType}</Text>
          <Text style={styles.calloutStatus}>Status: {pin.status}</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.light,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    color: colors.background.light,
    fontSize: 14,
    fontWeight: 'bold',
  },
  calloutContainer: {
    backgroundColor: colors.background.light,
    borderRadius: spacing.sm,
    padding: spacing.md,
    minWidth: 200,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    ...typography.textStyles.h3,
    color: colors.primary.darkGreen,
    marginBottom: spacing.xs,
  },
  calloutDescription: {
    ...typography.textStyles.body,
    color: colors.functional.neutral,
    marginBottom: spacing.xs,
  },
  calloutType: {
    ...typography.textStyles.bodySmall,
    color: colors.accent.teal,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  calloutStatus: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
  },
}); 