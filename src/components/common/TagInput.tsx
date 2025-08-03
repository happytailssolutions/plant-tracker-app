import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { colors, typography, spacing, components } from '../../styles/theme';

interface TagInputProps {
  onAddTag: (tag: string) => void;
  existingTags?: string[];
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  onAddTag,
  existingTags = [],
  placeholder = 'Add a tag...',
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) {
      return;
    }

    // Check if tag already exists
    if (existingTags.includes(trimmedTag.toLowerCase())) {
      Alert.alert('Tag Exists', 'This tag already exists for this pin.');
      return;
    }

    // Validate tag format (alphanumeric, hyphens, underscores only)
    const tagRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tagRegex.test(trimmedTag)) {
      Alert.alert(
        'Invalid Tag',
        'Tags can only contain letters, numbers, hyphens, and underscores.'
      );
      return;
    }

    // Add the tag
    onAddTag(trimmedTag.toLowerCase());
    setTagInput('');
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' || event.nativeEvent.key === ' ') {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={handleAddTag}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          placeholderTextColor={colors.functional.neutral}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, !tagInput.trim() && styles.addButtonDisabled]}
          onPress={handleAddTag}
          disabled={!tagInput.trim()}
          activeOpacity={0.7}
        >
          <Text style={[styles.addButtonText, !tagInput.trim() && styles.addButtonTextDisabled]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...components.input,
    height: 40,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.functional.neutral,
  },
  addButtonText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: colors.background.white,
  },
}); 