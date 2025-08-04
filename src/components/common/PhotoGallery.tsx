import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

interface PhotoGalleryProps {
  photos: string[];
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  maxPhotos?: number;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 6,
}) => {
  const handleAddPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Photo Limit Reached',
        `You can only add up to ${maxPhotos} photos.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    onAddPhoto();
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemovePhoto(index) },
      ]
    );
  };

  const renderPhotoGrid = () => {
    const photoItems = [];
    const totalSlots = Math.min(photos.length + 1, maxPhotos);

    // Render existing photos
    for (let i = 0; i < photos.length; i++) {
      photoItems.push(
        <View key={`photo-${i}`} style={styles.photoContainer}>
          <Image source={{ uri: photos[i] }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemovePhoto(i)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render add button if there's space
    if (photos.length < maxPhotos) {
      photoItems.push(
        <TouchableOpacity
          key="add-photo"
          style={styles.addPhotoButton}
          onPress={handleAddPhoto}
        >
          <Text style={styles.addPhotoIcon}>📷</Text>
          <Text style={styles.addPhotoText}>Add Photo</Text>
        </TouchableOpacity>
      );
    }

    return photoItems;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.cameraIcon}>📷</Text>
      <Text style={styles.emptyTitle}>No Photos</Text>
      <Text style={styles.emptySubtitle}>
        Add photos to document your plant's progress
      </Text>
      <TouchableOpacity style={styles.addFirstPhotoButton} onPress={handleAddPhoto}>
        <Text style={styles.addFirstPhotoText}>Add First Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <Text style={styles.subtitle}>
          {photos.length}/{maxPhotos} photos
        </Text>
      </View>

      {photos.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.gridContainer}>
          {renderPhotoGrid()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.functional.darkGray,
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.white,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary.greenPale,
    borderStyle: 'dashed',
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.textStyles.h4,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addFirstPhotoButton: {
    backgroundColor: colors.primary.darkGreen,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  addFirstPhotoText: {
    ...typography.textStyles.button,
    color: colors.background.white,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoContainer: {
    position: 'relative',
    width: (spacing.xxl * 2) - spacing.sm,
    height: (spacing.xxl * 2) - spacing.sm,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.sm,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.functional.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.background.white,
    fontSize: 12,
    fontWeight: '600',
  },
  addPhotoButton: {
    width: (spacing.xxl * 2) - spacing.sm,
    height: (spacing.xxl * 2) - spacing.sm,
    backgroundColor: colors.secondary.greenPale,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderColor: colors.secondary.greenPale,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  addPhotoText: {
    ...typography.textStyles.caption,
    color: colors.functional.neutral,
    textAlign: 'center',
  },
}); 