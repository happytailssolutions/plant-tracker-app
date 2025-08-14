import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface TagBubbleProps {
  tag: string;
  onPress?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  selected?: boolean;
}

export const TagBubble: React.FC<TagBubbleProps> = ({
  tag,
  onPress,
  onRemove,
  removable = false,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        onPress && styles.pressable,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {tag}
      </Text>
      {removable && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.7}
        >
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

interface TagBubbleListProps {
  tags: string[];
  onTagPress?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  removable?: boolean;
  selectedTags?: string[];
  emptyMessage?: string;
}

export const TagBubbleList: React.FC<TagBubbleListProps> = ({
  tags,
  onTagPress,
  onTagRemove,
  removable = false,
  selectedTags = [],
  emptyMessage = 'No tags',
}) => {
  if (tags.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {tags.map((tag, index) => (
        <TagBubble
          key={`${tag}-${index}`}
          tag={tag}
          onPress={onTagPress ? () => onTagPress(tag) : undefined}
          onRemove={onTagRemove ? () => onTagRemove(tag) : undefined}
          removable={removable}
          selected={selectedTags.includes(tag)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.greenPale,
    borderRadius: spacing.sm, // 8dp corner radius per Terra design
    paddingHorizontal: spacing.sm, // 8dp horizontal padding
    paddingVertical: spacing.xs, // 4dp vertical padding
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    minHeight: 32, // Ensure consistent height
  },
  pressable: {
    backgroundColor: colors.secondary.greenPale,
    borderColor: colors.primary.darkGreen,
  },
  selected: {
    backgroundColor: colors.primary.darkGreen,
    borderColor: colors.primary.darkGreen,
  },
  text: {
    ...typography.textStyles.caption, // 12px/16px, Medium, Letter spacing 0.2px
    color: colors.primary.darkGreen,
    fontWeight: typography.fontWeight.medium, // 500
  },
  selectedText: {
    color: colors.background.white,
  },
  removeButton: {
    marginLeft: spacing.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.functional.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: colors.background.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 14,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  emptyContainer: {
    paddingVertical: spacing.sm,
  },
  emptyText: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    fontStyle: 'italic',
  },
}); 