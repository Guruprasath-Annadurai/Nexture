import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Upload, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/auth-store';

interface WebUploadAvatarProps {
  onAvatarChange?: (uri: string) => void;
}

export function WebUploadAvatar({ onAvatarChange }: WebUploadAvatarProps) {
  const { user, updateProfile } = useAuthStore();
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar || user?.photo);
  const [isUploading, setIsUploading] = useState(false);
  
  // Function to handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Only image files are allowed');
        return;
      }
      
      setIsUploading(true);
      
      // Create a FileReader to read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const dataUrl = e.target.result as string;
          
          // In a real app, you would upload the file to a server here
          // For this demo, we'll simulate a delay and then update the avatar
          setTimeout(async () => {
            // Update the avatar in the store
            await updateProfile({ 
              avatar: dataUrl,
              photo: dataUrl
            });
            
            setAvatar(dataUrl);
            if (onAvatarChange) {
              onAvatarChange(dataUrl);
            }
            setIsUploading(false);
          }, 1500);
        }
      };
      
      reader.onerror = () => {
        alert('Failed to read file');
        setIsUploading(false);
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
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
      alert('Failed to remove avatar');
      setIsUploading(false);
    }
  };
  
  // Generate a default avatar URL based on the user's name
  const getDefaultAvatarUrl = () => {
    const name = user?.name || user?.firstName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: avatar || getDefaultAvatarUrl() }}
          style={styles.avatar}
        />
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => {
            // Create a file input element
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = handleFileChange as any;
            input.click();
          }}
          disabled={isUploading}
        >
          <Upload size={18} color={colors.white} />
          <Text style={styles.uploadButtonText}>Upload Photo</Text>
        </TouchableOpacity>
        
        {avatar && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={removeAvatar}
            disabled={isUploading}
          >
            <Trash2 size={18} color={colors.danger} />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  removeButtonText: {
    color: colors.danger,
    fontWeight: '600',
  },
});