import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../styles/theme';
import { pickImages, takePhoto } from '../../api/utils/imageUpload';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}) => {
  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Maximum Images', `You can only add up to ${maxImages} images.`);
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const photoUri = await takePhoto();
              if (photoUri) {
                onImagesChange([...images, photoUri]);
              }
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to take photo');
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              const remainingSlots = maxImages - images.length;
              const selectedImages = await pickImages(remainingSlots);
              if (selectedImages.length > 0) {
                onImagesChange([...images, ...selectedImages]);
              }
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick images');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleImagePress = (index: number) => {
    Alert.alert(
      'Image Options',
      'What would you like to do with this image?',
      [
        { text: 'View', onPress: () => console.log('View image', index) },
        { 
          text: 'Remove', 
          onPress: () => handleRemoveImage(index),
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos</Text>
      <Text style={styles.subtitle}>
        Add photos to document your pin ({images.length}/{maxImages})
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.imageContainer}
        contentContainerStyle={styles.imageContent}
      >
        {/* Existing Images */}
        {images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => handleImagePress(index)}
              disabled={disabled}
            >
              <Image
                source={{ uri: image }}
                style={styles.image}
                defaultSource={require('../../../assets/images/icon.png')}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
                disabled={disabled}
              >
                <Ionicons name="close-circle" size={20} color={colors.functional.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={[styles.addButton, disabled && styles.addButtonDisabled]}
            onPress={handleAddImage}
            disabled={disabled}
          >
            <Ionicons 
              name="camera-outline" 
              size={24} 
              color={disabled ? colors.functional.neutral : colors.primary.darkGreen} 
            />
            <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>
              Add Photo
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.functional.darkGray,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.functional.neutral,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    flexGrow: 0,
  },
  imageContent: {
    paddingRight: spacing.md,
  },
  imageWrapper: {
    marginRight: spacing.sm,
  },
  imageButton: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background.light,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.white,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowColor: '#000000',
    elevation: 2,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary.darkGreen,
    borderStyle: 'dashed',
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  addButtonDisabled: {
    borderColor: colors.functional.neutral,
    backgroundColor: colors.background.light,
  },
  addButtonText: {
    ...typography.textStyles.caption,
    color: colors.primary.darkGreen,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  addButtonTextDisabled: {
    color: colors.functional.neutral,
  },
});

export default ImagePicker; 