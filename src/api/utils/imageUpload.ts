import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Upload a single image to Supabase Storage with retry logic
 */
export const uploadImageToStorage = async (
  imageUri: string,
  folder: string = 'pins',
  retryCount: number = 0
): Promise<UploadedImage> => {
  const maxRetries = 3;
  
  try {
    console.log(`Uploading image: ${imageUri} (attempt ${retryCount + 1})`);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert image to blob with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(imageUri, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log(`Image blob created, size: ${blob.size} bytes`);
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      console.log(`Image uploaded successfully: ${urlData.publicUrl}`);
      
      return {
        url: urlData.publicUrl,
        path: fileName,
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
  } catch (error) {
    console.error(`Error uploading image (attempt ${retryCount + 1}):`, error);
    
    // Retry logic for network errors
    if (retryCount < maxRetries && (
      error instanceof Error && (
        error.message.includes('Network request failed') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('aborted')
      )
    )) {
      console.log(`Retrying upload in ${(retryCount + 1) * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return uploadImageToStorage(imageUri, folder, retryCount + 1);
    }
    
    throw new Error(`Failed to upload image after ${retryCount + 1} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple images to Supabase Storage
 */
export const uploadImagesToStorage = async (
  imageUris: string[],
  folder: string = 'pins'
): Promise<UploadedImage[]> => {
  console.log(`Starting upload of ${imageUris.length} images`);
  
  const results: UploadedImage[] = [];
  const errors: string[] = [];
  
  // Upload images sequentially to avoid overwhelming the server
  for (let i = 0; i < imageUris.length; i++) {
    try {
      console.log(`Uploading image ${i + 1}/${imageUris.length}`);
      const result = await uploadImageToStorage(imageUris[i], folder);
      results.push(result);
    } catch (error) {
      const errorMessage = `Failed to upload image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);
      errors.push(errorMessage);
    }
  }
  
  if (errors.length > 0) {
    console.error('Some images failed to upload:', errors);
    throw new Error(`Failed to upload ${errors.length} out of ${imageUris.length} images: ${errors.join(', ')}`);
  }
  
  console.log(`Successfully uploaded all ${results.length} images`);
  return results;
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