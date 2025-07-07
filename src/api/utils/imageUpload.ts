import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Upload a single image to Supabase Storage
 */
export const uploadImageToStorage = async (
  imageUri: string,
  folder: string = 'pins'
): Promise<UploadedImage> => {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple images to Supabase Storage
 */
export const uploadImagesToStorage = async (
  imageUris: string[],
  folder: string = 'pins'
): Promise<UploadedImage[]> => {
  const uploadPromises = imageUris.map(uri => uploadImageToStorage(uri, folder));
  return Promise.all(uploadPromises);
};

/**
 * Pick images from device gallery or camera
 */
export const pickImages = async (maxImages: number = 5): Promise<string[]> => {
  try {
    // Request permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera roll is required!');
      }
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      return result.assets.map(asset => asset.uri);
    }

    return [];
  } catch (error) {
    console.error('Error picking images:', error);
    throw new Error(`Failed to pick images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Take a photo using the camera
 */
export const takePhoto = async (): Promise<string | null> => {
  try {
    // Request permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera is required!');
      }
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    throw new Error(`Failed to take photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 