import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react-native';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PasswordChangeForm({ onSuccess, onCancel }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Password validation states
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
  
  const isPasswordValid = 
    hasMinLength && 
    hasUppercase && 
    hasLowercase && 
    hasNumber && 
    hasSpecialChar;
  
  const isFormValid = 
    currentPassword.trim() !== '' && 
    isPasswordValid && 
    passwordsMatch;
  
  const handleChangePassword = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fix the errors in the form before submitting.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, you would call an API to change the password
      // For this demo, we'll simulate a delay and then complete the process
      setTimeout(() => {
        setIsLoading(false);
        
        Alert.alert(
          'Success',
          'Your password has been changed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) {
                  onSuccess();
                }
              },
            },
          ]
        );
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <View style={styles.validationItem}>
      <View style={[styles.validationIcon, isValid ? styles.validIconBg : styles.invalidIconBg]}>
        {isValid ? (
          <Check size={12} color={colors.white} />
        ) : (
          <X size={12} color={colors.white} />
        )}
      </View>
      <Text style={[styles.validationText, isValid ? styles.validText : styles.invalidText]}>
        {text}
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lock size={32} color={colors.primary} />
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Update your password to keep your account secure</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter your current password"
          secureTextEntry={!showCurrentPassword}
          leftIcon={<Lock size={20} color={colors.textSecondary} />}
          rightIcon={
            showCurrentPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )
          }
          onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
          style={styles.input}
        />
        
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (confirmPassword && confirmPassword !== text) {
              // If confirm password was already entered, update match status
              setPasswordFocused(true);
            }
          }}
          placeholder="Enter your new password"
          secureTextEntry={!showNewPassword}
          leftIcon={<Lock size={20} color={colors.textSecondary} />}
          rightIcon={
            showNewPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )
          }
          onRightIconPress={() => setShowNewPassword(!showNewPassword)}
          style={styles.input}
          onFocus={() => setPasswordFocused(true)}
        />
        
        {passwordFocused && (
          <View style={styles.validationContainer}>
            <ValidationItem isValid={hasMinLength} text="At least 8 characters" />
            <ValidationItem isValid={hasUppercase} text="At least one uppercase letter" />
            <ValidationItem isValid={hasLowercase} text="At least one lowercase letter" />
            <ValidationItem isValid={hasNumber} text="At least one number" />
            <ValidationItem isValid={hasSpecialChar} text="At least one special character" />
          </View>
        )}
        
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your new password"
          secureTextEntry={!showConfirmPassword}
          leftIcon={<Lock size={20} color={colors.textSecondary} />}
          rightIcon={
            showConfirmPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )
          }
          onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.input}
          error={confirmPassword && !passwordsMatch ? "Passwords don't match" : undefined}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Change Password"
            onPress={handleChangePassword}
            disabled={!isFormValid || isLoading}
            loading={isLoading}
            style={styles.submitButton}
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 0,
  },
  validationContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  validIconBg: {
    backgroundColor: colors.success,
  },
  invalidIconBg: {
    backgroundColor: colors.danger,
  },
  validationText: {
    fontSize: 14,
  },
  validText: {
    color: colors.success,
  },
  invalidText: {
    color: colors.danger,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
});