import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Diagnostic function to check Supabase configuration
 */
export const checkSupabaseConfig = async (): Promise<{ valid: boolean; error?: string }> => {
  try {
    console.log('🔍 Checking Supabase configuration...');
    
    // Check if supabase client is properly configured
    if (!supabase) {
      return { valid: false, error: 'Supabase client not initialized' };
    }
    
    // Check if we can access storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Supabase storage error:', bucketsError);
      return { valid: false, error: `Storage access error: ${bucketsError.message}` };
    }
    
    console.log('✅ Supabase storage accessible');
    console.log('📦 Available buckets:', buckets?.map(b => b.name) || []);
    
    // Check if 'images' bucket exists
    const imagesBucket = buckets?.find(b => b.name === 'images');
    if (!imagesBucket) {
      return { valid: false, error: 'Images bucket not found. Please create a bucket named "images" in Supabase.' };
    }
    
    console.log('✅ Images bucket found');
    
    // Test upload permissions with a small test
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'test';
    
    const { error: testError } = await supabase.storage
      .from('images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (testError) {
      console.error('❌ Test upload failed:', testError);
      return { valid: false, error: `Upload permission error: ${testError.message}` };
    }
    
    // Clean up test file
    await supabase.storage.from('images').remove([testFileName]);
    
    console.log('✅ Upload permissions verified');
    return { valid: true };
    
  } catch (error) {
    console.error('❌ Configuration check failed:', error);
    return { valid: false, error: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

/**
 * Manual test function to diagnose Supabase configuration
 * Call this function to test if Supabase is properly configured
 */
export const testSupabaseConnection = async (): Promise<void> => {
  console.log('🧪 Starting Supabase connection test...');
  
  try {
    // Test 1: Check basic configuration
    console.log('1️⃣ Testing basic configuration...');
    const configCheck = await checkSupabaseConfig();
    
    if (!configCheck.valid) {
      console.error('❌ Configuration test failed:', configCheck.error);
      return;
    }
    
    console.log('✅ Configuration test passed');
    
    // Test 2: Test authentication
    console.log('2️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication test failed:', authError.message);
    } else if (!user) {
      console.warn('⚠️ No authenticated user found');
    } else {
      console.log('✅ Authentication test passed');
    }
    
    // Test 3: Test storage bucket access
    console.log('3️⃣ Testing storage bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('pins', { limit: 1 });
    
    if (listError) {
      console.error('❌ Storage list test failed:', listError.message);
    } else {
      console.log('✅ Storage list test passed');
      console.log(`📁 Found ${files?.length || 0} files in pins folder`);
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

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
    console.log(`📤 Uploading image: ${imageUri} (attempt ${retryCount + 1})`);
    
    // Check configuration on first attempt
    if (retryCount === 0) {
      const configCheck = await checkSupabaseConfig();
      if (!configCheck.valid) {
        throw new Error(configCheck.error);
      }
    }
    
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
      console.log(`📦 Image blob created, size: ${blob.size} bytes`);
      
      // Upload to Supabase Storage
      console.log(`🚀 Uploading to Supabase: ${fileName}`);
      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      console.log(`✅ Image uploaded successfully: ${urlData.publicUrl}`);
      
      return {
        url: urlData.publicUrl,
        path: fileName,
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
  } catch (error) {
    console.error(`❌ Error uploading image (attempt ${retryCount + 1}):`, error);
    
    // Retry logic for network errors
    if (retryCount < maxRetries && (
      error instanceof Error && (
        error.message.includes('Network request failed') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('aborted')
      )
    )) {
      console.log(`🔄 Retrying upload in ${(retryCount + 1) * 2} seconds...`);
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