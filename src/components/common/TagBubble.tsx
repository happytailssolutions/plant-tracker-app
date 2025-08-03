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
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
  },
  pressable: {
    backgroundColor: colors.accent.blueLight,
    borderColor: colors.accent.blue,
  },
  selected: {
    backgroundColor: colors.primary.darkGreen,
    borderColor: colors.primary.darkGreen,
  },
  text: {
    ...typography.textStyles.caption,
    color: colors.primary.darkGreen,
    fontWeight: '500',
  },
  selectedText: {
    color: colors.background.white,
  },
  removeButton: {
    marginLeft: spacing.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.functional.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: colors.background.white,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12,
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