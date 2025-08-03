import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, components } from '../../styles/theme';
import { Pin } from '../../api/queries/pinQueries';
import { TagBubbleList } from '../common';
import { getCurrentTags } from '../../utils/tagUtils';

interface PinListItemProps {
  pin: Pin;
  onPress: (pin: Pin) => void;
  onTagPress: (tag: string) => void;
}

export const PinListItem: React.FC<PinListItemProps> = ({
  pin,
  onPress,
  onTagPress,
}) => {
  const tags = getCurrentTags(pin);
  const photos = (pin.metadata as any)?.photos || [];
  const firstPhoto = photos.length > 0 ? photos[0] : null;

  const getPinTypeColor = (pinType: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(pin)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left side - Image */}
        <View style={styles.imageContainer}>
          {firstPhoto ? (
            <Image source={{ uri: firstPhoto }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: getPinTypeColor(pin.pinType) }]}>
              <Text style={styles.placeholderText}>{pin.pinType.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Right side - Content */}
        <View style={styles.textContainer}>
          {/* Pin name and type */}
          <View style={styles.headerRow}>
            <Text style={styles.pinName} numberOfLines={1}>
              {pin.name}
            </Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: getPinTypeColor(pin.pinType) },
              ]}
            >
              <Text style={styles.typeText}>{pin.pinType}</Text>
            </View>
          </View>

          {/* Project name */}
          <Text style={styles.projectName} numberOfLines={1}>
            {pin.project.name}
          </Text>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <TagBubbleList
                tags={tags.slice(0, 3)} // Show only first 3 tags
                onTagPress={onTagPress}
                onTagRemove={() => {}} // No remove functionality in list view
                removable={false}
              />
              {tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{tags.length - 3} more</Text>
              )}
            </View>
          )}

          {/* Date */}
          <Text style={styles.dateText}>
            {formatDate(pin.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.functional.darkGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  imageContainer: {
    marginRight: spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: spacing.sm,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.textStyles.h3,
    color: colors.background.white,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  pinName: {
    ...typography.textStyles.h3,
    color: colors.primary.darkGreen,
    flex: 1,
    marginRight: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  typeText: {
    ...typography.textStyles.caption,
    color: colors.background.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectName: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    marginBottom: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moreTagsText: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    marginLeft: spacing.xs,
  },
  dateText: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
  },
}); 