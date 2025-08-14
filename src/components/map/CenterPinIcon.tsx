import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

interface CenterPinIconProps {
  visible: boolean;
}

export const CenterPinIcon: React.FC<CenterPinIconProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Ionicons 
        name="location" 
        size={24} 
        color={colors.functional.error} 
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -24 }], // Center the 24px icon
    zIndex: 10,
    pointerEvents: 'none', // Don't interfere with map interactions
  },
  icon: {
    opacity: 0.8,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});