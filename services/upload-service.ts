import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/auth-store';

// Mock API URL - would be an environment variable in a real app
const API_URL = 'https://api.nexture.app/v1';

/**
 * Upload a file to the server
 */
export async function uploadFile(
  uri: string,
  fileType: 'avatar' | 'resume' | 'document' = 'avatar',
  onProgress?: (progress: number) => void
): Promise<string> {
  // For web platform, we handle uploads differently
  if (Platform.OS === 'web') {
    return uploadFileWeb(uri, fileType);
  }
  
  try {
    // Get auth token
    const token = useAuthStore.getState().token;
    const userId = useAuthStore.getState().user?.id;
    
    if (!token || !userId) {
      throw new Error('User not authenticated');
    }
    
    // In a real app, we would get a pre-signed URL from the server
    // For this demo, we'll simulate the upload
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 0.1;
      if (progress > 0.95) {
        clearInterval(progressInterval);
        progress = 0.95;
      }
      if (onProgress) {
        onProgress(progress);
      }
    }, 100);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear progress interval
    clearInterval(progressInterval);
    if (onProgress) {
      onProgress(1);
    }
    
    // For demo purposes, just return the original URI
    // In a real app, this would be the URL of the uploaded file
    return uri;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload a file from web
 */
async function uploadFileWeb(
  uri: string,
  fileType: 'avatar' | 'resume' | 'document'
): Promise<string> {
  try {
    // Get auth token
    const token = useAuthStore.getState().token;
    const userId = useAuthStore.getState().user?.id;
    
    if (!token || !userId) {
      throw new Error('User not authenticated');
    }
    
    // In a real app, we would upload the file to a server
    // For this demo, we'll simulate a successful upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, just return the original URI
    return uri;
  } catch (error) {
    console.error('Error uploading file from web:', error);
    throw error;
  }
}

/**
 * Delete a file from the server
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    // Get auth token
    const token = useAuthStore.getState().token;
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // In a real app, we would delete the file from the server
    // For this demo, we'll simulate a successful deletion
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Pick an image from the device's library
 */
export async function pickImage(options?: ImagePicker.ImagePickerOptions): Promise<string | null> {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Camera roll permission not granted');
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      ...options,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
}

/**
 * Take a photo with the device's camera
 */
export async function takePhoto(options?: ImagePicker.ImagePickerOptions): Promise<string | null> {
  try {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      ...options,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
}

/**
 * Get file info
 */
export async function getFileInfo(fileUri: string): Promise<FileSystem.FileInfo | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    return await FileSystem.getInfoAsync(fileUri);
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}