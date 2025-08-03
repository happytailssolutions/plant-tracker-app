import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TagBubble } from './TagBubble';
import { colors, typography, spacing } from '../../styles/theme';

interface TagSelectionModalProps {
  visible: boolean;
  availableTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClose: () => void;
}

export const TagSelectionModal: React.FC<TagSelectionModalProps> = ({
  visible,
  availableTags,
  selectedTags,
  onTagSelect,
  onClose,
}) => {
  const handleTagPress = (tag: string) => {
    onTagSelect(tag);
    onClose(); // Auto-close modal after selection
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select a Tag to Filter</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {availableTags.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tags available in this project</Text>
              </View>
            ) : (
              <View style={styles.tagsContainer}>
                {availableTags.map((tag, index) => (
                  <TagBubble
                    key={`${tag}-${index}`}
                    tag={tag}
                    onPress={() => handleTagPress(tag)}
                    selected={selectedTags.includes(tag)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.functional.neutral,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.functional.neutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.background.white,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 18,
  },
  content: {
    padding: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    fontStyle: 'italic',
  },
}); 