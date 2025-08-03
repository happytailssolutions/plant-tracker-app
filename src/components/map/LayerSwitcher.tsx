import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, components } from '../../styles/theme';

export type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';

interface LayerSwitcherProps {
  currentMapType: MapType;
  onMapTypeChange: (mapType: MapType) => void;
}

interface MapTypeOption {
  type: MapType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const mapTypeOptions: MapTypeOption[] = [
  {
    type: 'standard',
    label: 'Standard',
    icon: 'map-outline',
    description: 'Default street view'
  },
  {
    type: 'satellite',
    label: 'Satellite',
    icon: 'earth-outline',
    description: 'Satellite imagery'
  },
  {
    type: 'hybrid',
    label: 'Hybrid',
    icon: 'layers-outline',
    description: 'Satellite with labels'
  },
  {
    type: 'terrain',
    label: 'Terrain',
    icon: 'triangle-outline',
    description: 'Topographic view'
  }
];

export const LayerSwitcher: React.FC<LayerSwitcherProps> = ({
  currentMapType,
  onMapTypeChange
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentOption = mapTypeOptions.find(option => option.type === currentMapType);

  const handleMapTypeSelect = (mapType: MapType) => {
    onMapTypeChange(mapType);
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Layer Switcher Button */}
      <TouchableOpacity
        style={styles.layerButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={currentOption?.icon || 'layers-outline'} 
          size={20} 
          color={colors.background.white} 
        />
      </TouchableOpacity>

      {/* Layer Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Map Layers</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.functional.darkGray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {mapTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionItem,
                    currentMapType === option.type && styles.selectedOption
                  ]}
                  onPress={() => handleMapTypeSelect(option.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={currentMapType === option.type ? colors.background.white : colors.primary.darkGreen} 
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[
                      styles.optionLabel,
                      currentMapType === option.type && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      currentMapType === option.type && styles.selectedOptionText
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                  {currentMapType === option.type && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={colors.background.white} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  layerButton: {
    ...components.button.fab,
    position: 'absolute',
    bottom: spacing.xl + 80, // Position above the FAB
    right: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    backgroundColor: colors.primary.darkGreen,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    padding: spacing.lg,
    margin: spacing.lg,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.functional.neutral,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.greenPale,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.functional.darkGray,
  },
  closeButton: {
    padding: spacing.xs,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: colors.primary.darkGreen,
    borderColor: colors.primary.darkGreen,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.functional.neutral,
  },
  selectedOptionText: {
    color: colors.background.white,
  },
}); 