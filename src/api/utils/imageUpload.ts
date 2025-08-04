import { supabase } from '../supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
    
    // Skip bucket listing check since direct upload works
    // The bucket listing issue doesn't affect actual uploads
    // We'll handle bucket issues through upload error responses
    
    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert image to blob with better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log(`🔍 Fetching image from: ${imageUri}`);
      
      // Handle different URI schemes
      let fetchUri = imageUri;
      if (Platform.OS === 'android' && imageUri.startsWith('file://')) {
        // For Android file URIs, try without the file:// prefix
        fetchUri = imageUri.replace('file://', '');
        console.log(`📱 Android file URI detected, trying: ${fetchUri}`);
      }
      
      const response = await fetch(fetchUri, {
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
        
        // Handle specific bucket-related errors
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          throw new Error(`Bucket access error: ${error.message}. Please check if the 'images' bucket exists and has proper permissions.`);
        }
        
        // Handle permission errors
        if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          throw new Error(`Permission error: ${error.message}. Please check your authentication and bucket policies.`);
        }
        
        // Handle other errors
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
      console.log(`❌ Fetch failed: ${fetchError}`);
      
      // Fallback: Try using FileSystem for Android
      if (Platform.OS === 'android' && imageUri.startsWith('file://')) {
        try {
          console.log(`🔄 Trying FileSystem fallback for: ${imageUri}`);
          
          // Read file as base64
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Convert base64 to blob
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/jpeg' });
          
          console.log(`📦 Fallback blob created, size: ${blob.size} bytes`);
          
          // Upload to Supabase Storage
          console.log(`🚀 Uploading to Supabase (fallback): ${fileName}`);
          const { error } = await supabase.storage
            .from('images')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            console.error('❌ Supabase upload error (fallback):', error);
            
            // Handle specific bucket-related errors
            if (error.message.includes('bucket') || error.message.includes('not found')) {
              throw new Error(`Bucket access error: ${error.message}. Please check if the 'images' bucket exists and has proper permissions.`);
            }
            
            // Handle permission errors
            if (error.message.includes('permission') || error.message.includes('unauthorized')) {
              throw new Error(`Permission error: ${error.message}. Please check your authentication and bucket policies.`);
            }
            
            // Handle other errors
            throw new Error(`Failed to upload image: ${error.message}`);
          }

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

          console.log(`✅ Image uploaded successfully (fallback): ${urlData.publicUrl}`);
          
          return {
            url: urlData.publicUrl,
            path: fileName,
          };
          
        } catch (fallbackError) {
          console.error('❌ Fallback method also failed:', fallbackError);
          throw new Error(`Both fetch and FileSystem methods failed: ${fetchError.message}`);
        }
      }
      
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

/**
 * Detailed bucket diagnostic function
 */
export const diagnoseBucketIssue = async (): Promise<void> => {
  console.log('🔍 Starting detailed bucket diagnosis...');
  
  try {
    // Test 1: Check if we can list buckets at all
    console.log('1️⃣ Testing bucket listing...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Cannot list buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Can list buckets');
    console.log('📦 All buckets:', buckets?.map(b => ({ name: b.name, public: b.public })) || []);
    
    // Test 2: Try to access the images bucket directly
    console.log('2️⃣ Testing direct images bucket access...');
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 });
    
    if (filesError) {
      console.error('❌ Cannot access images bucket:', filesError);
      console.log('🔍 Error details:', {
        message: filesError.message,
        details: filesError.details,
        hint: filesError.hint
      });
    } else {
      console.log('✅ Can access images bucket directly');
      console.log('📁 Files in bucket:', files?.length || 0);
    }
    
    // Test 3: Check authentication
    console.log('3️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication error:', authError);
    } else if (!user) {
      console.warn('⚠️ No authenticated user');
    } else {
      console.log('✅ Authenticated as:', user.email);
    }
    
    // Test 4: Try a simple upload test
    console.log('4️⃣ Testing simple upload...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'test';
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      console.log('🔍 Upload error details:', {
        message: uploadError.message,
        details: uploadError.details,
        hint: uploadError.hint
      });
    } else {
      console.log('✅ Test upload successful');
      
      // Clean up test file
      await supabase.storage.from('images').remove([testFileName]);
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('🎉 Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}; 

/**
 * Diagnostic function to run when uploads fail
 */
export const diagnoseUploadFailure = async (): Promise<{ issue: string; solution: string }> => {
  console.log('🔍 Diagnosing upload failure...');
  
  try {
    // Test 1: Check if bucket exists by trying to list files
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('', { limit: 1 });
    
    if (listError) {
      if (listError.message.includes('bucket') || listError.message.includes('not found')) {
        return {
          issue: 'Bucket does not exist',
          solution: 'Create a bucket named "images" in your Supabase Storage dashboard'
        };
      }
      if (listError.message.includes('permission') || listError.message.includes('unauthorized')) {
        return {
          issue: 'Permission denied',
          solution: 'Check your bucket policies and ensure you are authenticated'
        };
      }
    }
    
    // Test 2: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        issue: 'Authentication failed',
        solution: 'Please log in again to refresh your authentication token'
      };
    }
    
    // Test 3: Try a simple upload
    const testFileName = `diagnostic-${Date.now()}.txt`;
    const testContent = 'diagnostic test';
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      return {
        issue: 'Upload permission denied',
        solution: 'Check your bucket INSERT policy allows authenticated users'
      };
    }
    
    // Clean up test file
    await supabase.storage.from('images').remove([testFileName]);
    
    return {
      issue: 'Unknown issue',
      solution: 'Upload should work. Please try again or contact support.'
    };
    
  } catch (error) {
    return {
      issue: 'Network or configuration error',
      solution: 'Check your internet connection and Supabase configuration'
    };
  }
};

/**
 * Direct upload test that bypasses bucket listing
 */
export const testDirectUpload = async (): Promise<void> => {
  console.log('🚀 Testing direct upload (bypassing bucket listing)...');
  
  try {
    // Test 1: Try to upload directly without checking bucket existence
    console.log('1️⃣ Attempting direct upload...');
    const testFileName = `direct-test-${Date.now()}.txt`;
    const testContent = 'direct upload test';
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Direct upload failed:', uploadError);
      console.log('🔍 Upload error details:', {
        message: uploadError.message,
        details: uploadError.details,
        hint: uploadError.hint,
        statusCode: uploadError.statusCode
      });
    } else {
      console.log('✅ Direct upload successful!');
      
      // Clean up test file
      await supabase.storage.from('images').remove([testFileName]);
      console.log('🧹 Test file cleaned up');
    }
    
    // Test 2: Try to list files in the bucket (not buckets)
    console.log('2️⃣ Testing file listing within bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list('', { limit: 10 });
    
    if (listError) {
      console.error('❌ File listing failed:', listError);
    } else {
      console.log('✅ File listing successful');
      console.log('📁 Files in bucket:', files?.length || 0);
    }
    
    console.log('🎉 Direct upload test complete!');
    
  } catch (error) {
    console.error('❌ Direct upload test failed:', error);
  }
}; 