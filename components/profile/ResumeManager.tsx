import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, Platform } from 'react-native';
import { X, FileText, Upload, Download, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/stores/user-store';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';

interface ResumeManagerProps {
  resumeUrl?: string;
  resumeName?: string;
  onClose: () => void;
}

export function ResumeManager({ resumeUrl, resumeName, onClose }: ResumeManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { uploadResume, deleteResume } = useUserStore();
  
  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'File size exceeds 5MB limit');
        return;
      }
      
      setIsUploading(true);
      
      try {
        // For web, we'd use FormData, but for native we can use FileSystem
        if (Platform.OS === 'web') {
          // Mock implementation for web
          await new Promise(resolve => setTimeout(resolve, 1500));
          await uploadResume({
            name: file.name,
            url: URL.createObjectURL(file as any),
            size: file.size,
            type: file.mimeType,
          });
        } else {
          // For native platforms
          const fileInfo = await FileSystem.getInfoAsync(file.uri);
          
          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }
          
          // In a real app, you would upload to a server here
          // For this demo, we'll just simulate a successful upload
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          await uploadResume({
            name: file.name,
            url: file.uri,
            size: file.size,
            type: file.mimeType,
          });
        }
        
        Alert.alert('Success', 'Resume uploaded successfully');
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload resume');
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick document');
    }
  };
  
  const handleViewResume = async () => {
    if (!resumeUrl) {
      Alert.alert('Error', 'No resume available');
      return;
    }
    
    try {
      await Linking.openURL(resumeUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open the resume');
    }
  };
  
  const handleDeleteResume = async () => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete your resume?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteResume();
              Alert.alert('Success', 'Resume deleted successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete resume');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Resume Management</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {resumeUrl ? (
              <>
                <View style={styles.resumeInfo}>
                  <FileText size={40} color={colors.primary} />
                  <View style={styles.resumeDetails}>
                    <Text style={styles.resumeName}>{resumeName || 'Resume'}</Text>
                    <Text style={styles.resumeDate}>Uploaded on {new Date().toLocaleDateString()}</Text>
                  </View>
                </View>
                
                <View style={styles.actions}>
                  <Button
                    title="View"
                    variant="outline"
                    icon={<Download size={16} color={colors.primary} />}
                    onPress={handleViewResume}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Replace"
                    variant="outline"
                    icon={<Upload size={16} color={colors.primary} />}
                    onPress={handleUploadResume}
                    loading={isUploading}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Delete"
                    variant="outline"
                    icon={<Trash2 size={16} color={colors.error} />}
                    onPress={handleDeleteResume}
                    loading={isDeleting}
                    style={[styles.actionButton, styles.deleteButton]}
                    textStyle={{ color: colors.error }}
                  />
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <FileText size={64} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No resume uploaded yet</Text>
                <Text style={styles.emptySubtext}>
                  Upload your resume to apply for jobs more quickly
                </Text>
                <Button
                  title="Upload Resume"
                  icon={<Upload size={16} color="white" />}
                  onPress={handleUploadResume}
                  loading={isUploading}
                  style={styles.uploadButton}
                />
              </View>
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    gap: 20,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  resumeDetails: {
    flex: 1,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  resumeDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    marginTop: 12,
    minWidth: 200,
  },
});