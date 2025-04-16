import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { Upload, Trash2, Camera } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/auth-store';
import { WebUploadAvatar } from './WebUploadAvatar';
import * as ImagePicker from 'expo-image-picker';

interface UploadAvatarProps {
  onAvatarChange?: (uri: string) => void;
}

export function UploadAvatar({ onAvatarChange }: UploadAvatarProps) {
  // Use WebUploadAvatar for web platform
  if (Platform.OS === 'web') {
    return <WebUploadAvatar onAvatarChange={onAvatarChange} />;
  }
  
  const { user, updateProfile } = useAuthStore();
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar || user?.photo);
  const [isUploading, setIsUploading] = useState(false);
  
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadImage(selectedImage.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadImage(selectedImage.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };
  
  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      
      // In a real app, you would upload the image to a server here
      // For this demo, we'll simulate a delay and then update the avatar
      setTimeout(async () => {
        // Update the avatar in the store
        await updateProfile({ 
          avatar: uri,
          photo: uri
        });
        
        setAvatar(uri);
        if (onAvatarChange) {
          onAvatarChange(uri);
        }
        setIsUploading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };
  
  const removeAvatar = async () => {
    try {
      setIsUploading(true);
      
      // In a real app, you would delete the image from the server here
      // For this demo, we'll simulate a delay and then remove the avatar
      setTimeout(async () => {
        await updateProfile({ 
          avatar: undefined,
          photo: undefined
        });
        setAvatar(undefined);
        if (onAvatarChange) {
          onAvatarChange('');
        }
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove avatar. Please try again.');
      setIsUploading(false);
    }
  };
  
  // Generate a default avatar URL based on the user's name
  const getDefaultAvatarUrl = () => {
    const name = user?.name || user?.firstName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;
  };
  
  const showImageOptions = () => {
    Alert.alert(
      'Upload Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={showImageOptions}
        disabled={isUploading}
      >
        <Image
          source={{ uri: avatar || getDefaultAvatarUrl() }}
          style={styles.avatar}
        />
        {isUploading ? (
          <View style={styles.uploadingOverlay}>
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        ) : (
          <View style={styles.cameraIconContainer}>
            <Camera size={24} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <Button
          title="Upload Photo"
          onPress={showImageOptions}
          disabled={isUploading}
          icon={<Upload size={18} color={colors.white} />}
          iconPosition="left"
          style={styles.uploadButton}
        />
        
        {avatar && (
          <Button
            title="Remove"
            onPress={removeAvatar}
            disabled={isUploading}
            variant="outline"
            icon={<Trash2 size={18} color={colors.danger} />}
            iconPosition="left"
            style={styles.removeButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButton: {
    minWidth: 140,
  },
  removeButton: {
    minWidth: 120,
    borderColor: colors.danger,
  },
});