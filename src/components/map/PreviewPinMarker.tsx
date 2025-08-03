import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors, typography, spacing } from '../../styles/theme';

interface PreviewPinCoordinates {
  latitude: number;
  longitude: number;
}

interface PreviewPinMarkerProps {
  coordinates: PreviewPinCoordinates;
  pinType?: string;
}

export const PreviewPinMarker: React.FC<PreviewPinMarkerProps> = ({ 
  coordinates, 
  pinType = 'plant' 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    scaleAnimation.start();

    return () => {
      pulseAnimation.stop();
      scaleAnimation.stop();
    };
  }, [pulseAnim, scaleAnim]);

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

  const markerColor = getMarkerColor(pinType);

  return (
    <Marker
      coordinate={{
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      accessibilityLabel={`Preview ${pinType} marker`}
      accessibilityHint="This is a preview of where your pin will be placed"
    >
      {/* Pulsing background ring */}
      <Animated.View 
        style={[
          styles.pulseRing,
          { 
            backgroundColor: markerColor,
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.2],
              outputRange: [0.3, 0],
            }),
            transform: [{ scale: pulseAnim }],
          }
        ]} 
      />
      
      {/* Main marker */}
      <Animated.View 
        style={[
          styles.markerContainer, 
          { 
            backgroundColor: markerColor,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Text style={styles.markerText}>
          {pinType.charAt(0).toUpperCase()}
        </Text>
      </Animated.View>
      
      {/* Preview indicator */}
      <View style={styles.previewIndicator}>
        <Text style={styles.previewText}>PREVIEW</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.white,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  markerText: {
    color: colors.background.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.accent.orange,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  previewText: {
    color: colors.background.white,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 